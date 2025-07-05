# Authentication Documentation

This document outlines the authentication system architecture and implementation details for the project.

## Authentication Flow Overview

```mermaid
flowchart TD
    A[User Login Request] --> B{Valid Credentials?}
    B -->|Yes| C[Generate JWT Token]
    B -->|No| D[Return 401 Unauthorized]
    C --> E[Return Token to Client]
    E --> F[Client Stores Token]
    F --> G[Include Token in Headers]
    G --> H[Protected Route Request]
    H --> I{Valid Token?}
    I -->|Yes| J[Grant Access]
    I -->|No| K[Return 401 Unauthorized]
    J --> L[Process Request]
    L --> M[Return Response]
```

## JWT Token Lifecycle

```mermaid
sequenceDiagram
    participant Client as Mobile App
    participant Auth as Auth Controller
    participant Service as Auth Service
    participant DAO as User DAO
    participant DB as Database
    participant JWT as JWT Utils
    
    Client->>Auth: POST /auth/login
    Auth->>Service: validateCredentials()
    Service->>DAO: findUserByEmail()
    DAO->>DB: SELECT user
    DB-->>DAO: User data
    DAO-->>Service: User object
    Service->>Service: comparePassword()
    Service->>JWT: generateToken()
    JWT-->>Service: JWT token
    Service-->>Auth: Token + User data
    Auth-->>Client: 200 + Token + User info
    
    Note over Client: Store token securely
    
    Client->>Auth: GET /protected-route
    Note over Client: Include Authorization header
    Auth->>JWT: verifyToken()
    JWT-->>Auth: Decoded payload
    Auth->>Service: processRequest()
    Service-->>Auth: Response data
    Auth-->>Client: 200 + Data
```

## Authentication Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Mobile App]
        B[Token Storage]
        C[HTTP Interceptor]
    end
    
    subgraph "Middleware Layer"
        D[Auth Middleware]
        E[Token Validator]
        F[Role Checker]
    end
    
    subgraph "Service Layer"
        G[Auth Service]
        H[User Service]
        I[JWT Utils]
    end
    
    subgraph "Data Layer"
        J[User DAO]
        K[Session DAO]
        L[(Database)]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> J
    J --> L
    G --> I
    I --> K
    K --> L
    
    style A fill:#e1f5fe
    style D fill:#fff3e0
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#f3e5f5
    style H fill:#f3e5f5
    style I fill:#e8f5e8
    style J fill:#fce4ec
    style K fill:#fce4ec
    style L fill:#e0f2f1
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "token": "jwt_token_here",
    "expiresIn": "24h"
  },
  "message": "Login successful"
}
```

### POST /auth/logout
Invalidate the current session.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET /auth/profile
Get current user profile (protected route).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

## Token Refresh Flow

```mermaid
sequenceDiagram
    participant Client as Mobile App
    participant Auth as Auth Service
    participant JWT as JWT Utils
    
    Client->>Auth: Request with expired token
    Auth->>JWT: verifyToken()
    JWT-->>Auth: Token expired error
    Auth-->>Client: 401 + Token expired
    Client->>Auth: POST /auth/refresh
    Note over Client: Include refresh token
    Auth->>JWT: verifyRefreshToken()
    JWT-->>Auth: Valid refresh token
    Auth->>JWT: generateNewToken()
    JWT-->>Auth: New access token
    Auth-->>Client: 200 + New token
    Client->>Client: Update stored token
    Client->>Auth: Retry original request
    Auth-->>Client: 200 + Data
```

## Role-Based Access Control

```mermaid
graph TD
    A[User Request] --> B[Auth Middleware]
    B --> C{Token Valid?}
    C -->|No| D[Return 401]
    C -->|Yes| E[Extract User Role]
    E --> F{Role Check}
    F -->|Admin| G[Full Access]
    F -->|User| H[Limited Access]
    F -->|Guest| I[Read Only]
    F -->|Invalid| J[Return 403]
    
    G --> K[Process Request]
    H --> K
    I --> K
    K --> L[Return Response]
    
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style F fill:#f3e5f5
    style G fill:#e8f5e8
    style H fill:#fff9c4
    style I fill:#ffecb3
    style J fill:#ffcdd2
    style D fill:#ffcdd2
```

## Security Best Practices

### Token Security
- Use HTTPS in production
- Store tokens securely (Keychain/Keystore)
- Implement token rotation
- Set appropriate expiration times
- Use secure random secrets

### Password Security
- Hash passwords with bcrypt
- Implement password strength requirements
- Use salt for hashing
- Implement rate limiting for login attempts
- Account lockout after failed attempts

### API Security
- Validate all inputs
- Implement CORS properly
- Use helmet for security headers
- Implement request rate limiting
- Log security events

## Implementation Examples

### Auth Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
```

### Role Middleware
```javascript
// middleware/role.js
const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};
```

## Error Handling

### Common Auth Errors
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `422 Unprocessable Entity`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "The provided token is invalid or expired"
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## Testing Authentication

### Unit Tests
- Test token generation and validation
- Test password hashing and comparison
- Test middleware functions
- Test role-based access control

### Integration Tests
- Test complete authentication flow
- Test protected routes
- Test token refresh
- Test logout functionality

## Monitoring and Logging

### Security Events to Log
- Login attempts (success/failure)
- Token generation and validation
- Role elevation attempts
- Suspicious activity patterns
- API rate limit violations

### Metrics to Track
- Authentication success rate
- Token refresh frequency
- Failed login attempts by IP
- Session duration statistics
- API endpoint access patterns