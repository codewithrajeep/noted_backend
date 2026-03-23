# Learning Guide — noted-backend

> This guide walks you through how `noted-backend` was built from scratch — the concepts behind every decision, and how you can learn from and replicate it yourself.

Whether you're new to backend development, familiar with Node.js but new to TypeScript, or an experienced developer looking to understand production patterns this guide has something for you.

---

## Table of Contents

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Project Overview](#project-overview)
3. [Project Setup](#1-project-setup)
4. [TypeScript Configuration](#2-typescript-configuration)
5. [Environment Variables](#3-environment-variables)
6. [Structured Logging with Pino](#4-structured-logging-with-pino)
7. [Database with Prisma](#5-database-with-prisma)
8. [Feature-Based Folder Structure](#6-feature-based-folder-structure)
9. [Authentication Module](#7-authentication-module)
10. [Protecting Routes with Middleware](#8-protecting-routes-with-middleware)
11. [User Module](#9-user-module)
12. [Task Module](#10-task-module)
13. [API Quality — Pagination, Filtering, Rate Limiting](#11-api-quality)
14. [Error Handling](#12-error-handling)
15. [Docker](#13-docker)
16. [CI/CD](#14-cicd)
17. [What to Build Next](#what-to-build-next)

---

## How to Use This Guide

Read it top to bottom if you're a beginner each section builds on the previous one.

If you're intermediate, jump to the sections most relevant to you using the table of contents.

For each section:
- **Concept first** — understand *why* before *how*
- **Implementation** — see how it's done in this project
- **Key files** — know exactly where to look in the codebase

---

## Project Overview

**Noted** is a personal task management API. Users can register, login, and manage their own tasks.

**What it does:**
- Auth: register, login, refresh tokens
- Tasks: create, read, update, delete with pagination and filtering
- Security: JWT auth, rate limiting, helmet, ownership checks

**Why this project?**
It's simple enough to build quickly but complex enough to cover real production patterns. Every feature teaches something new.

---

## 1. Project Setup

### Concept

Every Node.js backend needs a few things before you write any business logic:
- A package manager to install dependencies
- TypeScript for type safety
- A way to run TypeScript in development
- Scripts to build and start the app

### What we used

- **pnpm** — faster than npm, stricter dependency resolution
- **ts-node-dev** — runs TypeScript directly in development with hot reload
- **tsc** — TypeScript compiler for production builds

### Key files

- `package.json` — scripts and dependencies
- `tsconfig.json` — TypeScript configuration
- `src/server.ts` — entry point that starts the server
- `src/app.ts` — Express app setup (middleware, routes)

### Why separate `app.ts` and `server.ts`?

`app.ts` configures Express — middleware, routes, error handlers.
`server.ts` starts the HTTP server — calls `app.listen()`.

This separation makes testing easier. You can import `app` without starting the server.

```typescript
// src/server.ts
import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`)
})
```

### Try it yourself

1. Create a new folder
2. Run `npm init -y`
3. Install `express typescript ts-node-dev @types/express @types/node`
4. Create `src/app.ts` and `src/server.ts`
5. Add a `dev` script: `ts-node-dev --transpile-only src/server.ts`

---

## 2. TypeScript Configuration

### Concept

TypeScript adds static types to JavaScript. This means errors are caught at compile time, not at runtime. For a backend, this is invaluable — you know exactly what shape your data is before it hits the database.

### Key settings in `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es2018",       // compile to ES2018 JavaScript
    "module": "commonjs",     // Node.js module system
    "outDir": "./dist",       // compiled output folder
    "rootDir": "./src",       // source files folder
    "strict": true,           // enable all strict type checks
    "esModuleInterop": true   // allows default imports from CommonJS modules
  }
}
```

### Why `strict: true`?

It enables a set of strict type checks that catch common mistakes:
- Variables can't be `null` or `undefined` unless you say so
- Function parameters must be typed
- `this` must be typed in classes

It feels annoying at first but saves hours of debugging later.

### Key files

- `tsconfig.json`

---

## 3. Environment Variables

### Concept

Environment variables store configuration that changes between environments (development, production). Things like database URLs, JWT secrets, and API keys should never be hardcoded in your code.

**Why?**
- Security — secrets don't end up in your Git repository
- Flexibility — same code runs in dev and production with different config

### The problem with `process.env`

By default, `process.env.DATABASE_URL` is typed as `string | undefined`. TypeScript doesn't know if the variable exists or what it contains. If it's missing, your app crashes later in a confusing way.

### The solution — Zod validation at startup

Validate all environment variables when the app starts. If any are missing or wrong, crash immediately with a clear error message.

```typescript
// src/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().min(1),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  // ...
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format())
  process.exit(1) // crash immediately, don't start the app
}

export const env = _env.data!
```

Now everywhere in your code, `env.DATABASE_URL` is guaranteed to be a valid string.

### Key files

- `src/config/env.ts`
- `.env.example`

### Try it yourself

1. Create `src/config/env.ts`
2. Define a schema for all your env variables
3. Use `safeParse` to validate
4. Export the typed `env` object
5. Never use `process.env` directly anywhere else

---

## 4. Structured Logging with Pino

### Concept

`console.log` is fine for quick debugging but terrible for production:
- It's synchronous (blocks the event loop)
- Output is unstructured plain text
- No log levels (info, warn, error, debug)
- No timestamps, no context

**Pino** is a fast, structured JSON logger. Every log line is a JSON object:

```json
{
  "level": 30,
  "time": "2026-03-20T11:12:11.902Z",
  "hostname": "server-1",
  "msg": "Server is running on port: http://localhost:5000"
}
```

This is machine-readable you can pipe it to log aggregation tools like Datadog, Grafana, or CloudWatch.

### Log levels

From lowest to highest severity:
```
trace → debug → info → warn → error → fatal
```

In development, use `debug` to see everything. In production, use `info` to filter out noise.

### Implementation

```typescript
// src/lib/logger.ts
import pino from 'pino'
import { hostname } from 'node:os'
import { env } from '../config/env'

const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    hostname: hostname(),
  },
})

export default logger
```

### Request logging middleware

Log every incoming request automatically:

```typescript
// src/middlewares/requestLogger.ts
export const requestLogger = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${Date.now() - start}ms`,
      ip: req.ip,
    })
  })

  next()
}
```

### Key files

- `src/lib/logger.ts`
- `src/middlewares/requestLogger.ts`

---

## 5. Database with Prisma

### Concept

Prisma is an ORM (Object Relational Mapper). It lets you interact with your database using TypeScript instead of raw SQL.

**Why Prisma?**
- Auto-generated, type-safe client
- Schema-first — define your models in `schema.prisma`
- Migrations — tracks database changes over time

### The schema

Define your data models in `prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  password  String?
  tasks     Task[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

Key decisions:
- `uuid()` — random unique IDs (harder to enumerate than sequential integers)
- `@@map("users")` — database table is `users` but Prisma model is `User`
- `@map("created_at")` — database column is snake_case, TypeScript is camelCase
- `password String?` — optional, leaves room for OAuth users later

### Prisma client singleton

Never create multiple Prisma client instances. In development, hot reloading creates new instances on every file change this exhausts your database connection pool.

**Solution: store the client on the global object**

```typescript
// src/lib/prisma.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

In development — reuses the same client across hot reloads.
In production — creates one instance (no hot reload, no problem).

### Migrations

Every schema change creates a migration file:

```bash
pnpm prisma:migrate your_migration_name
```

This creates a SQL file in `prisma/migrations/` that can be replayed on any database.

### Key files

- `prisma/schema.prisma`
- `src/lib/prisma.ts`
- `prisma/migrations/`

---

## 6. Feature-Based Folder Structure

### Concept

There are two common ways to structure a backend:

**Layer-based:**
```
src/
├── routes/
├── controllers/
├── services/
└── repositories/
```

**Feature-based:**
```
src/
├── modules/
│   ├── auth/
│   ├── user/
│   └── task/
```

**Why feature-based?**

As your app grows, layer-based becomes hard to navigate. To find all auth-related code, you'd look in `routes/auth.ts`, `controllers/auth.ts`, `services/auth.ts`, etc.

With feature-based, everything related to auth lives in `modules/auth/`. One folder, complete picture.

### The pattern — 5 files per module

```
modules/auth/
├── auth.schema.ts      # Zod input validation
├── auth.repository.ts  # Database queries only
├── auth.service.ts     # Business logic only
├── auth.controller.ts  # HTTP request/response
└── auth.routes.ts      # Route definitions
```

**Each layer has one responsibility:**

- `schema.ts` — validate and type incoming data
- `repository.ts` — speak to the database
- `service.ts` — apply business rules
- `controller.ts` — handle HTTP, call service, send response
- `routes.ts` — connect URLs to controllers

### The flow of a request

```
HTTP Request
  → routes.ts        (which controller handles this?)
  → controller.ts    (validate input, call service)
  → service.ts       (apply business logic, call repository)
  → repository.ts    (query database)
  → service.ts       (process result)
  → controller.ts    (send HTTP response)
HTTP Response
```

---

## 7. Authentication Module

### Concept

Authentication answers: **"Who are you?"**

### Password hashing

Never store plain text passwords. Use `bcrypt` to hash them:

```typescript
const hashedPassword = await bcrypt.hash(password, 10)
// 10 = salt rounds (higher = slower = more secure)
```

**Important bcrypt limitation:** bcrypt silently truncates input at 72 characters. Always validate `password.max(72)` in your schema.

### JWT tokens

JSON Web Tokens (JWT) are signed strings that carry user information. The server signs them with a secret — only the server can verify them.

**Two token pattern:**

| Token | Lifetime | Purpose |
|-------|----------|---------|
| Access token | 15 minutes | Authenticate API requests |
| Refresh token | 7 days | Get a new access token |

Why two tokens? Short-lived access tokens limit damage if stolen. If your access token leaks, it expires in 15 minutes. The refresh token stays safe (never sent on every request).

Why separate secrets? If access and refresh tokens share a secret, a leaked access token could be used to forge refresh tokens.

### Security: user enumeration

When login fails, **never reveal whether the email exists:**

```typescript
// BAD — tells attacker which emails exist
if (!user) throw new AppError('User not found', 404)
if (!passwordMatch) throw new AppError('Wrong password', 401)

// GOOD — attacker learns nothing
if (!user) throw new AppError('Invalid credentials', 401)
if (!passwordMatch) throw new AppError('Invalid credentials', 401)
```

### Excluding password from responses

Use Prisma's `select` to exclude password at the database level:

```typescript
const user = await prisma.user.create({
  data,
  select: {
    id: true,
    username: true,
    email: true,
    createdAt: true,
    // password is NOT selected — never leaves the database
  }
})
```

This is safer than filtering it out after the query.

### Key files

- `src/modules/auth/auth.schema.ts` — register and login validation
- `src/modules/auth/auth.repository.ts` — createUser, findByEmail
- `src/modules/auth/auth.service.ts` — register, login, refresh logic
- `src/modules/auth/auth.controller.ts` — HTTP handlers
- `src/modules/auth/auth.routes.ts` — POST /register, /login, /refresh
- `src/utils/token.ts` — generateAccessToken, generateRefreshToken
- `src/utils/AppError.ts` — custom error class

---

## 8. Protecting Routes with Middleware

### Concept

Some routes require authentication — you must be logged in to access them. Middleware is the right place to handle this.

**What is middleware?**

A function that runs between the request and the controller. It can:
- Check authentication
- Log requests
- Validate data
- Rate limit

```
Request → middleware → controller → Response
```

### isAuth middleware

```typescript
// src/middlewares/isAuth.ts
export const isAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  // Authorization: Bearer eyJhbGci...
  //                        ^ this part

  if (!token) return next(new AppError('Unauthenticated', 401))

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
    req.user = decoded as TokenPayload // attach user to request
    next() // continue to controller
  } catch (err) {
    return next(new AppError('Token is invalid or expired', 401))
  }
}
```

### Extending Express types

Express's `Request` type doesn't have a `user` property by default. Extend it:

```typescript
// src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}
```

Now `req.user` is available and typed everywhere.

### Using middleware on routes

```typescript
// Apply to a single route
router.get('/me', isAuth, UserController.getMe)

// Apply to all routes in a router
router.use(isAuth)
```

### Key files

- `src/middlewares/isAuth.ts`
- `src/types/express.d.ts`

---

## 9. User Module

### Concept

The user module handles user-related operations. For now, just one endpoint — `GET /api/user/me` — get the authenticated user's profile.

### The flow

```
GET /api/user/me
  → isAuth middleware (verify JWT, attach req.user)
  → UserController.getMe
  → UserService.getMe(req.user.id)
  → UserRepository.findById(id)
  → return user (without password)
```

### Key principle

The controller extracts the user ID from `req.user` — which was set by `isAuth`. This is safe because `isAuth` already verified the token.

```typescript
const id = req.user!.id // ! tells TypeScript: "I know this exists"
```

### Key files

- `src/modules/user/`

---

## 10. Task Module

### Concept

Tasks are the core of Noted. This module demonstrates:
- Full CRUD operations
- Ownership checks
- Pagination and filtering

### Ownership check

A user should only be able to modify their own tasks. Without this, user A could delete user B's tasks.

```typescript
// src/modules/task/task.service.ts
update: async (userId, taskId, data) => {
  const task = await TaskRepository.findById(taskId)
  if (!task) throw new AppError('Task not found', 404)

  if (task.createdById !== userId)
    throw new AppError('You are not authorized to update this task', 403)
    // 403 Forbidden — "I know who you are, but you can't do this"

  return TaskRepository.update(taskId, data)
}
```

**Status codes:**
- `401 Unauthorized` — not logged in
- `403 Forbidden` — logged in but not allowed

### PATCH vs PUT

For updates, always use `PATCH` not `PUT`:
- `PUT` — replace the entire resource (must send all fields)
- `PATCH` — partial update (send only fields you want to change)

With `PATCH`, a user can update just the status without sending title, description, etc.

Zod's `.partial()` makes all fields optional for update schemas:

```typescript
export const updateTaskSchema = createTaskSchema.partial()
// Every field becomes optional automatically
```

### Key files

- `src/modules/task/`

---

## 11. API Quality

### Pagination

Without pagination, `GET /tasks` returns all tasks — could be thousands. Pagination limits results per page.

**How it works:**
```
page=2, limit=10
skip = (2-1) * 10 = 10  → skip first 10 records
take = 10               → return next 10 records
```

```typescript
const page = parseInt(query.page || '1')
const limit = parseInt(query.limit || '10')
const skip = (page - 1) * limit

const [tasks, total] = await Promise.all([
  prisma.task.findMany({ skip, take: limit, where, orderBy }),
  prisma.task.count({ where })
])

return { tasks, total, page, limit }
```

Always return `total` so the frontend can calculate total pages.

### Filtering and sorting

```
GET /apiv1//task?status=PENDING&sortBy=createdAt&order=asc
```

Validate query params with Zod:

```typescript
const taskQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
})
```

### API Versioning

Prefix all routes with `/api/v1/`. This allows breaking changes in future without affecting existing clients — they keep using `/api/v1/` while new clients use `/api/v2/`.

### Rate limiting

Prevent abuse and brute force attacks:

```typescript
// General — 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

// Auth — stricter, 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
})
```

Apply auth limiter specifically to login and register — the most targeted endpoints.

### Helmet

One line that adds multiple HTTP security headers:

```typescript
app.use(helmet())
```

What it does:
- Removes `X-Powered-By: Express` (hides your stack)
- Sets `X-Content-Type-Options` (prevents MIME sniffing)
- Sets `X-Frame-Options` (prevents clickjacking)
- And more...

### Key files

- `src/middlewares/rateLimiter.ts`
- `src/app.ts`

---

## 12. Error Handling

### Concept

Errors happen. The question is how gracefully you handle them.

**Without proper error handling:**
- User gets a 500 with a cryptic stack trace
- Internal implementation details leak to the client
- No consistent error format

**With proper error handling:**
- Every error returns a consistent JSON format
- HTTP status codes are correct
- Internal errors are hidden in production

### Custom AppError class

```typescript
// src/utils/AppError.ts
export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}
```

Throw it anywhere in your code:

```typescript
throw new AppError('Task not found', 404)
throw new AppError('Invalid credentials', 401)
throw new AppError('You are not authorized', 403)
```

### Global error handler

One middleware handles all errors:

```typescript
// src/middlewares/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  // Our own errors — known status code
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  // Zod validation errors — always 400
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.issues,
    })
  }

  // Unknown errors — never expose details in production
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
}
```

**Register it last in `app.ts`** — after all routes:

```typescript
app.use('/api', routes)
app.use(errorHandler) // must be last
```

### Key files

- `src/utils/AppError.ts`
- `src/middlewares/errorHandler.ts`

---

## 13. Docker

### Concept

Docker solves the "works on my machine" problem. It packages your app with everything it needs — Node.js version, dependencies, OS settings — into a container that runs identically everywhere.

**Key terms:**
- **Image** — a blueprint (like a class in OOP)
- **Container** — a running instance of an image (like an object)
- **Dockerfile** — recipe to build an image
- **docker-compose** — orchestrates multiple containers together

### Multi-stage Dockerfile

Build in two stages to keep the final image small:

```dockerfile
# Stage 1 — Builder: install everything, compile TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

# Stage 2 — Production: copy only what's needed to run
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

The production image has no TypeScript, no source code, no dev dependencies — just the compiled output.

### Docker Compose

Run your app and database together:

```yaml
services:
  db:
    image: postgres:15-alpine
    env_file: .env.docker

  app:
    build: .
    env_file: .env.docker
    ports:
      - "5000:5000"
    depends_on:
      - db
```

Note: database URL uses `db` not `localhost` — Docker containers communicate via service names on an internal network.

### Key files

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.docker.example`

---

## 14. CI/CD

### Concept

CI/CD automates the process of testing and deploying code.

- **CI (Continuous Integration)** — run checks on every push (build, tests)
- **CD (Continuous Deployment)** — automatically deploy when CI passes

**Without CI/CD:** manually build → manually test → manually deploy. Error-prone and slow.

**With CI/CD:** push code → everything else is automatic.

### GitHub Actions workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: pnpm install
      - run: pnpm prisma:generate
      - run: pnpm run build
```

# CI Caching
Dependencies are cached between runs using `actions/cache`. This means the second CI run skips reinstalling packages — significantly faster builds.

### Branch Strategy

Never push directly to `main`. Use this flow:
1. Push to `development` branch
2. CI runs automatically
3. If CI passes → auto-merges to `main`
4. Render detects new commit on `main` → deploys automatically

Every push to `main` runs this. If any step fails, the push is flagged.

### Branch protection

Enforce code quality:
- Direct pushes to `main` are blocked
- All changes go through Pull Requests
- CI must pass before merging

This means broken code can never reach `main`.

### Key files

- `.github/workflows/ci.yml`

---

## What to Build Next

Now that you understand how `noted-backend` works, here's a roadmap for going deeper:

### Level 1 — More features on this project
- Logout endpoint
- Task search by title
- Task priority (LOW, MEDIUM, HIGH)
- User profile update

### Level 2 — Architecture patterns
- **Redis caching** — cache frequently read data (e.g. user profile)
- **Background jobs with BullMQ** — send emails, process uploads asynchronously
- **Event-driven patterns** — decouple modules with events

### Level 3 — Database engineering
- **Indexing** — speed up slow queries
- **Transactions** — multiple operations, all or nothing
- **Connection pooling** — manage database connections efficiently

### Level 4 — Advanced DevOps
- **VPS deployment** — deploy to DigitalOcean with Nginx
- **SSL certificates** — HTTPS with Let's Encrypt
- **Environment management** — staging vs production

### Level 5 — Advanced backend
- **WebSockets** — real-time task updates
- **Microservices** — split into auth service, task service
- **GraphQL** — flexible API queries

---

## Final Words

The best way to learn backend engineering is to build things, break them, and understand why they broke.

Take this codebase, clone it, read every file, then try to build something similar from scratch without looking. That gap between reading and doing is where real learning happens.

Good luck.