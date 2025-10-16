# Habit Tracker API (Assignment Project)

A RESTful API for personal habit tracking and streak management built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Habit Management](#habit-management)
  - [Habit Tracking](#habit-tracking)
- [Authentication Usage](#authentication-usage)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Features

### Core Features
- User registration, authentication and route protection with JWT 
- Secure password hashing with bcrypt
- Complete CRUD operations for habits
- Daily habit tracking and completion logs
- 7-day habit history retrieval

### Bonus Features
- Streak calculation (consecutive days completed)
- Habit tags with filtering support
- Habit reminder time storage
- Pagination on habit listing
- Rate limiting (100 requests/hour)
- Comprehensive API testing with Jest & Supertest

---

## Tech Stack

| Area | Technology |
|------|-----------|
| **Runtime** | Node.js |
| **Language** | TypeScript |
| **Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT + bcrypt |
| **Testing** | Jest + Supertest |
| **Rate Limiting** | express-rate-limit |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Git

---

## Installation

1. **Clone the repository:**

git clone https://github.com/zzpulkitzz/MEAtec_Assignment.git
cd MEAtec_Assignment

2. **Install dependencies:**

npm install

3. **Install development dependencies:**
npm install --save-dev typescript ts-node @types/node @types/express
---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

Database (You must have a postgresql server running.)
DATABASE_URL="postgresql://username:password@localhost:5432/habit_tracker"

JWT Secret (You can generate a random string using online tools.)
JWT_SECRET="your_super_secret_jwt_key_here"

Server Port (You can change this to any port you prefer.)
PORT=3000

Node Environment
NODE_ENV=development

## Database Setup

1. **Create PostgreSQL database:** (You may skip this if you already have a postgres database ready and have a connection string for it.)
psql -U postgres
CREATE DATABASE habit_tracker;
CREATE USER your_username WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE habit_tracker TO your_username;
\q

2. **Initialize Prisma:**
npx prisma init


3. **Run migrations:**
npx prisma migrate dev --name init

4. **Generate Prisma Client:**
npx prisma generate

---

## Running the Application

### Development Mode
npm run dev

---

## Running the Application

### Development Mode
npm run dev

### Run Tests
npm test
## API Documentation

### Base URL
http://localhost:3000

---

### Authentication

#### Register a New User
**Endpoint:** `POST /auth/register`

**Request Body:**
{
"name": "John Doe",
"email": "john@example.com",
"password": "securePassword123"
}

**Response (201 Created):**
{
"message": "User registered successfully",
"userId": 1
}

**Error Response (400 Bad Request):**
{
"error": "Email already exists"
}

---

#### Login
**Endpoint:** `POST /auth/login`

**Request Body:**
{
"email": "john@example.com",
"password": "securePassword123"
}

**Response (200 OK):**
{
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"user": {
"id": 1,
"name": "John Doe",
"email": "john@example.com"
}
}



**Error Response (401 Unauthorized):**
{
"error": "Invalid credentials"
}

---

### Habit Management

**Note:** All habit endpoints require JWT authentication.

#### Create a New Habit
**Endpoint:** `POST /habits`

**Headers:**
Authorization: Bearer <your-jwt-token>

**Request Body:**
{
"title": "Morning Exercise",
"description": "30 minutes of cardio",
"frequency": "DAILY",
"tags": ["health", "fitness"],
"reminderTime": "07:00"
}

**Response (201 Created):**
{
"message": "Habit created successfully",
"habit": {
"id": 1,
"title": "Morning Exercise",
"description": "30 minutes of cardio",
"frequency": "DAILY",
"tags": ["health", "fitness"],
"reminderTime": "07:00",
"userId": 1,
"createdAt": "2025-10-16T08:00:00.000Z",
"updatedAt": "2025-10-16T08:00:00.000Z"
}
}

---

#### Get All Habits (with Pagination)
**Endpoint:** `GET /habits?page=1&limit=10&tag=health`

**Headers:**
Authorization: Bearer <your-jwt-token>

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `tag` (optional): Filter by tag

**Response (200 OK):**
{
"data": [
{
"id": 1,
"title": "Morning Exercise",
"description": "30 minutes of cardio",
"frequency": "DAILY",
"tags": ["health", "fitness"],
"reminderTime": "07:00",
"logs": []
}
],
"pagination": {
"currentPage": 1,
"pageSize": 10,
"totalCount": 25,
"totalPages": 3,
"hasNextPage": true,
"hasPreviousPage": false
}
}



---

#### Get Single Habit
**Endpoint:** `GET /habits/:id`

**Headers:**
Authorization: Bearer <your-jwt-token>



**Response (200 OK):** 
{
"habit": {
"id": 1,
"title": "Morning Exercise",
"description": "30 minutes of cardio",
"frequency": "DAILY",
"tags": ["health", "fitness"],
"logs": []
}
}
---

#### Update a Habit
**Endpoint:** `PUT /habits/:id`

**Headers:**
Authorization: Bearer <your-jwt-token>

**Request Body:**
{
"title": "Evening Exercise",
"description": "45 minutes of cardio"
}

**Response (200 OK):**
{
"message": "Habit updated successfully",
"habit": {
"id": 1,
"title": "Evening Exercise",
"description": "45 minutes of cardio",
"frequency": "DAILY"
}
}

---

#### Delete a Habit
**Endpoint:** `DELETE /habits/:id`

**Headers:**
Authorization: Bearer <your-jwt-token>

**Response (200 OK):**
{
"message": "Habit deleted successfully"
}
---

### Habit Tracking

#### Track Habit Completion
**Endpoint:** `POST /habits/:id/track`

**Headers:**
Authorization: Bearer <your-jwt-token>

**Response (201 Created):**
{
"message": "Habit tracked successfully",
"log": {
"id": 1,
"habitId": 1,
"date": "2025-10-16T00:00:00.000Z",
"completed": true,
"createdAt": "2025-10-16T08:30:00.000Z"
}
}

**Error Response (400 Bad Request):**
{
"error": "Habit already tracked for today"
}

---

#### Get Habit History (Last 7 Days)
**Endpoint:** `GET /habits/:id/history`

**Headers:**
Authorization: Bearer <your-jwt-token>

**Response (200 OK):**
{
"habit": {
"id": 1,
"title": "Morning Exercise"
},
"history": [
{
"id": 1,
"habitId": 1,
"date": "2025-10-16T00:00:00.000Z",
"completed": true
},
{
"id": 2,
"habitId": 1,
"date": "2025-10-15T00:00:00.000Z",
"completed": true
}
],
"count": 2
}

---

#### Get Current Streak
**Endpoint:** `GET /habits/:id/streak`

**Headers:**
Authorization: Bearer <your-jwt-token>



**Response (200 OK):**
{
"habit": {
"id": 1,
"title": "Morning Exercise"
},
"currentStreak": 7
}

---

## Authentication Usage

All protected routes require a JWT token in the Authorization header:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### How to Get a Token:
1. Register a user via `POST /auth/register`
2. Login via `POST /auth/login`
3. Copy the `token` from the login response
4. Add it to the Authorization header in subsequent requests

### Token Expiration:
Tokens expire after **1 hour**. You'll need to login again to get a new token.

---

## Testing

The project includes comprehensive test coverage using Jest and Supertest.

## Project Structure

.
├── README.md
├── coverage
│   ├── clover.xml
│   ├── coverage-final.json
│   ├── lcov-report
│   └── lcov.info
├── jest.config.js
├── node_modules
├── package-lock.json
├── package.json
├── prisma
│   ├── migrations
│   └── schema.prisma
├── src
│   ├── app.ts
│   ├── controllers
|   |   |-- habit.controller.ts
|   |   |-- auth.controller.ts
|   |   |-- habitLog.controller.ts
│   ├── middlewares
|   |   |-- auth.middleware.ts
|   |   |-- rateLimit.middleware.ts
│   ├── routes
|   |   |-- habit.routes.ts
|   |   |-- auth.routes.ts
│   ├── server.ts
│   ├── tests
│   └── utils
└── tsconfig.json
├── .env
├── .gitignore
---

## Database Schema

### User Model
model User {
id Int @id @default(autoincrement())
name String
email String @unique
password String
habits Habit[]
createdAt DateTime @default(now())
}


### Habit Model
model Habit {
id Int @id @default(autoincrement())
title String
description String?
frequency Frequency
user User @relation(fields: [userId], references: [id])
userId Int
logs HabitLog[]
tags String[]
reminderTime String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

### HabitLog Model
model HabitLog {
id Int @id @default(autoincrement())
habit Habit @relation(fields: [habitId], references: [id])
habitId Int
date DateTime
completed Boolean @default(true)
createdAt DateTime @default(now())

@@unique([habitId, date])
}

### Frequency Enum
enum Frequency {
DAILY
WEEKLY
}
---

## Error Handling

The API uses standard HTTP status codes:

| Status Code | Meaning |
|------------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (invalid JWT) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

**Error Response Format:**
{
"error": "Error message describing what went wrong"
}

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General Routes:** 100 requests per hour per IP
- **Auth Routes:** 5 requests per 15 minutes per IP
- **API Routes:** 200 requests per hour per IP (authenticated)

When rate limit is exceeded, you'll receive:
{
"error": "Too many requests from this IP, please try again after an hour"
}

**Rate Limit Headers:**
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining
- `RateLimit-Reset`: Timestamp when limit resets

---

## Author

Pulkit Gupta - [gpulkitgupta72@gmail.com]

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- Built as part of the Backend Developer Intern Assignment
- Uses Prisma ORM for database management
- JWT authentication implementation
- Express rate limiting for API protection
