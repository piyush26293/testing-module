# Getting Started Guide

Welcome to the AI-Powered Testing Platform! This guide will help you set up and start using the platform in minutes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
- [Docker Compose Setup (Recommended)](#docker-compose-setup-recommended)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [First Login](#first-login)
- [Creating Your First Project](#creating-your-first-project)
- [Creating Your First Test](#creating-your-first-test)
- [Running Your First Test](#running-your-first-test)
- [Next Steps](#next-steps)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software | Minimum Version | Recommended Version | Purpose |
|----------|----------------|-------------------|---------|
| Node.js | 18.0.0 | 20.x LTS | Runtime environment |
| npm | 9.0.0 | Latest | Package manager |
| Docker | 20.10.0 | Latest | Containerization |
| Docker Compose | 2.0.0 | Latest | Multi-container orchestration |
| Git | 2.30.0 | Latest | Version control |

### System Requirements

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4 GB
- Storage: 10 GB free space
- OS: Linux, macOS, or Windows 10/11 with WSL2

**Recommended for Production:**
- CPU: 4+ cores
- RAM: 8+ GB
- Storage: 50+ GB SSD
- OS: Linux (Ubuntu 22.04 LTS recommended)

### Additional Requirements

- **OpenAI API Key**: Required for AI-powered features. Get one at [platform.openai.com](https://platform.openai.com/api-keys)
- **Internet Connection**: For downloading dependencies and Docker images
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Installation Methods

You can install the platform using one of two methods:

1. **Docker Compose** (Recommended) - Fastest and easiest setup
2. **Local Development** - For active development and debugging

## Docker Compose Setup (Recommended)

This is the easiest way to get started. All services run in containers with minimal configuration.

### Step 1: Clone the Repository

```bash
git clone https://github.com/piyush26293/testing-module.git
cd testing-module
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file to add your OpenAI API key
nano .env
# or use your preferred editor: vim, code, etc.
```

**Required Configuration:**
```env
# Add your OpenAI API key
OPENAI_API_KEY=sk-your-api-key-here

# Optional: Change default passwords for production
DATABASE_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key
```

### Step 3: Start All Services

```bash
# Build and start all containers
docker-compose up -d

# View logs to monitor startup
docker-compose logs -f
```

**First-time startup takes 2-3 minutes** as Docker downloads images and builds containers.

### Step 4: Verify Services

Check that all services are running:

```bash
docker-compose ps
```

You should see all services with status "Up":
- `ai-testing-postgres` (Port 5432)
- `ai-testing-redis` (Port 6379)
- `ai-testing-minio` (Port 9000, 9001)
- `ai-testing-backend` (Port 3001)
- `ai-testing-frontend` (Port 3000)

### Step 5: Initialize Database

The database is automatically initialized on first run. To verify:

```bash
docker-compose exec backend npm run migration:run
```

### Step 6: Access the Application

Open your browser and navigate to:

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **MinIO Console**: http://localhost:9001

### Managing Docker Services

```bash
# Stop all services
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v

# View logs for specific service
docker-compose logs -f backend

# Restart a specific service
docker-compose restart backend

# Rebuild containers after code changes
docker-compose up -d --build
```

## Local Development Setup

For active development, you may prefer running services locally for easier debugging.

### Step 1: Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/piyush26293/testing-module.git
cd testing-module

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (when available)
cd ../frontend
npm install
cd ..
```

### Step 2: Start Infrastructure Services

Start only the database and supporting services in Docker:

```bash
# Start PostgreSQL, Redis, and MinIO
docker-compose up -d postgres redis minio

# Verify they're running
docker-compose ps postgres redis minio
```

### Step 3: Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit for local development
nano .env
```

**Local Development Configuration:**
```env
# Database (running in Docker)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=ai_testing_platform

# Redis (running in Docker)
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO (running in Docker)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Application
NODE_ENV=development
PORT=3000
API_PORT=3001

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRATION=7d
```

### Step 4: Run Database Migrations

```bash
cd backend
npm run migration:run
npm run seed:run  # Optional: Add sample data
```

### Step 5: Start Services

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 6: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## Environment Configuration

### Essential Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | - | Yes |
| `DATABASE_HOST` | PostgreSQL host | localhost | Yes |
| `DATABASE_PORT` | PostgreSQL port | 5432 | Yes |
| `DATABASE_USER` | Database username | postgres | Yes |
| `DATABASE_PASSWORD` | Database password | postgres | Yes |
| `DATABASE_NAME` | Database name | ai_testing_platform | Yes |
| `REDIS_HOST` | Redis host | localhost | Yes |
| `REDIS_PORT` | Redis port | 6379 | Yes |
| `JWT_SECRET` | Secret for JWT tokens | - | Yes |
| `JWT_EXPIRATION` | Token expiration time | 7d | Yes |

### Optional Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Frontend port | 3000 |
| `API_PORT` | Backend API port | 3001 |
| `LOG_LEVEL` | Logging level | debug |
| `RATE_LIMIT_TTL` | Rate limit window (seconds) | 60 |
| `RATE_LIMIT_MAX` | Max requests per window | 100 |
| `PLAYWRIGHT_HEADLESS` | Run tests headless | true |
| `PLAYWRIGHT_TIMEOUT` | Test timeout (ms) | 30000 |

## Database Setup

### Automatic Setup (Docker Compose)

When using Docker Compose, the database is automatically:
1. Created with the correct schema
2. Initialized with tables
3. Seeded with an admin user

### Manual Setup (Local Development)

If running locally, initialize the database:

```bash
cd backend

# Run migrations to create tables
npm run migration:run

# Seed initial data (optional)
npm run seed:run
```

### Verify Database Connection

Test the database connection:

```bash
# Using Docker
docker-compose exec postgres psql -U postgres -d ai_testing_platform -c "\dt"

# Using local psql
psql -h localhost -U postgres -d ai_testing_platform -c "\dt"
```

## First Login

### Default Admin Credentials

After setup, log in with the default admin account:

```
Email: admin@testing-platform.com
Password: Admin@123
```

**⚠️ Security Warning**: Change the admin password immediately after first login!

### Changing Admin Password

1. Log in with default credentials
2. Navigate to **Settings** → **Profile**
3. Click **Change Password**
4. Enter new secure password
5. Save changes

### Creating Additional Users

As an admin, you can create new users:

1. Go to **Users** from the sidebar
2. Click **Add User**
3. Fill in user details:
   - Email
   - First Name
   - Last Name
   - Role (Admin, QA Lead, QA Engineer, Developer)
4. Click **Create User**
5. User receives email with temporary password

## Creating Your First Project

Projects organize your test cases and team members.

### Step 1: Navigate to Projects

1. Log in to the dashboard
2. Click **Projects** in the sidebar
3. Click **Create New Project** button

### Step 2: Fill Project Details

```
Project Name: My First Test Project
Description: Testing the main application features
Project Key: PROJ-001 (auto-generated)
```

### Step 3: Configure Project Settings

- **Environment URLs**: Add your test environments
  - Development: https://dev.example.com
  - Staging: https://staging.example.com
  - Production: https://example.com

- **Browser Configuration**: Select browsers to test
  - ✅ Chromium
  - ✅ Firefox
  - ✅ WebKit

### Step 4: Add Team Members

1. Click **Add Member** in project settings
2. Search for users by email
3. Assign role (Owner, Contributor, Viewer)
4. Save changes

## Creating Your First Test

You can create tests manually or use AI generation.

### Option 1: Manual Test Creation

1. Navigate to your project
2. Click **Test Cases** → **Create Test Case**
3. Fill in test details:

```
Test Name: Login Test
Description: Verify user can log in successfully
Priority: High
Type: Functional
Tags: authentication, smoke-test
```

4. Add test steps:

**Step 1: Navigate to Login**
```
Action: Navigate
URL: https://dev.example.com/login
```

**Step 2: Enter Credentials**
```
Action: Fill
Selector: input[name="email"]
Value: user@example.com
```

**Step 3: Submit Form**
```
Action: Click
Selector: button[type="submit"]
```

**Step 4: Verify Success**
```
Action: Assert
Selector: .welcome-message
Expected: Welcome back!
```

5. Save the test case

### Option 2: AI-Generated Test

1. Click **AI Generate Test**
2. Describe your test in plain English:

```
I want to test the login functionality. 
The user should be able to enter their email and password, 
click the login button, and see a welcome message.
```

3. Review generated test steps
4. Make adjustments if needed
5. Save the test case

### Option 3: Record Test

1. Click **Record Test**
2. Browser window opens
3. Perform actions on your application
4. Test steps are automatically recorded
5. Stop recording and save

## Running Your First Test

### Single Test Execution

1. Open your test case
2. Click **Run Test** button
3. Select execution options:
   - Browser: Chromium
   - Environment: Development
   - Headless: Yes

4. Click **Start Execution**
5. Watch real-time execution progress
6. View results when complete

### Test Suite Execution

Create a test suite to run multiple tests:

1. Navigate to **Test Suites**
2. Click **Create Suite**
3. Name your suite: "Smoke Tests"
4. Add test cases to the suite
5. Click **Run Suite**
6. Select execution settings
7. Monitor execution progress

### Viewing Test Results

After execution completes:

1. Navigate to **Executions**
2. Click on the completed execution
3. View execution summary:
   - Status: Passed/Failed
   - Duration: 1m 23s
   - Screenshots: Available
   - Video: Available (if enabled)

4. Review failed steps (if any)
5. View AI-powered failure analysis
6. Download execution report

### Analyzing Results

The results page shows:

- **Step-by-step execution log** with timestamps
- **Screenshots** for each step
- **Video recording** (if enabled)
- **Console logs** captured during execution
- **Network requests** made during test
- **AI failure analysis** with suggestions
- **Element locator health** status

## Next Steps

Congratulations! You've successfully set up the platform and run your first test. Here's what to explore next:

### Learn More Features

1. **[User Guide](USER_GUIDE.md)** - Comprehensive feature walkthrough
2. **[API Reference](API_REFERENCE.md)** - Integrate with other tools
3. **[Architecture](ARCHITECTURE.md)** - Understand system design

### Advanced Topics

- **Test Data Management**: Create reusable test data sets
- **Page Object Model**: Organize tests with POM pattern
- **Custom Actions**: Create custom test actions
- **Integrations**: Connect to CI/CD pipelines
- **Reports**: Generate custom reports

### Join the Community

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions and share knowledge
- **Contributing**: Help improve the platform

### Getting Help

If you encounter issues:

1. Check the **[Troubleshooting Guide](TROUBLESHOOTING.md)**
2. Search **[GitHub Issues](https://github.com/piyush26293/testing-module/issues)**
3. Ask in **[GitHub Discussions](https://github.com/piyush26293/testing-module/discussions)**
4. Review **[API Documentation](api/)** for integration issues

## Common First-Time Issues

### Docker Issues

**Problem**: "Cannot connect to Docker daemon"
```bash
# Solution: Start Docker service
sudo systemctl start docker  # Linux
# or restart Docker Desktop on macOS/Windows
```

**Problem**: Port already in use
```bash
# Solution: Change ports in docker-compose.yml or stop conflicting services
docker-compose down
sudo lsof -i :3000  # Check what's using port 3000
```

### Database Issues

**Problem**: "Database connection failed"
```bash
# Solution: Verify PostgreSQL is running
docker-compose ps postgres
docker-compose logs postgres
```

### API Key Issues

**Problem**: "OpenAI API error"
- Verify API key is correct in `.env`
- Check API key has sufficient credits
- Ensure no extra spaces in the key value

### More help

See the **[Troubleshooting Guide](TROUBLESHOOTING.md)** for comprehensive solutions.

---

**Ready to explore more?** Check out the [User Guide](USER_GUIDE.md) for detailed feature documentation.
