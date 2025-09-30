# Security Guide

This document outlines security best practices for the Acquisitions API Docker setup with Neon Database.

## Environment Variables Security

### ❌ Never Commit These to Version Control
- `NEON_API_KEY` - Your Neon API key
- `DATABASE_URL` - Database connection strings with credentials
- `JWT_SECRET` - JSON Web Token signing key
- `COOKIE_SECRET` - Cookie signing key
- Any other sensitive configuration

### ✅ Best Practices

#### 1. Use Local Environment Files
```bash
# Development
cp .env.development .env.development.local
# Edit .env.development.local with real values (ignored by git)

# Production
cp .env.production .env.production.local
# Edit .env.production.local with real values (ignored by git)
```

#### 2. Use Docker Secrets (Production)
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    secrets:
      - db_password
      - jwt_secret
    environment:
      DATABASE_URL: postgres://user:$(cat /run/secrets/db_password)@host:5432/db

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

#### 3. Use External Secret Management
```bash
# HashiCorp Vault example
DATABASE_URL=$(vault kv get -field=url secret/database)
JWT_SECRET=$(vault kv get -field=jwt secret/app)

# AWS Secrets Manager
DATABASE_URL=$(aws secretsmanager get-secret-value --secret-id prod/database/url --query SecretString --output text)

# Azure Key Vault
DATABASE_URL=$(az keyvault secret show --vault-name MyKeyVault --name database-url --query value -o tsv)
```

## Docker Security

### Container Security

#### 1. Non-Root User
The Dockerfile already includes:
```dockerfile
# Create and use non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs
```

#### 2. Minimal Base Image
```dockerfile
FROM node:20-alpine AS base
# Alpine is minimal and security-focused
```

#### 3. Multi-stage Build
```dockerfile
# Separate build stages reduce attack surface
FROM base AS development
FROM base AS production
```

### Network Security

#### 1. Internal Networks
```yaml
networks:
  acquisitions-network:
    driver: bridge
    internal: true  # No external access
```

#### 2. Limit Exposed Ports
```yaml
services:
  app:
    ports:
      - "127.0.0.1:3000:3000"  # Bind to localhost only
```

## Neon Database Security

### Development (Neon Local)

#### 1. API Key Protection
```bash
# Store in secure location, not in shell history
export NEON_API_KEY="$(cat ~/.neon/api_key)"

# Or use a secrets file
docker-compose --env-file .secrets -f docker-compose.dev.yml up
```

#### 2. Ephemeral Branches
```yaml
environment:
  PARENT_BRANCH_ID: ${PARENT_BRANCH_ID}  # Creates ephemeral branches
  DELETE_BRANCH: true                    # Auto-cleanup
```

### Production (Neon Cloud)

#### 1. Connection String Security
```bash
# ❌ Bad - credentials in plain text
DATABASE_URL=postgres://user:password@host.neon.tech/db

# ✅ Good - use connection pooling and SSL
DATABASE_URL=postgres://user:password@host.neon.tech/db?sslmode=require&connect_timeout=10
```

#### 2. Network Access Control
- Configure Neon IP allowlist in production
- Use VPC peering or private endpoints when available
- Enable database SSL/TLS enforcement

## Application Security

### 1. Helmet Configuration
```javascript
// Already included in app.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 2. CORS Configuration
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN?.split(',') 
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### 3. Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## Secrets Generation

### Generate Secure Secrets
```bash
# JWT Secret (64 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Cookie Secret (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 64  # For JWT
openssl rand -hex 32  # For cookies
```

## Monitoring and Logging

### 1. Security Events to Log
- Failed authentication attempts
- Invalid JWT tokens
- Rate limit violations
- Database connection failures
- Suspicious request patterns

### 2. Log Security
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    volumes:
      - ./logs:/app/logs:ro  # Read-only mount
```

### 3. Health Monitoring
```bash
# Monitor application health
curl -f http://localhost:3000/health || alert

# Monitor database connectivity
docker-compose exec app npm run db:check || alert
```

## Production Deployment Security

### 1. CI/CD Pipeline Security
```yaml
# GitHub Actions example
- name: Build and deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
  run: |
    docker-compose -f docker-compose.prod.yml up -d
```

### 2. Container Registry Security
```bash
# Use private registry
docker tag app:latest registry.company.com/acquisitions:latest
docker push registry.company.com/acquisitions:latest

# Scan images for vulnerabilities
docker scan app:latest
```

### 3. Runtime Security
```bash
# Use read-only root filesystem
docker run --read-only --tmpfs /tmp app:latest

# Drop capabilities
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE app:latest
```

## Incident Response

### 1. Compromise Detection
- Monitor for unusual database queries
- Check for unexpected network connections
- Review authentication logs
- Monitor resource usage patterns

### 2. Response Actions
```bash
# Immediate actions
docker-compose down                    # Stop services
docker network disconnect app         # Isolate container
kubectl delete pod app-pod            # If using Kubernetes

# Investigation
docker logs app > incident-logs.txt   # Preserve logs
docker exec app netstat -tulpn       # Check connections
```

### 3. Recovery
```bash
# Rotate secrets
kubectl create secret generic new-secrets --from-literal=jwt="new-secret"

# Update database passwords
neon project update --name myproject --password "new-password"

# Redeploy with new secrets
docker-compose -f docker-compose.prod.yml up -d
```

## Security Checklist

### Before Development
- [ ] Configure `.env.development.local` with real Neon credentials
- [ ] Verify `.neon_local/` is in `.gitignore`
- [ ] Generate secure development secrets

### Before Production
- [ ] Set up secrets management system
- [ ] Configure production environment variables
- [ ] Enable SSL/TLS for database connections
- [ ] Set up monitoring and alerting
- [ ] Configure IP allowlists
- [ ] Review and test backup/restore procedures
- [ ] Conduct security testing
- [ ] Document incident response procedures

### Regular Maintenance
- [ ] Rotate secrets quarterly
- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Update base images regularly
- [ ] Conduct security audits quarterly

## Resources

- [Neon Security Documentation](https://neon.com/docs/security)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** open a public GitHub issue
2. Email security@company.com with details
3. Include steps to reproduce the issue
4. Provide your contact information

We will respond within 48 hours and work with you to resolve the issue.