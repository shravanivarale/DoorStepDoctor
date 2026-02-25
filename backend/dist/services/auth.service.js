"use strict";
/**
 * Authentication Service
 *
 * Handles user authentication and authorization using Amazon Cognito.
 * Manages user sessions, role-based access control, and token validation.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const aws_config_1 = __importDefault(require("../config/aws.config"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
/**
 * Authentication Service Class
 */
class AuthService {
    constructor() {
        this.client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({ region: aws_config_1.default.cognito.region });
    }
    /**
     * Authenticate user with username and password
     *
     * @param credentials - Login credentials
     * @returns User session with tokens
     */
    async login(credentials) {
        try {
            logger_1.default.info('User login attempt', { username: credentials.username });
            const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: aws_config_1.default.cognito.clientId,
                AuthParameters: {
                    USERNAME: credentials.username,
                    PASSWORD: credentials.password
                }
            });
            const response = await this.client.send(command);
            if (!response.AuthenticationResult) {
                throw new errors_1.AuthenticationError('Authentication failed');
            }
            const { IdToken, AccessToken, ExpiresIn } = response.AuthenticationResult;
            if (!IdToken || !AccessToken) {
                throw new errors_1.AuthenticationError('Invalid authentication response');
            }
            // Get user details
            const userDetails = await this.getUserDetails(AccessToken);
            const session = {
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
            logger_1.default.info('User login successful', {
                userId: session.userId,
                role: session.role
            });
            return session;
        }
        catch (error) {
            logger_1.default.error('Login failed', error, {
                username: credentials.username
            });
            throw new errors_1.AuthenticationError('Invalid username or password');
        }
    }
    /**
     * Register new user
     *
     * @param data - Registration data
     * @returns User ID
     */
    async register(data) {
        try {
            logger_1.default.info('User registration attempt', {
                username: data.username,
                role: data.role
            });
            // Validate role
            if (!['asha_worker', 'phc_doctor', 'admin'].includes(data.role)) {
                throw new errors_1.ValidationError('Invalid user role');
            }
            const command = new client_cognito_identity_provider_1.SignUpCommand({
                ClientId: aws_config_1.default.cognito.clientId,
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
            logger_1.default.info('User registration successful', {
                userId: response.UserSub,
                username: data.username,
                role: data.role
            });
            return response.UserSub;
        }
        catch (error) {
            logger_1.default.error('Registration failed', error, {
                username: data.username
            });
            throw new errors_1.ValidationError('Registration failed', {
                error: error.message
            });
        }
    }
    /**
     * Confirm user registration with verification code
     *
     * @param username - Username
     * @param code - Verification code
     */
    async confirmRegistration(username, code) {
        try {
            const command = new client_cognito_identity_provider_1.ConfirmSignUpCommand({
                ClientId: aws_config_1.default.cognito.clientId,
                Username: username,
                ConfirmationCode: code
            });
            await this.client.send(command);
            logger_1.default.info('User registration confirmed', { username });
        }
        catch (error) {
            logger_1.default.error('Registration confirmation failed', error, { username });
            throw new errors_1.ValidationError('Invalid verification code');
        }
    }
    /**
     * Get user details from access token
     *
     * @param accessToken - Cognito access token
     * @returns User details
     */
    async getUserDetails(accessToken) {
        try {
            const command = new client_cognito_identity_provider_1.GetUserCommand({
                AccessToken: accessToken
            });
            const response = await this.client.send(command);
            const attributes = response.UserAttributes || [];
            const getAttribute = (name) => attributes.find(attr => attr.Name === name)?.Value || '';
            return {
                userId: response.Username || '',
                role: getAttribute('custom:role') || 'asha_worker',
                name: getAttribute('name') || getAttribute('email'),
                email: getAttribute('email'),
                phoneNumber: getAttribute('phone_number'),
                assignedPhc: getAttribute('custom:assigned_phc'),
                district: getAttribute('custom:district'),
                state: getAttribute('custom:state')
            };
        }
        catch (error) {
            logger_1.default.error('Failed to get user details', error);
            throw new errors_1.AuthenticationError('Invalid access token');
        }
    }
    /**
     * Validate access token and return user session
     *
     * @param accessToken - Cognito access token
     * @returns User session
     */
    async validateToken(accessToken) {
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
                expiresAt: new Date(Date.now() + aws_config_1.default.app.sessionTimeoutMinutes * 60 * 1000).toISOString()
            };
        }
        catch (error) {
            throw new errors_1.AuthenticationError('Invalid or expired token');
        }
    }
    /**
     * Check if user has required role
     *
     * @param session - User session
     * @param requiredRole - Required role
     * @returns True if authorized
     */
    authorize(session, requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        return roles.includes(session.role);
    }
    /**
     * Require specific role or throw authorization error
     *
     * @param session - User session
     * @param requiredRole - Required role
     */
    requireRole(session, requiredRole) {
        if (!this.authorize(session, requiredRole)) {
            throw new errors_1.AuthorizationError(`Access denied. Required role: ${Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}`);
        }
    }
    /**
     * Extract token from Authorization header
     *
     * @param authHeader - Authorization header value
     * @returns Access token
     */
    extractToken(authHeader) {
        if (!authHeader) {
            throw new errors_1.AuthenticationError('Missing authorization header');
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new errors_1.AuthenticationError('Invalid authorization header format');
        }
        return parts[1];
    }
}
exports.AuthService = AuthService;
/**
 * Export singleton instance
 */
exports.authService = new AuthService();
exports.default = exports.authService;
//# sourceMappingURL=auth.service.js.map