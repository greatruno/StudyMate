# Multi-stage Dockerfile for StudyMate v1.0 Production Deployment

# -----------------------------------------------------------------------------
# Stage 1: Build Stage
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy full application source
COPY . .

# Environment variables for production build
ENV NODE_ENV=production

# Execute production build (runs 'vite build' and 'esbuild server.ts')
RUN npm run build

# Prune devDependencies for minimal runtime image
RUN npm prune --production

# -----------------------------------------------------------------------------
# Stage 2: Runtime Production Image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Install security updates
RUN apk add --no-cache tzdata

# Set production environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Create a non-root system user and group for security
RUN addgroup -S studymate && adduser -S studymate -G studymate

# Copy built dist assets and bundled server CommonJS file
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/docs/openapi.json ./docs/openapi.json

# Create upload directory with non-root ownership
RUN mkdir -p /tmp/study_mate_docs /tmp/study_mate_users && \
    chown -R studymate:studymate /app /tmp/study_mate_docs /tmp/study_mate_users

# Switch to non-privileged user
USER studymate

# Expose port 3000
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Launch production bundled server
CMD ["node", "dist/server.cjs"]
