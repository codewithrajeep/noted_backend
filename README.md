# noted-backend

> A production-grade REST API for a personal task management application built to learn real-world backend engineering.

[![Learning Guide](https://img.shields.io/badge/📖_Learning_Guide-read_now-blue)](LEARNING.md)
[![CI](https://github.com/codewithrajeep/noted_backend/actions/workflows/ci.yml/badge.svg)](https://github.com/codewithrajeep/noted_backend/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/license-MIT-green)

**Live API:** https://noted-backend-gn0j.onrender.com

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Docker](#docker)
- [CI/CD](#cicd)
- [Learning Resources](#learning-resources)
- [Contributing](#contributing)

---

## Overview

**Noted** is a personal task management application. This repository contains the backend API built with Node.js, Express, and TypeScript designed from scratch following production backend engineering practices.

The project was built with learning in mind. Every decision from folder structure to security patterns was made deliberately, with the goal of understanding _why_, not just _how_.

---

## Tech Stack

| Layer            | Technology                    |
| ---------------- | ----------------------------- |
| Runtime          | Node.js 20                    |
| Language         | TypeScript 5                  |
| Framework        | Express 5                     |
| ORM              | Prisma 7                      |
| Database         | PostgreSQL                    |
| Validation       | Zod 4                         |
| Auth             | JWT (access + refresh tokens) |
| Password Hashing | bcrypt                        |
| Logging          | Pino                          |
| Security         | Helmet, express-rate-limit    |
| Package Manager  | pnpm                          |
| Containerization | Docker + Docker Compose       |
| CI/CD            | GitHub Actions + Render       |

---

## Features

### Auth Module

- User registration with Zod-validated input
- Secure login with identical error messages (prevents user enumeration)
- JWT access token (15min) + refresh token (7d) with separate secrets
- Token refresh endpoint
- `isAuth` middleware for protected routes

### User Module

- `GET /apiv1/user/me` — get authenticated user profile (password excluded)

### Task Module

- Full CRUD — create, read, update, delete tasks
- Ownership check — users can only modify their own tasks (403 on violation)
- Pagination — `?page=1&limit=10`
- Filtering — `?status=PENDING`
- Sorting — `?sortBy=createdAt&order=desc`

### API Quality

- Structured JSON logging with Pino (method, url, statusCode, responseTime, ip)
- HTTP security headers via Helmet
- Rate limiting 100 req/15min general, 10 req/15min on auth routes
- Global error handler (AppError, ZodError, 500 fallback)
- Zod validation on all request bodies and query params

### DevOps

- Multi-stage Dockerfile (builder + production)
- Docker Compose with PostgreSQL
- GitHub Actions CI (build + prisma generate on every push)
- Deployed on Render

---

## Project Structure

```
src/
├── config/
│   └── env.ts               # Zod-validated environment variables
├── generated/
│   └── prisma/              # Prisma generated client
├── lib/
│   ├── logger.ts            # Pino structured logger
│   └── prisma.ts            # Prisma client singleton (PrismaPg adapter)
├── middlewares/
│   ├── errorHandler.ts      # Global error handler
│   ├── isAuth.ts            # JWT verification middleware
│   ├── rateLimiter.ts       # General + auth rate limiters
│   └── requestLogger.ts     # Request/response logger
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.schema.ts
│   │   └── auth.service.ts
│   ├── task/
│   │   ├── task.controller.ts
│   │   ├── task.repository.ts
│   │   ├── task.routes.ts
│   │   ├── task.schema.ts
│   │   └── task.service.ts
│   └── user/
│       ├── user.controller.ts
│       ├── user.repository.ts
│       ├── user.routes.ts
│       └── user.service.ts
├── routes/
│   └── index.ts             # Central router
├── types/
│   └── express.d.ts         # Express Request type extension
├── utils/
│   ├── AppError.ts          # Custom HTTP error class
│   └── token.ts             # JWT token utilities
├── app.ts                   # Express app setup
└── server.ts                # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL (or use Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/codewithrajeep/noted_backend.git
cd noted_backend

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your values in .env

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate init

# Start development server
pnpm run dev
```

### Available Scripts

```bash
pnpm run dev          # Start dev server with hot reload
pnpm run build        # Compile TypeScript
pnpm start            # Start production server
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:reset     # Reset database
```

### Scripts
```bash
# Project setup (first time)
./scripts/setup.sh

# Clean and rebuild (fixes Prisma generation issues)
./scripts/fresh-build.sh

# Run migrations against remote database
./scripts/migrate.sh your_database_url
```
> Make them executable first: `chmod +x scripts/*.sh`

---

## Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/noted
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_ACCESS_SECRET=your_access_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d
```

> Never commit your `.env` file. See `.env.example` for reference.

---

## API Documentation

### Base URL

```
http://localhost:5000/api/v1        # local
https://noted-backend-gn0j.onrender.com/api/v1  # production
```

### Auth

| Method | Endpoint                | Auth | Description          |
| ------ | ----------------------- | ---- | -------------------- |
| POST   | `/api/v1/auth/register` | ❌   | Register a new user  |
| POST   | `/api/v1/auth/login`    | ❌   | Login and get tokens |
| POST   | `/api/v1/auth/refresh`  | ❌   | Refresh access token |

#### Register

```json
POST /api/v1/auth/register
{
  "username": "rajeep",
  "name": "Rajeep",
  "email": "rajeep@example.com",
  "password": "secret123"
}
```

#### Login

```json
POST /api/v1/auth/login
{
  "email": "rajeep@example.com",
  "password": "secret123"
}
```

#### Refresh Token

```json
POST /api/v1/auth/refresh
{
  "refreshToken": "your_refresh_token"
}
```

### User

| Method | Endpoint          | Auth | Description                    |
| ------ | ----------------- | ---- | ------------------------------ |
| GET    | `/api/v1/user/me` | ✅   | Get authenticated user profile |

### Tasks

| Method | Endpoint               | Auth | Description               |
| ------ | ---------------------- | ---- | ------------------------- |
| POST   | `/api/v1/task`         | ✅   | Create a task             |
| GET    | `/api/v1/task`         | ✅   | Get all tasks (paginated) |
| GET    | `/api/v1/task/:taskId` | ✅   | Get task by ID            |
| PATCH  | `/api/v1/task/:taskId` | ✅   | Update task               |
| DELETE | `/api/v1/task/:taskId` | ✅   | Delete task               |

#### Query Parameters for GET /task

| Parameter | Type   | Default   | Description                             |
| --------- | ------ | --------- | --------------------------------------- |
| page      | number | 1         | Page number                             |
| limit     | number | 10        | Items per page                          |
| status    | string | -         | Filter: PENDING, IN_PROGRESS, COMPLETED |
| sortBy    | string | createdAt | Sort field: createdAt, updatedAt        |
| order     | string | desc      | Sort order: asc, desc                   |

#### Authentication

All protected routes require a Bearer token:

```
Authorization: Bearer your_access_token
```

---

## Docker

### Run with Docker Compose

```bash
# Copy docker env file
cp .env.docker.example .env.docker
# Fill in your values

# Build and start containers
docker-compose up --build

# Run migrations inside container
docker-compose exec app npx prisma migrate deploy

# Stop containers
docker-compose down
```

> **Note:** On Render free tier, run migrations manually from your local machine:
> `DATABASE_URL="your_external_db_url" npx prisma migrate deploy`

### Services

- `app` — Node.js backend on port 5000
- `db` — PostgreSQL on port 5432

---

## CI/CD

### GitHub Actions CI

Every push to `main` triggers:

1. Checkout code
2. Install pnpm
3. Setup Node.js 20
4. Install dependencies
5. Generate Prisma client
6. Build TypeScript

See `.github/workflows/ci.yml` for the full workflow.

### Deployment

The app is deployed on **Render** with auto-deploy on every push to `main` that passes CI.

Branch protection rules enforce:

- All features are pushed to `development` branch first
- CI runs on `development` — if it passes, auto-merges to `main`
- Render deploys automatically when `main` receives a new commit

---

## Learning Resources

📖 **[Read the full Learning Guide →](LEARNING.md)**
This project was built step by step as a learning exercise. If you're a beginner wanting to learn backend development, here's what you can learn from this codebase:

### Concepts Covered

**Project Setup**

- TypeScript configuration with `tsconfig.json`
- Feature-based folder structure (modules)
- Environment variable validation with Zod
- pnpm as package manager

**Authentication**

- JWT access + refresh token pattern
- Why two tokens? Access tokens are short-lived (15min). Refresh tokens renew them without re-login.
- Why separate secrets? Compromised access token can't forge refresh tokens.
- bcrypt password hashing — max 72 characters (bcrypt limitation)
- Identical error messages for "user not found" vs "wrong password" (prevents user enumeration)

**Database**

- Prisma ORM with PostgreSQL
- UUID primary keys
- `snake_case` column mapping with `@@map`
- Prisma client singleton pattern (prevents connection exhaustion in dev)
- `select` to exclude sensitive fields (password never leaves DB layer)

**API Design**

- RESTful route conventions
- PATCH vs PUT — partial vs full update
- Pagination with `skip` and `take`
- Filtering and sorting via query params
- Ownership checks (403 Forbidden)

**Error Handling**

- Custom `AppError` class with HTTP status codes
- Global error handler middleware
- Zod validation errors (400)
- Never expose internal errors in production

**Security**

- Helmet for HTTP security headers
- Rate limiting — general + stricter auth limits
- CORS configuration
- Password never returned in responses

**Logging**

- Structured JSON logging with Pino
- Request logging middleware (method, url, statusCode, responseTime, ip)
- Environment-based log levels (debug in dev, info in prod)

**DevOps**

- Multi-stage Docker builds (smaller, cleaner images)
- Docker Compose for local development
- GitHub Actions CI pipeline
- Deployment on Render

### Recommended Learning Order

1. Start with `src/config/env.ts` — understand Zod validation
2. Read `src/lib/prisma.ts` — understand the singleton pattern
3. Follow the auth flow: `auth.schema.ts` → `auth.repository.ts` → `auth.service.ts` → `auth.controller.ts` → `auth.routes.ts`
4. Read `src/middlewares/isAuth.ts` — understand JWT verification
5. Read `src/middlewares/errorHandler.ts` — understand global error handling
6. Read the task module — same pattern as auth but with ownership checks and pagination

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a PR.

---

## License

MIT © [Rajeep Gadal](https://github.com/codewithrajeep)
