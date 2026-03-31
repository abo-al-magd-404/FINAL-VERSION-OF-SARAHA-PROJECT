# FINAL VERSION OF SARAHA PROJECT
**Name:** abo-al-magd-404  
**Group:** Node_C45_Mon&Thurs_8:30pm_(Online)

---

# Saraha Application

A production-grade backend platform for anonymous messaging, built with Node.js and Express. This project powers core Saraha features: registration, authentication, secure message exchange, and profile management—with an emphasis on security, scalability, and modern best practices.

## Features

- **User Authentication**: Registration, login, JWT-based sessions, Google OAuth integration, and secure password hashing.
- **Anonymous Messaging**: Users can send and receive anonymous messages via a dedicated module.
- **User Management**: Profile update, password change, and account management endpoints.
- **Rate Limiting & Security**: Redis-powered API rate limiting, CORS, Helmet, and Express best practices.
- **Email Integration**: Notifications and authentication flows integrated using Nodemailer.
- **Validation**: Joi-based robust request validation for all major endpoints.
- **Production-Ready**: Environment-specific settings, error handling, and modular code for ease of maintenance and deployment.

## Tech Stack

- **Backend:** Node.js (v24+), Express 5
- **Database:** MongoDB (via Mongoose)
- **Cache/Rate Limiting:** Redis
- **Validation:** Joi
- **Security:** Helmet, CORS, bcrypt, JWT, express-rate-limit
- **File Uploads:** Multer
- **Email:** Nodemailer
- **Other:** dotenv, cross-env

## High-Level Architecture

```
+-------------------------------+
|       Express Application     |
|-------------------------------|
| - User Routes (/user)         |
| - Auth Routes (/auth)         |
| - Message Routes (/message)   |
+-------------------------------+
        |         |          |
        v         v          v
  [User Module] [Auth]   [Message]
        |         |          |
        +---Mongoose/Redis---+
```

- **Entry:** `main.js` boots the app using `app.bootstrap.js`.
- **Modularity:** `/src/modules/` contains feature modules: auth, user, and message. Each includes controller, service, and validation layers.
- **DB Initialization:** Connection and health checks in `/src/DB/`.
- **Config & Middleware:** Security, error handling, and configuration under `/src/common/`, `/src/middleware/`, `/code/config`.

## API Overview

| Endpoint         | Description                    |
|------------------|--------------------------------|
| POST `/auth/register` | Register new user          |
| POST `/auth/login`    | Authenticate user          |
| POST `/auth/google`   | Google OAuth login         |
| GET `/user/profile`   | View or update profile     |
| POST `/message/send`  | Send anonymous message     |
| GET `/message/inbox`  | Retrieve messages          |

## Setup Instructions

1. **Clone the repository**
    ```bash
    git clone https://github.com/abo-al-magd-404/FINAL-VERSION-OF-SARAHA-PROJECT.git
    cd FINAL-VERSION-OF-SARAHA-PROJECT/code
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Configure environment**
    - Copy `.env.example` (if exists) to `.env`.
    - Edit MongoDB URI, Redis config, email credentials, and JWT secret.

4. **Run in Development**
    ```bash
    npm run start:dev
    ```

5. **For Production**
    ```bash
    npm run start:prod
    ```

## Contributing

Contributions, feedback, and suggestions are welcome. Please open issues or pull requests!

---

© 2026 abo-al-magd-404 – All rights reserved.
