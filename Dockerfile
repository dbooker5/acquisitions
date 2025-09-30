# Use the official Node.js 20 LTS image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
# Install all dependencies (including devDependencies)
RUN npm ci
# Copy source code
COPY . .
# Change ownership to nodejs user
RUN chown -R nextjs:nodejs /app
USER nextjs
# Expose port
EXPOSE 3000
# Start the application with hot reload
CMD ["dumb-init", "npm", "run", "dev"]

# Production dependencies stage
FROM base AS deps
# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM base AS production
# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY . .
# Copy healthcheck script
COPY healthcheck.js ./healthcheck.js
# Change ownership to nodejs user
RUN chown -R nextjs:nodejs /app
USER nextjs
# Expose port
EXPOSE 3000
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["node", "healthcheck.js"]

# Start the application
CMD ["dumb-init", "node", "src/index.js"]