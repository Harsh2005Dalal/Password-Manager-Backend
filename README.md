# Password Manager - Backend

Express.js backend for the Password Manager application with MongoDB Atlas integration.

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/signup`
Create a new user account
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### POST `/api/auth/login`
Login with username and password
```json
{
  "username": "string",
  "password": "string"
}
```

#### POST `/api/auth/forgot-password`
Request OTP for password reset
```json
{
  "email": "string"
}
```

#### POST `/api/auth/verify-otp`
Verify OTP code
```json
{
  "email": "string",
  "otp": "string"
}
```

#### POST `/api/auth/reset-password`
Reset password with verified OTP
```json
{
  "email": "string",
  "otp": "string",
  "newPassword": "string"
}
```

### Password Routes (`/api/passwords`)
All routes require authentication via Bearer token

#### GET `/api/passwords`
Get all passwords for authenticated user

#### POST `/api/passwords`
Create new password entry
```json
{
  "websiteName": "string",
  "websiteUrl": "string",
  "websiteUsername": "string",
  "websitePassword": "string"
}
```

#### PUT `/api/passwords/:id`
Update password entry
```json
{
  "websiteName": "string (optional)",
  "websiteUrl": "string (optional)",
  "websiteUsername": "string (optional)",
  "websitePassword": "string (optional)"
}
```

#### DELETE `/api/passwords/:id`
Delete password entry

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_secure_jwt_secret_minimum_32_characters
ENCRYPTION_KEY=exactly_32_character_secret_key

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Security Features

- Password hashing with bcryptjs
- AES-256 encryption for stored passwords
- JWT authentication with 30-day expiry
- Protected routes with authentication middleware
- OTP expiry (10 minutes)
- MongoDB TTL index for automatic OTP cleanup
