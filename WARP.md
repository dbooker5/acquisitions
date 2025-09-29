# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js/Express.js REST API for an acquisitions system built with modern JavaScript (ES modules). The application uses:
- **Database**: PostgreSQL with Drizzle ORM (via Neon serverless)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Zod schemas for request validation
- **Logging**: Winston for structured logging
- **Security**: Helmet, CORS, secure cookies

## Common Development Commands

### Development
```bash
npm run dev           # Start development server with --watch (auto-restart)
```

### Code Quality
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix linting issues automatically
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

### Database Operations
```bash
npm run db:generate   # Generate Drizzle migration files
npm run db:migrate    # Run database migrations
npm run db:studio     # Open Drizzle Studio (database GUI)
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Set `DATABASE_URL` to your PostgreSQL connection string
3. Set `JWT_SECRET` for authentication (required for production)

## Architecture & Code Structure

### Import Path Mapping
The project uses Node.js import maps for clean imports:
- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*` 
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

Always use these mapped imports instead of relative paths when importing from these directories.

### Application Flow
1. **Entry Point**: `src/index.js` loads environment and starts `src/server.js`
2. **Server Setup**: `src/server.js` starts Express app from `src/app.js`
3. **App Configuration**: `src/app.js` configures middleware, routes, and security

### Database Architecture
- **ORM**: Drizzle ORM with Neon serverless PostgreSQL
- **Models**: Located in `src/models/` - define database schemas using Drizzle's pgTable
- **Connection**: Configured in `src/config/database.js`
- **Migrations**: Generated in `./drizzle/` directory

Example model pattern:
```javascript
import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const tableName = pgTable("table_name", {
    id: serial("id").primaryKey(),
    // other fields...
    created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
```

### Authentication System
- **JWT Tokens**: Managed via `src/utils/jwt.js`
- **Password Hashing**: bcrypt with salt rounds in `src/services/auth.service.js`
- **Cookies**: Secure HTTP-only cookies via `src/utils/cookies.js`
- **Validation**: Zod schemas in `src/validations/auth.validations.js`

### Request Validation Pattern
All routes should use Zod validation:
1. Define schemas in `src/validations/`
2. Use `schema.safeParseAsync()` in controllers
3. Format errors with `formatValidationError()` from `#utils/format.js`

### Service Layer Pattern
- **Controllers**: Handle HTTP requests/responses, validation, and error formatting
- **Services**: Contain business logic and database operations
- **Models**: Define database schemas only

### Logging
- **Winston Logger**: Configured in `src/config/logger.js`
- **Log Levels**: Controlled by `LOG_LEVEL` environment variable
- **File Logging**: `logs/error.log` and `logs/combined.log`
- **Console Logging**: Enabled in non-production environments

### Code Style
- **ES Modules**: Use `import/export` syntax
- **ESLint Config**: 2-space indentation, single quotes, semicolons required
- **Arrow Functions**: Preferred over function declarations
- **Const/Let**: No `var` usage (enforced by linting)

## Testing
No test framework is currently configured. When adding tests:
- ESLint is pre-configured for Jest globals in `tests/` directory
- Consider adding test scripts to `package.json`

## Key Files to Understand
- `src/app.js`: Main Express application setup and middleware configuration
- `src/config/database.js`: Database connection and Drizzle setup
- `drizzle.config.js`: Drizzle Kit configuration for migrations
- `eslint.config.js`: ESLint rules and configuration