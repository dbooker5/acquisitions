# Acquisitions API

A Node.js Express application with Neon Database integration, fully dockerized for development and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Environment Configuration](#environment-configuration)
- [Docker Commands](#docker-commands)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Neon Account](https://neon.tech/) with a project created
- Git

## Project Structure

```
acquisitions/
├── src/
│   ├── app.js              # Express app configuration
│   ├── index.js            # Application entry point
│   ├── server.js           # Server startup
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models (Drizzle)
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── drizzle/                # Database migrations
├── logs/                   # Application logs
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.dev.yml  # Development environment
├── docker-compose.prod.yml # Production environment
├── .env.development        # Development environment variables
├── .env.production         # Production environment variables
└── drizzle.config.js       # Drizzle ORM configuration
```

## Development Setup

### Step 1: Clone and Configure

```bash
# Clone the repository
git clone <your-repository-url>
cd acquisitions

# Copy and configure development environment
cp .env.development .env.development.local
```

### Step 2: Configure Neon Local

Edit `.env.development.local` and replace the placeholder values:

```env
# Get these values from your Neon console (https://console.neon.tech/)
NEON_API_KEY=your_actual_neon_api_key
NEON_PROJECT_ID=your_actual_project_id
PARENT_BRANCH_ID=your_main_branch_id

# Generate secure secrets for development
JWT_SECRET=your_development_jwt_secret_32_chars_min
COOKIE_SECRET=your_development_cookie_secret_32_chars_min
```

### Step 3: Start Development Environment

```bash
# Start the application with Neon Local
docker-compose -f docker-compose.dev.yml up -d

# Check if services are running
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f app
```

### Step 4: Run Database Migrations

```bash
# Generate migrations (if needed)
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Apply migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
```

### Step 5: Access Your Application

- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Endpoint**: http://localhost:3000/api
- **Drizzle Studio** (optional): http://localhost:4983

### Optional: Start with Drizzle Studio

```bash
# Start development environment with database studio
docker-compose -f docker-compose.dev.yml --profile studio up -d
```

## Production Setup

### Step 1: Configure Production Environment

Create a production environment file:

```bash
cp .env.production .env.production.local
```

Edit `.env.production.local` with your production values:

```env
# Your actual Neon Cloud Database URL
DATABASE_URL=postgres://username:password@hostname.neon.tech/dbname?sslmode=require

# Generate strong, unique secrets for production
JWT_SECRET=your_production_jwt_secret_64_chars_recommended
COOKIE_SECRET=your_production_cookie_secret_64_chars_recommended

# Optional: Configure CORS for your domain
CORS_ORIGIN=https://yourdomain.com
```

### Step 2: Deploy to Production

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations (if needed)
docker-compose -f docker-compose.prod.yml --profile migrate up migrate

# Check service health
docker-compose -f docker-compose.prod.yml ps
```

### Step 3: Optional Nginx Setup

```bash
# Start with Nginx reverse proxy
docker-compose -f docker-compose.prod.yml --profile nginx up -d
```

## Environment Configuration

### Development (.env.development)
- Uses **Neon Local** proxy for database access
- Connects to ephemeral database branches
- Includes debug logging and development-friendly settings
- Database URL: `postgres://neon:npg@neon-local:5432/acquisitions?sslmode=require`

### Production (.env.production)
- Uses **Neon Cloud Database** directly
- Optimized for performance and security
- Environment variables injected via secrets management
- Database URL: Your actual Neon Cloud connection string

## Docker Commands

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Restart services
docker-compose -f docker-compose.dev.yml restart

# View logs
docker-compose -f docker-compose.dev.yml logs -f [service-name]

# Execute commands in container
docker-compose -f docker-compose.dev.yml exec app bash
docker-compose -f docker-compose.dev.yml exec app npm run db:studio

# Remove everything (including volumes)
docker-compose -f docker-compose.dev.yml down -v --remove-orphans
```

### Production Commands

```bash
# Deploy production
docker-compose -f docker-compose.prod.yml up -d

# Scale application
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Update application (rolling update)
docker-compose -f docker-compose.prod.yml up -d --no-deps app

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app

# Run migrations
docker-compose -f docker-compose.prod.yml --profile migrate up migrate

# Stop production
docker-compose -f docker-compose.prod.yml down
```

## Database Management

### Drizzle ORM Commands

```bash
# Generate new migration
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Apply migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml --profile studio up drizzle-studio
```

### Direct Database Access

```bash
# Connect to Neon Local (development)
docker-compose -f docker-compose.dev.yml exec neon-local psql -U neon -d acquisitions

# For production, use your Neon Cloud dashboard or CLI tools
```

## Troubleshooting

### Common Issues

1. **Neon Local Connection Failed**
   ```bash
   # Check if Neon Local is running
   docker-compose -f docker-compose.dev.yml logs neon-local
   
   # Verify environment variables
   docker-compose -f docker-compose.dev.yml exec app env | grep NEON
   ```

2. **Application Won't Start**
   ```bash
   # Check application logs
   docker-compose -f docker-compose.dev.yml logs app
   
   # Verify health check
   curl http://localhost:3000/health
   ```

3. **Database Migration Issues**
   ```bash
   # Reset database (development only)
   docker-compose -f docker-compose.dev.yml down -v
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Permission Issues (Windows)**
   ```powershell
   # Ensure Docker Desktop is running as administrator
   # Check file sharing settings in Docker Desktop
   ```

### Logging

Development logs are available at:
- Application logs: `./logs/combined.log`
- Error logs: `./logs/error.log`
- Docker logs: `docker-compose logs`

## Security Considerations

### Development
- Neon Local uses self-signed certificates
- Debug logging may contain sensitive information
- Use `.env.development.local` for local overrides (not tracked in git)

### Production
- Use secrets management systems (Docker Secrets, Kubernetes Secrets, etc.)
- Enable rate limiting and security headers
- Regularly update dependencies and base images
- Monitor application logs for security events
- Use HTTPS in production (configure nginx accordingly)

### Environment Variables Security

**Never commit these to version control:**
- API keys (`NEON_API_KEY`)
- Database URLs with credentials
- JWT secrets
- Cookie secrets

**Best Practices:**
```bash
# Use a secrets management system
DATABASE_URL=$(vault kv get -field=url secret/database)

# Or use Docker secrets
echo "my-secret-value" | docker secret create db_password -

# Reference in docker-compose.yml
secrets:
  - db_password
```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint
- `GET /api` - API status
- `POST /api/auth/*` - Authentication endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes using the development environment
4. Test thoroughly
5. Submit a pull request

## Support

For issues related to:
- **Neon Database**: [Neon Documentation](https://neon.com/docs)
- **Docker**: [Docker Documentation](https://docs.docker.com/)
- **Application**: Create an issue in this repository

---

## Quick Start Commands

### Development
```bash
# One-time setup
cp .env.development .env.development.local
# Edit .env.development.local with your Neon credentials

# Start development
docker-compose -f docker-compose.dev.yml up -d

# Access app at http://localhost:3000
```

### Production
```bash
# One-time setup
cp .env.production .env.production.local
# Edit .env.production.local with production values

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```