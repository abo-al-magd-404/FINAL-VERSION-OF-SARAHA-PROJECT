# SarahaApp Online

A Node.js web application for anonymous messaging, built with Express.js, MongoDB, and Redis. Users can send and receive anonymous messages, manage profiles, and authenticate securely.

## Features

- User authentication (signup/login with email or Gmail)
- Anonymous message sending with optional image attachments
- Profile management with image uploads
- Email verification and password reset
- Rate limiting and security features
- Redis caching for performance

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose), Redis
- **Authentication**: JWT, bcrypt
- **File Uploads**: Multer
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/sarahaapp
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```
4. Start the development server:
   ```bash
   npm run start:dev
   ```
5. For production:
   ```bash
   npm run start:prod
   ```

## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required | Body/Params |
|--------|----------|-------------|---------------|-------------|
| POST | `/auth/signup` | User registration | No | `{email, password, username, dob, confirmPass}` |
| POST | `/auth/confirm-email` | Confirm email with OTP | No | `{email, otp}` |
| POST | `/auth/resend-confirm-email` | Resend email confirmation | No | `{email}` |
| POST | `/auth/forget-password` | Request password reset | No | `{email}` |
| POST | `/auth/confirm-forget-password` | Confirm password reset with OTP | No | `{email, otp}` |
| POST | `/auth/reset-password` | Reset password | No | `{email, otp, newPassword}` |
| POST | `/auth/login` | User login | No | `{email, password}` |
| POST | `/auth/confirm-login` | Confirm login with OTP | No | `{email, otp}` |
| POST | `/auth/signup/gmail` | Signup with Gmail | No | Google OAuth data |
| POST | `/auth/login/gmail` | Login with Gmail | No | Google OAuth data |

### User Management (`/user`)

| Method | Endpoint | Description | Auth Required | Body/Params |
|--------|----------|-------------|---------------|-------------|
| GET | `/user/profile` | Get user profile | Yes | - |
| PATCH | `/user/profile-image` | Update profile image | Yes | Form-data: `attachment` (image file) |
| PATCH | `/user/profile-cover-image` | Update cover images | Yes | Form-data: `attachments` (up to 5 images) |
| POST | `/user/logout` | Logout user | Yes | `{refreshToken}` |
| GET | `/user/share-profile/:userId` | Get public profile | No | URL param: `userId` |
| POST | `/user/rotate` | Refresh access token | Yes (refresh token) | - |
| POST | `/user/update-password` | Update password | Yes | `{oldPassword, newPassword}` |

### Messages (`/message`)

| Method | Endpoint | Description | Auth Required | Body/Params |
|--------|----------|-------------|---------------|-------------|
| POST | `/message/send-message/:receiverid` | Send anonymous message | No | Form-data: `message`, `attachments` (up to 2 images), URL param: `receiverid` |
| POST | `/message/send-message/:receiverid/by-user` | Send message as authenticated user | Yes | Form-data: `message`, `attachments` (up to 2 images), URL param: `receiverid` |
| GET | `/message/get-message/:id` | Get specific message | Yes | URL param: `id` |
| DELETE | `/message/delete-message/:id` | Delete message | Yes | URL param: `id` |
| GET | `/message/my-messages` | Get received messages | Yes | - |
| GET | `/message/messages-i-send` | Get sent messages | Yes | - |

### Static Files

- `GET /uploads/*` - Serve uploaded files

### Root

- `GET /` - Health check endpoint

## Project Structure

```
sarahaApp_online/
├── config/
│   └── config.service.js
├── src/
│   ├── app.bootstrap.js
│   ├── main.js
│   ├── common/
│   │   ├── email.event.js
│   │   ├── enums/
│   │   │   └── user.enum.js
│   │   ├── services/
│   │   │   └── redis.service.js
│   │   └── utils/
│   │       ├── email/
│   │       │   ├── otp.js
│   │       │   └── send.email.js
│   │       ├── multer/
│   │       │   ├── local.multer.js
│   │       │   └── validition.multer.js
│   │       ├── response/
│   │       └── security/
│   │           ├── encryption.js
│   │           ├── hash.js
│   │           └── token.js
│   ├── DB/
│   │   ├── connection.db.js
│   │   ├── db.service.js
│   │   ├── redis.connection.js
│   │   └── model/
│   │       ├── index.js
│   │       ├── message.model.js
│   │       └── user.model.js
│   ├── middleware/
│   │   ├── authintication.js
│   │   └── validition.middleware.js
│   └── modules/
│       ├── index.js
│       ├── auth/
│       │   ├── auth.controller.js
│       │   ├── auth.service.js
│       │   ├── auth.validition.js
│       │   └── index.js
│       ├── message/
│       │   ├── index.js
│       │   ├── message.controller.js
│       │   ├── message.service.js
│       │   └── message.validition.js
│       └── user/
│           ├── index.js
│           ├── user.controller.js
│           ├── user.service.js
│           └── user.validition.js
├── uploads/
│   └── profilePics/
├── package.json
├── redisCommands.txt
└── .gitignore
```

## Security Features

- JWT authentication with access and refresh tokens
- Password hashing with bcrypt
- Rate limiting (10 requests per 2 minutes per IP/path)
- Helmet for security headers
- CORS configuration
- Input validation with Joi
- File upload restrictions

## Database Models

### User
- email (unique)
- password (hashed)
- username
- dob (date of birth)
- emailConfirmed (boolean)
- role (user/admin)
- profileImage, coverImages (arrays)
- otp, otpExpires (for verification)

### Message
- senderId (optional, for authenticated sends)
- receiverId
- message (text)
- attachments (array of image paths)
- createdAt

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC