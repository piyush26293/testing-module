# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the AI-Powered Testing Platform.

## Table of Contents

- [Installation and Setup Issues](#installation-and-setup-issues)
- [Database Connection Problems](#database-connection-problems)
- [Browser Launch Failures (Playwright)](#browser-launch-failures-playwright)
- [Memory and Performance Issues](#memory-and-performance-issues)
- [Network Problems](#network-problems)
- [Authentication Errors](#authentication-errors)
- [AI/OpenAI API Issues](#aiopenai-api-issues)
- [Docker and Container Issues](#docker-and-container-issues)
- [File Storage Issues](#file-storage-issues)
- [Log Analysis Techniques](#log-analysis-techniques)
- [Common Error Messages](#common-error-messages)
- [Getting Help](#getting-help)

## Installation and Setup Issues

### Issue: `npm install` fails with permission errors

**Symptoms:**
```
EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solution:**
```bash
# Option 1: Use a node version manager (recommended)
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Option 2: Change npm's default directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Option 3: Fix permissions (not recommended for production)
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP /usr/local/lib/node_modules
```

### Issue: Node.js version mismatch

**Symptoms:**
```
error: Unsupported engine
The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check current version
node --version

# Install correct version (18.0.0 or higher)
nvm install 18
nvm use 18

# Set as default
nvm alias default 18

# Verify
node --version
npm --version
```

### Issue: Docker Compose fails to start

**Symptoms:**
```
ERROR: Cannot start service backend: driver failed
```

**Solution:**
```bash
# Check Docker is running
docker info

# Restart Docker service
sudo systemctl restart docker

# Clean up old containers and volumes
docker-compose down -v
docker system prune -a

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Issue: Port already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
```bash
# Find process using the port
lsof -i :3001
# or
netstat -tuln | grep 3001

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=3002

# For Docker, check if containers are already running
docker ps
docker-compose down
```

### Issue: Missing environment variables

**Symptoms:**
```
Error: Missing required environment variable: OPENAI_API_KEY
```

**Solution:**
```bash
# Copy example env file
cp .env.example .env

# Edit and add required values
nano .env

# For Docker Compose
# Make sure .env is in the root directory
ls -la .env

# Verify environment variables are loaded
docker-compose config

# Restart services
docker-compose restart
```

## Database Connection Problems

### Issue: Cannot connect to PostgreSQL

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
FATAL: password authentication failed for user "postgres"
```

**Diagnosis:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres
# or for local installation
sudo systemctl status postgresql

# Check PostgreSQL logs
docker-compose logs postgres
# or
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Test connection manually
psql -h localhost -U postgres -d ai_testing_platform
# or with Docker
docker-compose exec postgres psql -U postgres -d ai_testing_platform
```

**Solutions:**

1. **PostgreSQL container not running:**
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Check health
docker-compose ps postgres
```

2. **Wrong credentials:**
```bash
# Check .env file
cat .env | grep DATABASE

# Update credentials in .env
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=ai_testing_platform

# Restart backend
docker-compose restart backend
```

3. **Database doesn't exist:**
```bash
# Create database
docker-compose exec postgres createdb -U postgres ai_testing_platform

# Or run init script
docker-compose exec postgres psql -U postgres -f /docker-entrypoint-initdb.d/init.sql
```

4. **Connection pool exhausted:**
```bash
# Check active connections
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Increase max connections in postgresql.conf
max_connections = 200

# Or configure connection pool in backend
# backend/src/database/database.module.ts
poolSize: 50,
```

### Issue: Database migration fails

**Symptoms:**
```
QueryFailedError: relation "users" does not exist
Migration failed: syntax error at or near "CREATE"
```

**Solution:**
```bash
# Check migration status
docker-compose exec backend npm run migration:show

# Revert last migration
docker-compose exec backend npm run migration:revert

# Run migrations again
docker-compose exec backend npm run migration:run

# If migrations are corrupted, reset database (development only)
docker-compose down -v
docker volume rm testing-module_postgres_data
docker-compose up -d postgres
docker-compose exec backend npm run migration:run
docker-compose exec backend npm run seed:run
```

### Issue: Database locks or slow queries

**Symptoms:**
```
Error: canceling statement due to lock timeout
Queries taking longer than expected
```

**Diagnosis:**
```sql
-- Check for locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Find blocking queries
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- Long running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
ORDER BY duration DESC;
```

**Solution:**
```bash
# Kill blocking query (use with caution)
SELECT pg_terminate_backend(<blocking_pid>);

# Analyze and optimize slow queries
EXPLAIN ANALYZE SELECT * FROM test_cases WHERE project_id = 1;

# Add indexes if needed
CREATE INDEX idx_test_cases_project_id ON test_cases(project_id);

# Vacuum and analyze tables
VACUUM ANALYZE;
```

## Browser Launch Failures (Playwright)

### Issue: Playwright browsers not installed

**Symptoms:**
```
Error: browserType.launch: Executable doesn't exist at /home/user/.cache/ms-playwright/chromium-1005/chrome-linux/chrome
```

**Solution:**
```bash
# Install Playwright browsers
npx playwright install

# Install with dependencies
npx playwright install --with-deps

# Install specific browser
npx playwright install chromium

# For Docker, make sure Dockerfile includes browser installation
# backend/Dockerfile
RUN npx playwright install --with-deps chromium

# Check installed browsers
npx playwright install --dry-run
```

### Issue: Browser launch fails in Docker/Headless environment

**Symptoms:**
```
Error: browserType.launch: Browser closed unexpectedly
Error: Failed to launch chromium because executable doesn't exist
```

**Solution:**

1. **Update Dockerfile with required dependencies:**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

# Install Playwright dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Chromium path
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install Playwright
RUN npx playwright install --with-deps chromium
```

2. **Use headless mode:**
```typescript
// test-execution.service.ts
const browser = await chromium.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ],
});
```

3. **Increase shared memory for Docker:**
```yaml
# docker-compose.yml
services:
  backend:
    shm_size: '2gb'
```

### Issue: Browser crashes or hangs during test execution

**Symptoms:**
```
TimeoutError: page.goto: Timeout 30000ms exceeded
Browser process crashed
```

**Solution:**
```typescript
// Increase timeouts
await page.goto('https://example.com', { 
  timeout: 60000,
  waitUntil: 'networkidle' 
});

// Add retry logic
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
  try {
    await page.click('button');
    break;
  } catch (error) {
    if (i === maxRetries - 1) throw error;
    await page.waitForTimeout(1000);
  }
}

// Limit concurrent browser instances
const MAX_CONCURRENT = 5;
const semaphore = new Semaphore(MAX_CONCURRENT);

// Close browser properly
try {
  await page.close();
} finally {
  await browser.close();
}
```

### Issue: Playwright version mismatch

**Symptoms:**
```
Error: Playwright version mismatch
Expected: 1.40.0, Actual: 1.39.0
```

**Solution:**
```bash
# Update Playwright
npm update @playwright/test playwright

# Clear Playwright cache
rm -rf ~/.cache/ms-playwright

# Reinstall browsers
npx playwright install

# For Docker, rebuild image
docker-compose build --no-cache backend
```

## Memory and Performance Issues

### Issue: High memory usage or out of memory errors

**Symptoms:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
Container killed due to OOM
```

**Diagnosis:**
```bash
# Check memory usage
docker stats

# Check Node.js memory
node --max-old-space-size=4096 app.js

# Profile memory usage
node --inspect app.js
# Then use Chrome DevTools

# Check for memory leaks
node --expose-gc --inspect app.js
```

**Solutions:**

1. **Increase Node.js heap size:**
```bash
# In package.json
"scripts": {
  "start": "node --max-old-space-size=4096 dist/main.js"
}

# Or in Docker
ENV NODE_OPTIONS="--max-old-space-size=4096"
```

2. **Limit concurrent test executions:**
```typescript
// execution.service.ts
const MAX_CONCURRENT_TESTS = 3;
private executionQueue = new PQueue({ concurrency: MAX_CONCURRENT_TESTS });

async executeTest(testId: string) {
  return this.executionQueue.add(() => this.runTest(testId));
}
```

3. **Properly close browser contexts:**
```typescript
// Always close contexts and browsers
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  // ... test execution
} finally {
  await context?.close();
  await browser?.close();
}
```

4. **Increase Docker container memory:**
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

### Issue: Slow API responses

**Symptoms:**
```
Request timeout after 30000ms
API endpoints responding slowly
```

**Diagnosis:**
```typescript
// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

**Solutions:**

1. **Enable Redis caching:**
```typescript
// Cache frequently accessed data
@CacheKey('test-cases')
@CacheTTL(300) // 5 minutes
async getTestCases() {
  return this.testCaseRepository.find();
}
```

2. **Optimize database queries:**
```typescript
// Use eager loading to avoid N+1 queries
const tests = await this.testCaseRepository.find({
  relations: ['project', 'suite', 'createdBy'],
  where: { projectId },
});

// Add database indexes
@Index(['projectId', 'status'])
@Entity()
class TestCase {}

// Use query builder for complex queries
const results = await this.testCaseRepository
  .createQueryBuilder('test')
  .leftJoinAndSelect('test.project', 'project')
  .where('project.id = :projectId', { projectId })
  .getMany();
```

3. **Implement pagination:**
```typescript
// Paginate large result sets
async getTestCases(page = 1, limit = 50) {
  return this.testCaseRepository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

### Issue: High CPU usage

**Symptoms:**
```
CPU usage at 100%
Application becomes unresponsive
```

**Solution:**
```bash
# Profile CPU usage
node --prof app.js
node --prof-process isolate-0x*.log > processed.txt

# Use worker threads for CPU-intensive tasks
# worker.ts
const { Worker } = require('worker_threads');

function runInWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./cpu-intensive-task.js', { workerData: data });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

# Limit concurrent operations
const cpuIntensiveQueue = new PQueue({ concurrency: 2 });
```

## Network Problems

### Issue: CORS errors

**Symptoms:**
```
Access to fetch at 'http://api.example.com' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
```typescript
// main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// For multiple origins
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN.split(',');
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

### Issue: Request timeouts

**Symptoms:**
```
Error: timeout of 30000ms exceeded
ETIMEDOUT
```

**Solution:**
```typescript
// Increase axios timeout
axios.defaults.timeout = 60000;

// For specific requests
await axios.get('/api/endpoint', { timeout: 60000 });

// In NestJS HttpModule
HttpModule.register({
  timeout: 60000,
  maxRedirects: 5,
});

// For test executions, increase Playwright timeout
await page.waitForSelector('.element', { timeout: 60000 });
```

### Issue: SSL/TLS certificate errors

**Symptoms:**
```
Error: self signed certificate in certificate chain
UNABLE_TO_VERIFY_LEAF_SIGNATURE
```

**Solution:**
```bash
# For development only (not recommended for production)
NODE_TLS_REJECT_UNAUTHORIZED=0

# Install proper certificates
sudo cp your-ca-cert.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates

# For Node.js application
const https = require('https');
const agent = new https.Agent({
  ca: fs.readFileSync('ca-cert.pem'),
});

axios.defaults.httpsAgent = agent;
```

### Issue: DNS resolution failures

**Symptoms:**
```
Error: getaddrinfo ENOTFOUND
DNS lookup failed
```

**Solution:**
```bash
# Check DNS settings
cat /etc/resolv.conf

# Test DNS resolution
nslookup api.testing-platform.com
dig api.testing-platform.com

# For Docker, configure DNS
# docker-compose.yml
services:
  backend:
    dns:
      - 8.8.8.8
      - 8.8.4.4

# Or use hostnames in hosts file
echo "127.0.0.1 api.testing-platform.local" >> /etc/hosts
```

## Authentication Errors

### Issue: JWT token expired or invalid

**Symptoms:**
```
Error: Token expired
Unauthorized: Invalid token
401 Unauthorized
```

**Solution:**
```typescript
// Implement token refresh
async refreshToken(refreshToken: string) {
  try {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    return this.generateTokens(payload.userId);
  } catch (error) {
    throw new UnauthorizedException('Invalid refresh token');
  }
}

// Client-side: Intercept 401 and refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await refreshAccessToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axios.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Issue: Password authentication fails

**Symptoms:**
```
Error: Invalid credentials
Password comparison failed
```

**Diagnosis:**
```typescript
// Debug password hashing
import * as bcrypt from 'bcrypt';

// Check if password is properly hashed
const isHashed = await bcrypt.compare(plainPassword, hashedPassword);
console.log('Password match:', isHashed);

// Verify salt rounds
const saltRounds = 10;
const hash = await bcrypt.hash(password, saltRounds);
```

**Solution:**
```typescript
// Ensure consistent password hashing
async hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async validatePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Reset user password
async resetPassword(userId: string, newPassword: string) {
  const hashedPassword = await this.hashPassword(newPassword);
  await this.userRepository.update(userId, { 
    password: hashedPassword,
    passwordResetToken: null,
    passwordResetExpires: null,
  });
}
```

### Issue: Session expired or not persisting

**Symptoms:**
```
User logged out unexpectedly
Session data not available
```

**Solution:**
```typescript
// Configure session properly
import * as session from 'express-session';
import * as RedisStore from 'connect-redis';

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);
```

## AI/OpenAI API Issues

### Issue: OpenAI API key invalid or rate limited

**Symptoms:**
```
Error: Incorrect API key provided
Error: Rate limit exceeded
Error: 429 Too Many Requests
```

**Solution:**
```bash
# Verify API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check rate limits
# Implement exponential backoff
```

```typescript
// Implement retry with backoff
async callOpenAI(prompt: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await this.openai.createCompletion({
        model: 'gpt-4',
        prompt,
        max_tokens: 2000,
      });
      return response.data.choices[0].text;
    } catch (error) {
      if (error.response?.status === 429) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Implement caching to reduce API calls
@CacheKey('ai-response')
@CacheTTL(3600)
async generateTestCase(description: string) {
  return this.callOpenAI(description);
}
```

### Issue: OpenAI API timeout

**Symptoms:**
```
Error: Request timeout
OpenAI API not responding
```

**Solution:**
```typescript
// Increase timeout
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds
});

// Implement circuit breaker pattern
class CircuitBreaker {
  private failures = 0;
  private nextAttempt = Date.now();
  private readonly threshold = 5;
  private readonly timeout = 60000;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.failures >= this.threshold && Date.now() < this.nextAttempt) {
      throw new Error('Circuit breaker is open');
    }
    
    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      this.nextAttempt = Date.now() + this.timeout;
      throw error;
    }
  }
}
```

### Issue: Invalid AI response format

**Symptoms:**
```
Error: Cannot parse AI response
Unexpected response format
```

**Solution:**
```typescript
// Add response validation
async generateTestCase(description: string) {
  const response = await this.callOpenAI(description);
  
  try {
    const parsed = JSON.parse(response);
    
    // Validate structure
    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      throw new Error('Invalid response structure');
    }
    
    return parsed;
  } catch (error) {
    // Fallback or retry
    this.logger.error('Failed to parse AI response', error);
    return this.getFallbackResponse();
  }
}

// Use structured prompts
const prompt = `Generate a test case for: ${description}
Return ONLY valid JSON in this format:
{
  "title": "Test case title",
  "steps": [
    {"action": "navigate", "target": "url"},
    {"action": "click", "selector": "button"}
  ],
  "assertions": ["Expected result"]
}`;
```

## Docker and Container Issues

### Issue: Container keeps restarting

**Symptoms:**
```
Container exits immediately after starting
Restart count increasing
```

**Diagnosis:**
```bash
# Check container logs
docker logs <container-id>
docker-compose logs backend

# Check container status
docker ps -a
docker inspect <container-id>

# Check exit code
docker inspect <container-id> --format='{{.State.ExitCode}}'
```

**Solution:**
```bash
# Common causes and fixes:

# 1. Application crash on startup
# Check logs for errors and fix code

# 2. Missing environment variables
# Verify .env file is present and loaded
docker-compose config

# 3. Port conflict
# Change port mapping in docker-compose.yml

# 4. Health check failing
# Adjust health check or fix application
# docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 40s
```

### Issue: Cannot connect to other containers

**Symptoms:**
```
Error: connect ECONNREFUSED backend:3001
Service not found
```

**Solution:**
```bash
# Ensure services are on same network
docker network ls
docker network inspect testing-module_testing-network

# Use service name as hostname
# Instead of: http://localhost:3001
# Use: http://backend:3001

# docker-compose.yml
networks:
  testing-network:
    driver: bridge

services:
  backend:
    networks:
      - testing-network
```

### Issue: Volume mount not working

**Symptoms:**
```
Files not syncing between host and container
Changes not reflected
```

**Solution:**
```bash
# Check volume mounts
docker inspect <container-id> | grep Mounts -A 10

# Fix permissions
sudo chown -R $USER:$USER ./backend

# For named volumes, check location
docker volume inspect testing-module_postgres_data

# Recreate volumes
docker-compose down -v
docker-compose up -d
```

## File Storage Issues

### Issue: MinIO connection failed

**Symptoms:**
```
Error: Cannot connect to MinIO
S3 bucket not accessible
```

**Solution:**
```bash
# Check MinIO is running
docker-compose ps minio
docker-compose logs minio

# Test MinIO connection
curl http://localhost:9000/minio/health/live

# Access MinIO console
http://localhost:9001

# Create bucket if missing
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/testing-platform

# Check bucket policy
mc policy get local/testing-platform
```

### Issue: File upload fails

**Symptoms:**
```
Error: File size too large
Upload timeout
Storage quota exceeded
```

**Solution:**
```typescript
// Increase file size limit
// main.ts
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only certain file types
    if (file.mimetype.startsWith('image/') || file.mimetype === 'video/webm') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Stream large files
async uploadLargeFile(file: Express.Multer.File) {
  const stream = Readable.from(file.buffer);
  await this.minioService.putObject(
    'testing-platform',
    file.originalname,
    stream,
    file.size
  );
}
```

## Log Analysis Techniques

### Centralized Logging

```bash
# View all logs
docker-compose logs -f

# Filter by service
docker-compose logs -f backend

# Filter by time
docker-compose logs --since 10m backend

# Search logs
docker-compose logs backend | grep ERROR

# Export logs
docker-compose logs --no-color > logs.txt
```

### Log Levels

```typescript
// Configure Winston logger
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'combined.log' 
    }),
  ],
});

// Use different log levels
this.logger.error('Critical error', error);
this.logger.warn('Warning message');
this.logger.info('Info message');
this.logger.debug('Debug details');
```

### Request Tracing

```typescript
// Add correlation ID to requests
import { v4 as uuidv4 } from 'uuid';

app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Log with request ID
this.logger.info('Processing request', { 
  requestId: req.id,
  userId: req.user?.id,
  path: req.path,
});
```

## Common Error Messages

### `ECONNRESET` or `socket hang up`

**Cause:** Network connection terminated unexpectedly

**Solution:**
- Increase timeouts
- Check network stability
- Implement retry logic
- Check if backend service is overloaded

### `Cannot find module`

**Cause:** Missing dependency or incorrect path

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check import paths
# Use absolute imports with TypeScript paths
```

### `UnhandledPromiseRejectionWarning`

**Cause:** Promise rejection not caught

**Solution:**
```typescript
// Always catch promises
try {
  await someAsyncFunction();
} catch (error) {
  this.logger.error('Error in async function', error);
}

// Or use .catch()
someAsyncFunction().catch(error => {
  this.logger.error('Error', error);
});

// Global handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
```

### `Maximum call stack size exceeded`

**Cause:** Infinite recursion or circular reference

**Solution:**
```typescript
// Check for circular dependencies
// Use @Injectable() scope: 'TRANSIENT' if needed

// Avoid circular JSON
JSON.stringify(obj, (key, value) => {
  if (value !== null && typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);
  }
  return value;
});
```

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Search existing GitHub issues
3. Check application logs
4. Try the solution in a clean environment
5. Prepare minimal reproducible example

### Information to Include

- OS and version
- Node.js and npm versions
- Docker and Docker Compose versions
- Application version
- Complete error message and stack trace
- Steps to reproduce
- Environment variables (redact secrets)
- Relevant logs
- What you've already tried

### Support Channels

- **Documentation**: [Full documentation](README.md)
- **GitHub Issues**: [Report bugs](https://github.com/piyush26293/testing-module/issues)
- **Discussions**: [Ask questions](https://github.com/piyush26293/testing-module/discussions)
- **Email**: support@testing-platform.com

### Debug Mode

Enable debug mode for verbose logging:

```bash
# .env
LOG_LEVEL=debug
DEBUG=*

# Run with debug output
DEBUG=* npm run start:dev

# Docker
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up
```

## Quick Reference Commands

```bash
# Health checks
curl http://localhost:3001/health
docker-compose ps

# View logs
docker-compose logs -f --tail=100

# Restart services
docker-compose restart backend

# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Database access
docker-compose exec postgres psql -U postgres -d ai_testing_platform

# Redis access
docker-compose exec redis redis-cli

# Backend shell
docker-compose exec backend sh

# Check resource usage
docker stats

# Check network
docker network inspect testing-module_testing-network
```

## Performance Tuning Checklist

- [ ] Enable Redis caching
- [ ] Add database indexes
- [ ] Implement pagination
- [ ] Optimize database queries
- [ ] Limit concurrent operations
- [ ] Use connection pooling
- [ ] Enable compression
- [ ] Implement CDN for static assets
- [ ] Configure proper resource limits
- [ ] Monitor and analyze metrics

## Security Checklist

- [ ] Use strong, unique secrets
- [ ] Enable HTTPS/TLS
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use parameterized queries
- [ ] Keep dependencies updated
- [ ] Enable security headers
- [ ] Implement proper CORS
- [ ] Use environment variables for secrets
- [ ] Regular security audits

---

**Still having issues?** Please open an issue on [GitHub](https://github.com/piyush26293/testing-module/issues) with detailed information about your problem.
