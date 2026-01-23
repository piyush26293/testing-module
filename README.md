# AI-Powered Testing Platform

A complete, production-ready, AI-powered end-to-end web application testing platform with comprehensive DevOps infrastructure.

## 🚀 Features

- **AI-Powered Testing**: Intelligent test generation and execution using OpenAI
- **Backend API**: NestJS-based REST API with TypeORM and PostgreSQL
- **Test Runner**: Playwright-based test execution with support for multiple browsers
- **Object Storage**: MinIO for storing test artifacts, screenshots, and videos
- **Caching**: Redis for session management and job queuing
- **Production-Ready**: Complete DevOps infrastructure with Docker, Kubernetes, and CI/CD

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- MinIO or S3-compatible storage

## 🏃 Quick Start

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/piyush26293/testing-module.git
   cd testing-module
   ```

2. **Setup environment:**
   ```bash
   ./devops/scripts/setup-local.sh
   ```

3. **Start services:**
   ```bash
   docker compose -f devops/docker-compose.dev.yml up -d
   ```

4. **Access the application:**
   - Backend API: http://localhost:3001
   - Frontend: http://localhost:3000 (when available)
   - MinIO Console: http://localhost:9001

### Using Docker Compose

**Development:**
```bash
docker compose -f devops/docker-compose.dev.yml up -d
```

**Production:**
```bash
docker compose -f devops/docker-compose.prod.yml up -d
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          Clients                             │
│                    (Web, API Consumers)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                     │
│              Rate Limiting, Load Balancing                   │
└─────────────┬─────────────────────────┬─────────────────────┘
              │                         │
    ┌─────────▼─────────┐   ┌──────────▼──────────┐
    │    Frontend       │   │    Backend API      │
    │    (Next.js)      │   │    (NestJS)         │
    └───────────────────┘   └──────────┬──────────┘
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 │                      │                      │
        ┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
        │   PostgreSQL    │   │     Redis       │   │     MinIO       │
        │   (Database)    │   │    (Cache)      │   │   (Storage)     │
        └─────────────────┘   └─────────────────┘   └─────────────────┘
                 │
        ┌────────▼────────┐
        │  Test Runner    │
        │  (Playwright)   │
        └─────────────────┘
```

## 🐳 Docker & Kubernetes

### Docker Images

We provide optimized Docker images for all components:

- **Backend**: Multi-stage build, ~200MB
- **Frontend**: Next.js standalone, ~150MB  
- **Runner**: Playwright with all browsers, ~1.5GB
- **Nginx**: Reverse proxy, ~25MB

### Kubernetes Deployment

Complete Kubernetes manifests are available in `devops/kubernetes/`:

```bash
# Deploy using kubectl
kubectl apply -k devops/kubernetes/

# Deploy using Helm
helm install testing-platform ./devops/helm/testing-platform \
  --namespace ai-testing-platform \
  --values ./devops/helm/testing-platform/values-prod.yaml
```

See [DevOps README](devops/README.md) for detailed deployment instructions.

## 🔄 CI/CD

Automated pipelines using GitHub Actions:

- **CI Pipeline**: Lint, test, build, and security scan on every push
- **CD Staging**: Auto-deploy to staging on push to `development` branch
- **CD Production**: Deploy to production on release tags
- **PR Checks**: Comprehensive validation for pull requests
- **Security Scan**: Weekly security scanning with Trivy, CodeQL, and more

## 📁 Project Structure

```
testing-module/
├── backend/                    # NestJS backend API
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # Next.js frontend (coming soon)
├── runner/                     # Playwright test runner (coming soon)
├── database/                   # Database initialization
│   └── init.sql
├── devops/                     # DevOps infrastructure
│   ├── docker/                 # Docker configurations
│   ├── kubernetes/             # Kubernetes manifests
│   ├── helm/                   # Helm charts
│   └── scripts/                # Helper scripts
├── .github/
│   └── workflows/              # CI/CD pipelines
├── env/                        # Environment configurations
└── docker-compose.yml          # Docker Compose configuration
```

## 🛠️ Development

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Running Tests

```bash
cd backend
npm test
npm run test:cov
npm run test:e2e
```

### Linting & Formatting

```bash
cd backend
npm run lint
npm run format
```

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=ai_testing_platform

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

See `env/.env.example` for complete configuration options.

## 🔧 Scripts

Helper scripts are available in `devops/scripts/`:

- `setup-local.sh`: Setup local development environment
- `build-images.sh`: Build and push Docker images
- `deploy-k8s.sh`: Deploy to Kubernetes
- `rollback.sh`: Rollback Kubernetes deployment
- `backup-db.sh`: Backup PostgreSQL database

## 📚 Documentation

- [DevOps Guide](devops/README.md): Complete deployment documentation
- [API Documentation](http://localhost:3001/api): Swagger API docs (when running)
- Backend docs: See `backend/README.md` (coming soon)

## 🔐 Security

- Non-root containers
- Security scanning with Trivy
- CodeQL static analysis
- Secret detection with TruffleHog
- Dependabot for dependency updates
- RBAC in Kubernetes
- Network policies
- TLS/SSL encryption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Piyush** - [@piyush26293](https://github.com/piyush26293)

## 🙏 Acknowledgments

- NestJS framework
- Next.js framework
- Playwright
- OpenAI API
- Docker & Kubernetes community