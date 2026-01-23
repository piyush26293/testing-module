# How to Run - AI-Powered Testing Platform

A complete step-by-step guide to set up and run the AI-Powered End-to-End Web Application Testing Platform.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Docker)](#quick-start-docker)
3. [Manual Setup](#manual-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Platform](#running-the-platform)
6. [Accessing the Application](#accessing-the-application)
7. [First-Time Setup](#first-time-setup)
8. [Running Tests](#running-tests)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 20.x or higher | Runtime for backend and frontend |
| **npm** | 10.x or higher | Package manager |
| **Docker** | 24.x or higher | Containerization |
| **Docker Compose** | 2.x or higher | Multi-container orchestration |
| **Git** | 2.x or higher | Version control |

### Optional (for production)

| Software | Version | Purpose |
|----------|---------|---------|
| **kubectl** | 1.28+ | Kubernetes CLI |
| **Helm** | 3.x | Kubernetes package manager |
| **PostgreSQL** | 15.x | Database (if not using Docker) |
| **Redis** | 7.x | Cache and queue (if not using Docker) |

### Verify Prerequisites

```bash
# Check Node.js
node --version
# Expected: v20.x.x or higher

# Check npm
npm --version
# Expected: 10.x.x or higher

# Check Docker
docker --version
# Expected: Docker version 24.x.x or higher

# Check Docker Compose
docker compose version
# Expected: Docker Compose version v2.x.x

# Check Git
git --version
# Expected: git version 2.x.x
```

---

## Quick Start (Docker)

The fastest way to get the platform running is with Docker Compose.

### Step 1: Clone the Repository

```bash
git clone https://github.com/piyush26293/testing-module.git
cd testing-module
```

### Step 2: Create Environment File

```bash
# Copy the example environment file
cp env/.env.example .env
```

### Step 3: Configure Required Variables

Edit the `.env` file and set at minimum:

```env
# Database
DATABASE_PASSWORD=your_secure_password_here

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# OpenAI API Key (required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Step 4: Start the Platform

```bash
# Start all services in development mode
docker compose -f devops/docker-compose.dev.yml up -d

# View logs
docker compose -f devops/docker-compose.dev.yml logs -f
```

### Step 5: Wait for Services to Start

The first startup may take 2-5 minutes as Docker downloads images and builds containers.

```bash
# Check if all services are running
docker compose -f devops/docker-compose.dev.yml ps
```

All services should show `running` or `healthy` status.

### Step 6: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api
- **MinIO Console**: http://localhost:9001

---

## Manual Setup

If you prefer to run services without Docker:

### Step 1: Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/piyush26293/testing-module.git
cd testing-module

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Set Up PostgreSQL

```bash
# Using Docker for PostgreSQL only
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=testing_platform \
  -p 5432:5432 \
  postgres:15-alpine

# Or install PostgreSQL locally and create database
createdb testing_platform
```

### Step 3: Set Up Redis

```bash
# Using Docker for Redis only
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine

# Or install Redis locally
```

### Step 4: Set Up MinIO (Object Storage)

```bash
# Using Docker for MinIO
docker run -d \
  --name minio \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  -p 9000:9000 \
  -p 9001:9001 \
  minio/minio server /data --console-address ":9001"
```

### Step 5: Configure Environment

```bash
# In the backend directory
cd backend
cp .env.example .env

# Edit .env with your database credentials
```

### Step 6: Run Database Migrations

```bash
cd backend
npm run migration:run
npm run seed:run  # Optional: seed with demo data
```

### Step 7: Start Backend

```bash
cd backend
npm run start:dev
```

### Step 8: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

---

## Environment Configuration

### Complete Environment Variables

Create a `.env` file with the following variables:

```env
# ===========================================
# APPLICATION
# ===========================================
NODE_ENV=development
APP_NAME=AI Testing Platform
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# ===========================================
# DATABASE (PostgreSQL)
# ===========================================
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=testing_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password

# ===========================================
# REDIS
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ===========================================
# JWT AUTHENTICATION
# ===========================================
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800

# ===========================================
# OPENAI (Required for AI Features)
# ===========================================
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4096

# ===========================================
# MINIO / S3 STORAGE
# ===========================================
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=testing-platform

# ===========================================
# PLAYWRIGHT (Test Runner)
# ===========================================
PLAYWRIGHT_BROWSERS=chromium,firefox,webkit
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
PLAYWRIGHT_VIDEO=true
PLAYWRIGHT_SCREENSHOTS=true

# ===========================================
# FEATURE FLAGS
# ===========================================
ENABLE_AI_FEATURES=true
ENABLE_VIDEO_RECORDING=true
MAX_PARALLEL_TESTS=5

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

### Getting an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key and add it to your `.env` file

> ⚠️ **Important**: Never commit your API keys to version control!

---

## Running the Platform

### Development Mode

```bash
# Using Docker Compose (Recommended)
docker compose -f devops/docker-compose.dev.yml up

# With live logs
docker compose -f devops/docker-compose.dev.yml up -d
docker compose -f devops/docker-compose.dev.yml logs -f

# Stop services
docker compose -f devops/docker-compose.dev.yml down
```

### Production Mode

```bash
# Build and run production containers
docker compose -f devops/docker-compose.prod.yml up -d

# Check status
docker compose -f devops/docker-compose.prod.yml ps
```

### Individual Services

```bash
# Start only specific services
docker compose -f devops/docker-compose.dev.yml up backend frontend -d

# Restart a specific service
docker compose -f devops/docker-compose.dev.yml restart backend
```

---

## Accessing the Application

### URLs and Ports

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application UI |
| **Backend API** | http://localhost:3001 | REST API endpoints |
| **Swagger Docs** | http://localhost:3001/api | Interactive API documentation |
| **MinIO Console** | http://localhost:9001 | Object storage management |
| **PostgreSQL** | localhost:5432 | Database (use pgAdmin or CLI) |
| **Redis** | localhost:6379 | Cache (use redis-cli) |

### Default Credentials

After running seed data, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@example.com | Admin123! |
| **QA Lead** | qalead@example.com | QALead123! |
| **Developer** | dev@example.com | Dev123! |

> 🔒 **Security**: Change these credentials immediately in production!

---

## First-Time Setup

### Step 1: Access the Application

Open http://localhost:3000 in your browser.

### Step 2: Register or Login

- If seed data is loaded, use the default credentials above
- Otherwise, click **Register** to create a new account

### Step 3: Create Your First Project

1. Click **+ New Project** on the dashboard
2. Enter project details:
   - Name: "My First Project"
   - Description: "Testing my web application"
   - Base URL: "https://your-app-url.com"
3. Click **Create**

### Step 4: Create a Test Case

1. Navigate to your project
2. Click **+ New Test Case**
3. Add test steps:
   ```
   Step 1: Navigate to homepage
   Step 2: Click login button
   Step 3: Enter credentials
   Step 4: Verify dashboard loads
   ```
4. Save the test case

### Step 5: Run Your First Test

1. Go to **Executions** tab
2. Click **New Execution**
3. Select your test case
4. Choose browser (Chromium, Firefox, or WebKit)
5. Click **Run**
6. View results with screenshots and video

### Step 6: Try AI Test Generation

1. Go to **AI Generator** section
2. Enter a URL to analyze
3. Describe the user flow:
   ```
   User logs in with valid credentials and navigates to the settings page
   ```
4. Click **Generate Tests**
5. Review and save generated test cases

---

## Running Tests

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm run test

# E2E tests with Playwright
npm run test:e2e
```

### Linting

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

---

## Production Deployment

### Option 1: Docker Compose (Simple)

```bash
# Build production images
docker compose -f devops/docker-compose.prod.yml build

# Start services
docker compose -f devops/docker-compose.prod.yml up -d

# Check status
docker compose -f devops/docker-compose.prod.yml ps
```

### Option 2: Kubernetes (Scalable)

```bash
# Create namespace
kubectl create namespace testing-platform

# Apply secrets (edit with real values first!)
kubectl apply -f devops/kubernetes/secrets/

# Apply all manifests
kubectl apply -f devops/kubernetes/

# Check pods
kubectl get pods -n testing-platform

# Get service URLs
kubectl get svc -n testing-platform
```

### Option 3: Helm Chart (Recommended for K8s)

```bash
# Add required repos
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Install with custom values
helm install testing-platform devops/helm/testing-platform \
  -f devops/helm/testing-platform/values-prod.yaml \
  --namespace testing-platform \
  --create-namespace \
  --set secrets.database.password=YOUR_DB_PASSWORD \
  --set secrets.jwt.secret=YOUR_JWT_SECRET \
  --set secrets.openai.apiKey=YOUR_OPENAI_KEY

# Check status
helm status testing-platform -n testing-platform
```

### SSL/TLS Setup

For production, configure SSL in your ingress:

```yaml
# devops/kubernetes/ingress/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: testing-platform
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - testing.yourdomain.com
      secretName: testing-platform-tls
  rules:
    - host: testing.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```

---

## Troubleshooting

### Common Issues

#### 1. Docker containers won't start

```bash
# Check logs
docker compose -f devops/docker-compose.dev.yml logs

# Remove old containers and volumes
docker compose -f devops/docker-compose.dev.yml down -v
docker system prune -f

# Rebuild
docker compose -f devops/docker-compose.dev.yml up --build
```

#### 2. Database connection failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs postgres

# Verify connection
docker exec -it postgres psql -U postgres -d testing_platform -c "\dt"
```

#### 3. Port already in use

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change ports in .env file
```

#### 4. OpenAI API errors

- Verify your API key is correct
- Check you have available credits
- Ensure the model name is valid (gpt-4, gpt-3.5-turbo)

```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### 5. Playwright browser errors

```bash
# Install browsers manually
npx playwright install

# Install system dependencies (Linux)
npx playwright install-deps
```

#### 6. Permission denied errors

```bash
# Fix Docker socket permissions
sudo chmod 666 /var/run/docker.sock

# Fix node_modules permissions
sudo chown -R $USER:$USER node_modules
```

### Getting Help

1. Check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
2. Search [existing issues](https://github.com/piyush26293/testing-module/issues)
3. Create a [new issue](https://github.com/piyush26293/testing-module/issues/new)

---

## Useful Commands Reference

```bash
# Docker Compose
docker compose -f devops/docker-compose.dev.yml up -d    # Start
docker compose -f devops/docker-compose.dev.yml down     # Stop
docker compose -f devops/docker-compose.dev.yml logs -f  # Logs
docker compose -f devops/docker-compose.dev.yml ps       # Status
docker compose -f devops/docker-compose.dev.yml restart  # Restart

# Database
docker exec -it postgres psql -U postgres -d testing_platform
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert

# Backend
npm run start:dev        # Development
npm run start:prod       # Production
npm run build            # Build
npm run test             # Tests

# Frontend
npm run dev              # Development
npm run build            # Build
npm run start            # Production
npm run lint             # Lint

# Kubernetes
kubectl get pods -n testing-platform
kubectl logs -f <pod-name> -n testing-platform
kubectl describe pod <pod-name> -n testing-platform
kubectl port-forward svc/backend 3001:3001 -n testing-platform
```

---

## Support

- 📖 **Documentation**: [docs/](docs/)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/piyush26293/testing-module/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/piyush26293/testing-module/discussions)
- 📧 **Email**: support@example.com

---

**Happy Testing! 🚀**