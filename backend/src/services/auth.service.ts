/**
 * Authentication Service
 * 
 * Handles user authentication and authorization using Amazon Cognito.
 * Manages user sessions, role-based access control, and token validation.
 */

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  GetUserCommand
} from '@aws-sdk/client-cognito-identity-provider';

import config from '../config/aws.config';
import logger from '../utils/logger';
import { AuthenticationError, AuthorizationError, ValidationError } from '../utils/errors';
import { UserSession, UserRole } from '../types/triage.types';

/**
 * Login credentials
 */
interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Registration data
 */
interface RegistrationData {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  district: string;
  state: string;
  assignedPhc?: string;
}

/**
 * Authentication Service Class
 */
export class AuthService {
  private client: CognitoIdentityProviderClient;
  
  constructor() {
    this.client = new CognitoIdentityProviderClient({ region: config.cognito.region });
  }
  
  /**
   * Authenticate user with username and password
   * 
   * @param credentials - Login credentials
   * @returns User session with tokens
   */
  async login(credentials: LoginCredentials): Promise<UserSession> {
    try {
      logger.info('User login attempt', { username: credentials.username });
      
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: config.cognito.clientId,
        AuthParameters: {
          USERNAME: credentials.username,
          PASSWORD: credentials.password
        }
      });
      
      const response = await this.client.send(command);
      
      if (!response.AuthenticationResult) {
        throw new AuthenticationError('Authentication failed');
      }
      
      const { IdToken, AccessToken, ExpiresIn } = response.AuthenticationResult;
      
      if (!IdToken || !AccessToken) {
        throw new AuthenticationError('Invalid authentication response');
      }
      
      // Get user details
      const userDetails = await this.getUserDetails(AccessToken);
      
      const session: UserSession = {
        userId: userDetails.userId,
        role: userDetails.role,
        name: userDetails.name,
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber,
        assignedPhc: userDetails.assignedPhc,
        district: userDetails.district,
        state: userDetails.state,
        sessionToken: AccessToken,
        expiresAt: new Date(Date.now() + (ExpiresIn || 3600) * 1000).toISOString()
      };
      
      logger.info('User login successful', {
        userId: session.userId,
        role: session.role
      });
      
      return session;
      
    } catch (error) {
      logger.error('Login failed', error as Error, {
        username: credentials.username
      });
      throw new AuthenticationError('Invalid username or password');
    }
  }
  
  /**
   * Register new user
   * 
   * @param data - Registration data
   * @returns User ID
   */
  async register(data: RegistrationData): Promise<string> {
    try {
      logger.info('User registration attempt', {
        username: data.username,
        role: data.role
      });
      
      // Validate role
      if (!['asha_worker', 'phc_doctor', 'admin'].includes(data.role)) {
        throw new ValidationError('Invalid user role');
      }
      
      const command = new SignUpCommand({
        ClientId: config.cognito.clientId,
        Username: data.username,
        Password: data.password,
        UserAttributes: [
          { Name: 'email', Value: data.email },
          { Name: 'phone_number', Value: data.phoneNumber },
          { Name: 'custom:role', Value: data.role },
          { Name: 'custom:district', Value: data.district },
          { Name: 'custom:state', Value: data.state },
          { Name: 'custom:assigned_phc', Value: data.assignedPhc || '' }
        ]
      });
      
      const response = await this.client.send(command);
      
      if (!response.UserSub) {
        throw new Error('User registration failed');
      }
      
      logger.info('User registration successful', {
        userId: response.UserSub,
        username: data.username,
        role: data.role
      });
      
      return response.UserSub;
      
    } catch (error) {
      logger.error('Registration failed', error as Error, {
        username: data.username
      });
      throw new ValidationError('Registration failed', {
        error: (error as Error).message
      });
    }
  }
  
  /**
   * Confirm user registration with verification code
   * 
   * @param username - Username
   * @param code - Verification code
   */
  async confirmRegistration(username: string, code: string): Promise<void> {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: config.cognito.clientId,
        Username: username,
        ConfirmationCode: code
      });
      
      await this.client.send(command);
      
      logger.info('User registration confirmed', { username });
      
    } catch (error) {
      logger.error('Registration confirmation failed', error as Error, { username });
      throw new ValidationError('Invalid verification code');
    }
  }
  
  /**
   * Get user details from access token
   * 
   * @param accessToken - Cognito access token
   * @returns User details
   */
  private async getUserDetails(accessToken: string): Promise<{
    userId: string;
    role: UserRole;
    name: string;
    email: string;
    phoneNumber?: string;
    assignedPhc?: string;
    district: string;
    state: string;
  }> {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken
      });
      
      const response = await this.client.send(command);
      
      const attributes = response.UserAttributes || [];
      const getAttribute = (name: string) => 
        attributes.find(attr => attr.Name === name)?.Value || '';
      
      return {
        userId: response.Username || '',
        role: getAttribute('custom:role') as UserRole || 'asha_worker',
        name: getAttribute('name') || getAttribute('email'),
        email: getAttribute('email'),
        phoneNumber: getAttribute('phone_number'),
        assignedPhc: getAttribute('custom:assigned_phc'),
        district: getAttribute('custom:district'),
        state: getAttribute('custom:state')
      };
      
    } catch (error) {
      logger.error('Failed to get user details', error as Error);
      throw new AuthenticationError('Invalid access token');
    }
  }
  
  /**
   * Validate access token and return user session
   * 
   * @param accessToken - Cognito access token
   * @returns User session
   */
  async validateToken(accessToken: string): Promise<UserSession> {
    try {
      const userDetails = await this.getUserDetails(accessToken);
      
      return {
        userId: userDetails.userId,
        role: userDetails.role,
        name: userDetails.name,
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber,
        assignedPhc: userDetails.assignedPhc,
        district: userDetails.district,
        state: userDetails.state,
        sessionToken: accessToken,
        expiresAt: new Date(Date.now() + config.app.sessionTimeoutMinutes * 60 * 1000).toISOString()
      };
      
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }
  
  /**
   * Check if user has required role
   * 
   * @param session - User session
   * @param requiredRole - Required role
   * @returns True if authorized
   */
  authorize(session: UserSession, requiredRole: UserRole | UserRole[]): boolean {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(session.role);
  }
  
  /**
   * Require specific role or throw authorization error
   * 
   * @param session - User session
   * @param requiredRole - Required role
   */
  requireRole(session: UserSession, requiredRole: UserRole | UserRole[]): void {
    if (!this.authorize(session, requiredRole)) {
      throw new AuthorizationError(
        `Access denied. Required role: ${Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}`
      );
    }
  }
  
  /**
   * Extract token from Authorization header
   * 
   * @param authHeader - Authorization header value
   * @returns Access token
   */
  extractToken(authHeader?: string): string {
    if (!authHeader) {
      throw new AuthenticationError('Missing authorization header');
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Invalid authorization header format');
    }
    
    return parts[1];
  }
}

/**
 * Export singleton instance
 */
export const authService = new AuthService();
export default authService;
