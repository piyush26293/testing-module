# DevOps & Deployment Guide

Complete DevOps infrastructure for the AI-Powered Testing Platform including Docker, Kubernetes, CI/CD pipelines, and deployment automation.

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Configuration](#docker-configuration)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Helm Charts](#helm-charts)
- [CI/CD Pipelines](#cicd-pipelines)
- [Scripts](#scripts)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Overview

This DevOps infrastructure provides:

- **Docker**: Multi-stage builds for all services with production optimizations
- **Kubernetes**: Complete manifests for deploying to any Kubernetes cluster
- **Helm Charts**: Parameterized deployments for multiple environments
- **CI/CD**: Automated pipelines for building, testing, and deploying
- **Scripts**: Helper scripts for common operations
- **Security**: Built-in security scanning and best practices

## Directory Structure

```
devops/
├── docker/                          # Docker configurations
│   ├── backend/Dockerfile          # Backend multi-stage build
│   ├── frontend/Dockerfile         # Frontend Next.js build
│   ├── runner/Dockerfile           # Playwright test runner
│   └── nginx/                      # Nginx reverse proxy
│       ├── Dockerfile
│       └── nginx.conf
├── docker-compose.dev.yml          # Development environment
├── docker-compose.prod.yml         # Production environment
├── kubernetes/                      # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmaps/
│   ├── secrets/
│   ├── deployments/
│   ├── services/
│   ├── ingress/
│   ├── hpa/
│   ├── pvc/
│   └── kustomization.yaml
├── helm/                            # Helm charts
│   └── testing-platform/
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-dev.yaml
│       ├── values-staging.yaml
│       ├── values-prod.yaml
│       └── templates/
├── scripts/                         # Helper scripts
│   ├── setup-local.sh
│   ├── build-images.sh
│   ├── deploy-k8s.sh
│   ├── rollback.sh
│   └── backup-db.sh
└── README.md

.github/
└── workflows/                       # GitHub Actions workflows
    ├── ci.yml                      # Continuous Integration
    ├── cd-staging.yml              # Deploy to Staging
    ├── cd-production.yml           # Deploy to Production
    ├── pr-checks.yml               # Pull Request checks
    └── security-scan.yml           # Security scanning

env/                                 # Environment configurations
├── .env.development
├── .env.staging
└── .env.production
```

## Prerequisites

### Local Development

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- npm 9+

### Kubernetes Deployment

- kubectl 1.24+
- Helm 3.8+
- Access to a Kubernetes cluster (1.24+)

### Optional

- AWS CLI (for S3 backups)
- GitHub CLI (for workflows)

## Quick Start

### Local Development

1. **Setup local environment:**
   ```bash
   ./devops/scripts/setup-local.sh
   ```

2. **Start services:**
   ```bash
   docker compose -f devops/docker-compose.dev.yml up -d
   ```

3. **Access services:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - MinIO Console: http://localhost:9001
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Production Deployment

1. **Build and push images:**
   ```bash
   ./devops/scripts/build-images.sh --version v1.0.0 --push
   ```

2. **Deploy to Kubernetes:**
   ```bash
   ./devops/scripts/deploy-k8s.sh --environment production
   ```

## Docker Configuration

### Backend Dockerfile

Multi-stage build optimized for production:

- **Builder stage**: Compiles TypeScript and installs dependencies
- **Production stage**: Minimal Alpine-based image with only runtime dependencies
- **Security**: Non-root user, health checks
- **Size**: ~200MB (vs ~800MB with dev dependencies)

**Build:**
```bash
docker build -f devops/docker/backend/Dockerfile -t backend:latest ./backend
```

### Frontend Dockerfile

Next.js standalone build:

- **Dependencies stage**: Installs npm packages
- **Builder stage**: Creates optimized production build
- **Production stage**: Serves standalone app with Node.js
- **Size**: ~150MB

**Build:**
```bash
docker build -f devops/docker/frontend/Dockerfile -t frontend:latest ./frontend
```

### Runner Dockerfile

Playwright with all browsers pre-installed:

- Based on official Playwright image
- Includes Chromium, Firefox, and WebKit
- Configured for headless execution
- **Size**: ~1.5GB (includes all browser binaries)

### Nginx Dockerfile

Reverse proxy and load balancer:

- Routes frontend and backend traffic
- Rate limiting and security headers
- Gzip compression
- **Size**: ~25MB

### Docker Compose

**Development** (`docker-compose.dev.yml`):
- Hot reload for backend and frontend
- Debug ports exposed
- Volume mounts for code
- Development configurations

**Production** (`docker-compose.prod.yml`):
- Optimized production images
- Resource limits
- Replicas for high availability
- Health checks

## Kubernetes Deployment

### Manifests

All Kubernetes resources are in `devops/kubernetes/`:

**Core Resources:**
- `namespace.yaml`: Isolated namespace
- `configmaps/`: Application configuration
- `secrets/`: Sensitive data (passwords, API keys)
- `pvc/`: Persistent storage for database and files

**Workloads:**
- `deployments/`: Application deployments
  - Backend: 3 replicas, rolling updates
  - Frontend: 2 replicas
  - Runner: Auto-scaled 2-20 replicas
  - PostgreSQL: Single instance with persistence
  - Redis: Single instance
  - MinIO: Single instance with persistence

**Networking:**
- `services/`: ClusterIP services for internal communication
- `ingress/`: External access with TLS termination

**Scaling:**
- `hpa/`: Horizontal Pod Autoscalers
  - Backend: CPU/Memory based (70%/80%)
  - Runner: CPU/Memory based (75%/85%)

### Deploy with kubectl

```bash
# Apply all manifests
kubectl apply -k devops/kubernetes/

# Or apply individually
kubectl apply -f devops/kubernetes/namespace.yaml
kubectl apply -f devops/kubernetes/configmaps/
kubectl apply -f devops/kubernetes/secrets/
# ... etc
```

### Kustomize

Use kustomize for environment-specific configurations:

```bash
kubectl apply -k devops/kubernetes/
```

## Helm Charts

### Structure

```
helm/testing-platform/
├── Chart.yaml                 # Chart metadata
├── values.yaml               # Default values
├── values-dev.yaml           # Development overrides
├── values-staging.yaml       # Staging overrides
├── values-prod.yaml          # Production overrides
└── templates/                # Kubernetes templates
    ├── _helpers.tpl          # Template helpers
    ├── deployment.yaml       # All deployments
    ├── service.yaml          # All services
    ├── ingress.yaml          # Ingress configuration
    ├── configmap.yaml        # ConfigMaps
    ├── secret.yaml           # Secrets
    ├── hpa.yaml              # Auto-scalers
    └── pvc.yaml              # Persistent volumes
```

### Deploy with Helm

**Development:**
```bash
helm install testing-platform ./devops/helm/testing-platform \
  --namespace ai-testing-dev \
  --values ./devops/helm/testing-platform/values-dev.yaml
```

**Staging:**
```bash
helm install testing-platform ./devops/helm/testing-platform \
  --namespace ai-testing-staging \
  --values ./devops/helm/testing-platform/values-staging.yaml \
  --set secrets.database.password=$DB_PASSWORD
```

**Production:**
```bash
helm install testing-platform ./devops/helm/testing-platform \
  --namespace ai-testing-platform \
  --values ./devops/helm/testing-platform/values-prod.yaml \
  --set secrets.database.password=$DB_PASSWORD \
  --set secrets.jwt.secret=$JWT_SECRET \
  --set secrets.openai.apiKey=$OPENAI_API_KEY
```

### Upgrade Release

```bash
helm upgrade testing-platform ./devops/helm/testing-platform \
  --namespace ai-testing-platform \
  --values ./devops/helm/testing-platform/values-prod.yaml \
  --wait
```

### Rollback Release

```bash
helm rollback testing-platform --namespace ai-testing-platform
```

## CI/CD Pipelines

### GitHub Actions Workflows

#### 1. CI Pipeline (`ci.yml`)

**Triggers:** Push to any branch, PR to main/development

**Jobs:**
1. **Lint**: ESLint and Prettier checks
2. **Test**: Unit tests with coverage
3. **Build**: Docker image builds
4. **Security**: Trivy container scanning

**Artifacts:** Coverage reports, Docker images (on main/development)

#### 2. CD Staging (`cd-staging.yml`)

**Triggers:** Push to development branch

**Jobs:**
1. **Build & Push**: Docker images tagged as `staging`
2. **Deploy**: Helm deployment to staging namespace
3. **Smoke Tests**: Basic health checks
4. **Notify**: Deployment status

**Environment:** https://staging.testing-platform.example.com

#### 3. CD Production (`cd-production.yml`)

**Triggers:** Release tag or manual workflow dispatch

**Jobs:**
1. **Build & Push**: Version-tagged Docker images
2. **Deploy**: Helm deployment to production
3. **Health Checks**: Comprehensive validation
4. **Rollback**: Automatic rollback on failure

**Environment:** https://testing-platform.example.com

#### 4. PR Checks (`pr-checks.yml`)

**Triggers:** Pull requests to main/development

**Jobs:**
1. **Lint Check**: Code style validation
2. **Type Check**: TypeScript validation
3. **Unit Tests**: Test execution with coverage
4. **Build Verification**: Ensure builds succeed
5. **Docker Build Test**: Verify Dockerfiles

#### 5. Security Scan (`security-scan.yml`)

**Triggers:** Weekly schedule, PR to main

**Jobs:**
1. **Dependency Audit**: npm audit
2. **CodeQL**: Static analysis
3. **Container Scan**: Trivy vulnerability scanning
4. **Secret Scan**: TruffleHog secret detection
5. **Dockerfile Lint**: Hadolint validation
6. **Kubernetes Security**: kubesec and Checkov

### Secrets Required

Configure these in GitHub repository settings:

**Docker Registry:**
- `GITHUB_TOKEN` (automatically provided)

**Kubernetes (Staging):**
- `KUBE_CONFIG_STAGING`: Base64-encoded kubeconfig
- `DB_PASSWORD_STAGING`
- `JWT_SECRET_STAGING`
- `JWT_REFRESH_SECRET_STAGING`
- `MINIO_PASSWORD_STAGING`
- `MINIO_SECRET_KEY_STAGING`

**Kubernetes (Production):**
- `KUBE_CONFIG_PRODUCTION`: Base64-encoded kubeconfig
- `DB_PASSWORD_PRODUCTION`
- `JWT_SECRET_PRODUCTION`
- `JWT_REFRESH_SECRET_PRODUCTION`
- `MINIO_PASSWORD_PRODUCTION`
- `MINIO_SECRET_KEY_PRODUCTION`

**Common:**
- `OPENAI_API_KEY`

## Scripts

### setup-local.sh

Sets up local development environment:

```bash
./devops/scripts/setup-local.sh
```

**Actions:**
- Checks prerequisites (Docker, Node.js, etc.)
- Creates `.env` files
- Installs npm dependencies
- Starts Docker services
- Runs database migrations

### build-images.sh

Builds and pushes Docker images:

```bash
# Build all images
./devops/scripts/build-images.sh

# Build with version and push
./devops/scripts/build-images.sh --version v1.0.0 --push

# Build specific component
./devops/scripts/build-images.sh --component backend --push
```

**Options:**
- `-r, --registry`: Docker registry
- `-v, --version`: Image version tag
- `-c, --component`: Specific component (backend, frontend, runner, nginx)
- `-p, --push`: Push to registry

### deploy-k8s.sh

Deploys to Kubernetes:

```bash
# Deploy to production
./devops/scripts/deploy-k8s.sh --environment production

# Deploy to staging
./devops/scripts/deploy-k8s.sh --environment staging --namespace ai-testing-staging

# Deploy using kubectl instead of Helm
./devops/scripts/deploy-k8s.sh --method kubectl
```

**Options:**
- `-e, --environment`: Environment (dev, staging, production)
- `-n, --namespace`: Kubernetes namespace
- `-k, --kubeconfig`: Path to kubeconfig
- `-m, --method`: Deployment method (helm, kubectl)

### rollback.sh

Rolls back Kubernetes deployment:

```bash
# Rollback to previous version
./devops/scripts/rollback.sh

# Rollback to specific revision
./devops/scripts/rollback.sh --revision 3

# Rollback specific component
./devops/scripts/rollback.sh --component backend
```

**Options:**
- `-n, --namespace`: Kubernetes namespace
- `-r, --revision`: Revision number (0 for previous)
- `-c, --component`: Specific component

### backup-db.sh

Backs up PostgreSQL database:

```bash
# Basic backup
./devops/scripts/backup-db.sh

# Backup with S3 upload
./devops/scripts/backup-db.sh \
  --s3-bucket my-backups \
  --s3-endpoint https://s3.amazonaws.com

# Custom retention
./devops/scripts/backup-db.sh --retention 30
```

**Options:**
- `-n, --namespace`: Kubernetes namespace
- `-d, --database`: Database name
- `-o, --output`: Backup directory
- `-r, --retention`: Retention period in days
- `-s, --s3-bucket`: S3 bucket for upload
- `-e, --s3-endpoint`: S3 endpoint URL

## Environment Configuration

### Files

- `env/.env.development`: Local development
- `env/.env.staging`: Staging environment
- `env/.env.production`: Production environment

### Key Variables

**Database:**
```env
DATABASE_HOST=postgres-service
DATABASE_PORT=5432
DATABASE_NAME=ai_testing_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=<secret>
```

**Redis:**
```env
REDIS_HOST=redis-service
REDIS_PORT=6379
REDIS_PASSWORD=<secret>
```

**JWT:**
```env
JWT_SECRET=<secret>
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=<secret>
JWT_REFRESH_EXPIRATION=30d
```

**MinIO/S3:**
```env
MINIO_ENDPOINT=minio-service
MINIO_PORT=9000
MINIO_ACCESS_KEY=<secret>
MINIO_SECRET_KEY=<secret>
MINIO_BUCKET=test-artifacts
```

**OpenAI:**
```env
OPENAI_API_KEY=<secret>
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
```

## Monitoring & Logging

### Viewing Logs

**Docker Compose:**
```bash
docker compose -f devops/docker-compose.dev.yml logs -f
docker compose -f devops/docker-compose.dev.yml logs -f backend
```

**Kubernetes:**
```bash
# All pods
kubectl logs -f -l app=backend -n ai-testing-platform

# Specific pod
kubectl logs -f deployment/backend -n ai-testing-platform

# Previous pod instance
kubectl logs -f deployment/backend -n ai-testing-platform --previous
```

### Metrics

Access pod metrics:
```bash
kubectl top pods -n ai-testing-platform
kubectl top nodes
```

### Health Checks

**Backend:** `http://localhost:3001/health`
**Frontend:** `http://localhost:3000/api/health`

## Troubleshooting

### Common Issues

#### Pods not starting

```bash
# Check pod status
kubectl get pods -n ai-testing-platform

# Describe pod for events
kubectl describe pod <pod-name> -n ai-testing-platform

# Check logs
kubectl logs <pod-name> -n ai-testing-platform
```

#### Database connection issues

```bash
# Test PostgreSQL connection
kubectl exec -it deployment/postgres -n ai-testing-platform -- psql -U postgres -d ai_testing_platform

# Check service endpoints
kubectl get endpoints postgres-service -n ai-testing-platform
```

#### Image pull errors

```bash
# Check image pull secrets
kubectl get secrets -n ai-testing-platform

# Verify image exists
docker pull ghcr.io/piyush26293/testing-module-backend:latest
```

#### Resource constraints

```bash
# Check resource usage
kubectl top pods -n ai-testing-platform

# Describe node resources
kubectl describe node <node-name>
```

### Debug Commands

```bash
# Port forward to service
kubectl port-forward svc/backend-service 3001:3001 -n ai-testing-platform

# Execute command in pod
kubectl exec -it deployment/backend -n ai-testing-platform -- /bin/sh

# View events
kubectl get events -n ai-testing-platform --sort-by='.lastTimestamp'

# Check ingress
kubectl describe ingress testing-platform-ingress -n ai-testing-platform
```

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use Kubernetes secrets** for sensitive data
3. **Enable RBAC** in Kubernetes
4. **Run containers as non-root** users
5. **Keep images updated** with Dependabot
6. **Scan images regularly** with Trivy
7. **Use network policies** for pod-to-pod communication
8. **Enable TLS/SSL** for all external endpoints
9. **Implement rate limiting** in Nginx/Ingress
10. **Regular security audits** with GitHub Security scanning

## Support

For issues and questions:
- GitHub Issues: https://github.com/piyush26293/testing-module/issues
- Documentation: See `/docs` directory
- Email: team@testing-platform.com

## License

MIT License - See LICENSE file for details
