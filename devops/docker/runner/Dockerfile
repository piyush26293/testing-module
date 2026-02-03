# Playwright Test Runner with all browsers
FROM mcr.microsoft.com/playwright:v1.58.1-jammy

# Set working directory
WORKDIR /app

# Install Node.js 20 (if not already present)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1001 runner && \
    useradd -r -u 1001 -g runner runner && \
    mkdir -p /app/test-results /app/test-artifacts && \
    chown -R runner:runner /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy application code
COPY . .

# Install Playwright browsers (already in base image, but ensure latest)
RUN npx playwright install --with-deps

# Change ownership
RUN chown -R runner:runner /app

# Switch to non-root user
USER runner

# Create volume mount points
VOLUME ["/app/test-results", "/app/test-artifacts"]

# Expose port for potential debugging
EXPOSE 9229

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "process.exit(0)"

# Default command to run tests
CMD ["npm", "run", "test:e2e"]
