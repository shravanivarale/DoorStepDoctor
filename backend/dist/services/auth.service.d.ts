/**
 * Authentication Service
 *
 * Handles user authentication and authorization using Amazon Cognito.
 * Manages user sessions, role-based access control, and token validation.
 */
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
export declare class AuthService {
    private client;
    constructor();
    /**
     * Authenticate user with username and password
     *
     * @param credentials - Login credentials
     * @returns User session with tokens
     */
    login(credentials: LoginCredentials): Promise<UserSession>;
    /**
     * Register new user
     *
     * @param data - Registration data
     * @returns User ID
     */
    register(data: RegistrationData): Promise<string>;
    /**
     * Confirm user registration with verification code
     *
     * @param username - Username
     * @param code - Verification code
     */
    confirmRegistration(username: string, code: string): Promise<void>;
    /**
     * Get user details from access token
     *
     * @param accessToken - Cognito access token
     * @returns User details
     */
    private getUserDetails;
    /**
     * Validate access token and return user session
     *
     * @param accessToken - Cognito access token
     * @returns User session
     */
    validateToken(accessToken: string): Promise<UserSession>;
    /**
     * Check if user has required role
     *
     * @param session - User session
     * @param requiredRole - Required role
     * @returns True if authorized
     */
    authorize(session: UserSession, requiredRole: UserRole | UserRole[]): boolean;
    /**
     * Require specific role or throw authorization error
     *
     * @param session - User session
     * @param requiredRole - Required role
     */
    requireRole(session: UserSession, requiredRole: UserRole | UserRole[]): void;
    /**
     * Extract token from Authorization header
     *
     * @param authHeader - Authorization header value
     * @returns Access token
     */
    extractToken(authHeader?: string): string;
}
/**
 * Export singleton instance
 */
export declare const authService: AuthService;
export default authService;
//# sourceMappingURL=auth.service.d.ts.map