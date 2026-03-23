# Contributing to noted-backend

First off, thank you for taking the time to contribute!

This project was built as a learning exercise in production backend engineering. Contributions that improve the code quality, fix bugs, improve documentation, or add meaningful features are all welcome.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Project Structure](#project-structure)
- [What to Contribute](#what-to-contribute)

---

## Code of Conduct

Be respectful and constructive. This is a learning-focused project questions, suggestions, and beginner contributions are all welcome.

---

## Getting Started

### 1. Fork the repository

Click the **Fork** button on the top right of the repository page.

### 2. Clone your fork

```bash
git clone https://github.com/your-username/noted_backend.git
cd noted_backend
```

### 3. Set up the project

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your values in .env

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate init

# Start dev server
pnpm run dev
```

### 4. Create a branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Useful Scripts
```bash
# First time setup
./scripts/setup.sh

# Clean rebuild (run this if Prisma client issues occur)
./scripts/fresh-build.sh

# Run migrations against a remote database
./scripts/migrate.sh your_database_url
```
> Run `chmod +x scripts/*.sh` to make scripts executable on Mac/Linux.
> On Windows use Git Bash to run these scripts.

---

## Development Workflow

1. Make your changes on your feature branch
2. Test your changes using Hoppscotch or Postman against `http://localhost:5000/api/v1`
3. Make sure the project builds without errors: `pnpm run build`
4. Push to `development` branch — CI will run automatically and merge to `main` if it passes
5. Push to your fork and open a Pull Request

---

## Commit Message Convention

This project follows **Conventional Commits**. Every commit message should follow this format:

```
type(scope): short description
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Build process, tooling, or dependency updates |
| `docs` | Documentation changes only |
| `style` | Formatting changes (no logic change) |
| `perf` | Performance improvement |

### Scopes

Use the module or file area as the scope:

```
feat(auth): add logout endpoint
fix(task): fix ownership check on update
refactor(middleware): simplify error handler
docs(readme): update setup instructions
chore(docker): update node version to 20
```

### Examples

```bash
git commit -m "feat(task): add due date filtering to getAll"
git commit -m "fix(auth): return 401 instead of 500 on expired token"
git commit -m "docs(contributing): add commit message guide"
git commit -m "chore(deps): upgrade prisma to 7.6.0"
```

---

## Pull Request Guidelines

### Before opening a PR

- [ ] Your branch is up to date with `main`
- [ ] The project builds successfully (`pnpm run build`)
- [ ] You've tested your changes manually
- [ ] Your commit messages follow the convention above

### PR title

Follow the same convention as commit messages:
```
feat(task): add due date filtering
fix(auth): handle expired refresh token gracefully
```

### PR description

Include:
- **What** — what does this PR do?
- **Why** — why is this change needed?
- **How** — any implementation notes worth highlighting?
- **Testing** — how did you test this?

### Review process

- All PRs must pass CI (build check) before merging
- Direct pushes to `main` are blocked — everything goes through a PR
- At least one approval is required before merging

---

## Project Structure

Understanding the structure helps you know where to make changes:

```
src/modules/<module>/
├── <module>.schema.ts      # Zod validation schemas
├── <module>.repository.ts  # Database queries (Prisma)
├── <module>.service.ts     # Business logic
├── <module>.controller.ts  # Request/response handling
└── <module>.routes.ts      # Route definitions
```

When adding a new feature to an existing module, follow this pattern. When adding a new module, create all five files.

---

## What to Contribute

### Good first issues
- Fix typos or improve documentation
- Add missing `.env` variable descriptions
- Improve error messages
- Add input validation improvements

### Feature ideas
- Logout endpoint (JWT blacklist or client-side)
- Task priority field (LOW, MEDIUM, HIGH)
- Task search by title
- User profile update endpoint
- Project model (group tasks under projects)

### What to avoid
- Breaking changes to existing API contracts
- Adding dependencies without discussion
- Large refactors without opening an issue first

---

## Questions?

If you're unsure about something, open an **Issue** before starting work. This saves everyone time and ensures your contribution aligns with the project direction.

Happy contributing!