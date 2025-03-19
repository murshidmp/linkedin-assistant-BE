#
# Stage 1: Dependencies
#   - Install all dependencies (including devDeps for building).
#   - This stage is cached for faster rebuilds when your dependencies don’t change.
#
FROM node:18-alpine AS deps
WORKDIR /app

# Copy only package manifests first to leverage Docker caching
COPY package*.json ./

# Install *all* dependencies
RUN npm ci

#
# Stage 2: Builder
#   - Copies in the full source code, then compiles the NestJS application.
#
FROM node:18-alpine AS builder
WORKDIR /app

# Copy node_modules from 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy remaining source code (including /src, tsconfig, etc.)
COPY . .

# Build the NestJS app (output to /dist by default)
RUN npm run build

#
# Stage 3: Runner (production)
#   - Creates a minimal final image with only runtime dependencies
#
FROM node:18-alpine AS runner
WORKDIR /app

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy package.json and package-lock.json to install ONLY production deps
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --production

# If you need environment variables, copy or mount a .env file
# COPY --from=builder /app/.env ./

# Expose the NestJS default port
EXPOSE 3000

# Start the NestJS application
CMD ["node", "dist/main.js"]
