#!/bin/bash
# Setup Local Development Environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AI Testing Platform - Local Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check Docker
if command_exists docker; then
    print_success "Docker is installed ($(docker --version))"
else
    print_error "Docker is not installed"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
    print_success "Docker Compose is installed"
else
    print_error "Docker Compose is not installed"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed ($NODE_VERSION)"
    
    # Check if version is >= 18
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        print_warning "Node.js version should be >= 18.0.0"
    fi
else
    print_error "Node.js is not installed"
    echo "Please install Node.js: https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    print_success "npm is installed ($(npm --version))"
else
    print_error "npm is not installed"
    exit 1
fi

echo ""
echo "All prerequisites are met!"
echo ""

# Setup environment files
echo "Setting up environment files..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
    else
        print_warning ".env.example not found, skipping .env creation"
    fi
else
    print_warning ".env file already exists, skipping"
fi

if [ ! -f backend/.env ]; then
    if [ -f backend/.env.example ]; then
        cp backend/.env.example backend/.env
        print_success "Created backend/.env file"
    fi
fi

echo ""

# Install dependencies
echo "Installing dependencies..."
echo ""

read -p "Do you want to install npm dependencies? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing root dependencies..."
    npm install
    
    if [ -d "backend" ]; then
        echo "Installing backend dependencies..."
        cd backend && npm install && cd ..
    fi
    
    if [ -d "frontend" ]; then
        echo "Installing frontend dependencies..."
        cd frontend && npm install && cd ..
    fi
    
    print_success "Dependencies installed"
else
    print_warning "Skipped dependency installation"
fi

echo ""

# Start Docker Compose
echo "Starting Docker services..."
echo ""

read -p "Do you want to start Docker services? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "devops/docker-compose.dev.yml" ]; then
        docker compose -f devops/docker-compose.dev.yml up -d postgres redis minio
        print_success "Docker services started"
        
        echo ""
        echo "Waiting for services to be ready..."
        sleep 10
        
        # Check service health
        if docker ps | grep -q "ai-testing-postgres-dev"; then
            print_success "PostgreSQL is running"
        fi
        
        if docker ps | grep -q "ai-testing-redis-dev"; then
            print_success "Redis is running"
        fi
        
        if docker ps | grep -q "ai-testing-minio-dev"; then
            print_success "MinIO is running"
        fi
    else
        docker compose up -d postgres redis minio
        print_success "Docker services started"
    fi
else
    print_warning "Skipped Docker services startup"
fi

echo ""

# Run database migrations
read -p "Do you want to run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -d "backend" ]; then
        echo "Running database migrations..."
        cd backend
        npm run migration:run 2>/dev/null || print_warning "No migrations to run or migration command not available"
        cd ..
        print_success "Database migrations completed"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env files with your configuration"
echo "2. Start the backend: cd backend && npm run start:dev"
echo "3. Start the frontend: cd frontend && npm run dev"
echo ""
echo "Access the services:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- MinIO Console: http://localhost:9001"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"
echo ""
echo "To view Docker logs: docker compose -f devops/docker-compose.dev.yml logs -f"
echo "To stop services: docker compose -f devops/docker-compose.dev.yml down"
echo ""
