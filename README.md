# AI-Powered End-to-End Web Application Testing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.2-red)](https://nestjs.com/)
[![Playwright](https://img.shields.io/badge/Playwright-Latest-45ba4b)](https://playwright.dev/)

## 🚀 Overview

The AI-Powered Testing Platform is a comprehensive, production-ready solution for end-to-end web application testing. It leverages artificial intelligence to automatically generate test cases, provide self-healing locators, and offer intelligent insights into test failures. Built with modern technologies and designed for scalability, this platform empowers QA teams to deliver high-quality software faster.

## ✨ Key Features

### 🤖 AI-Powered Capabilities
- **Intelligent Test Generation**: Automatically generate test cases from user stories, UI specifications, or existing application flows
- **Self-Healing Locators**: AI automatically updates element locators when UI changes are detected
- **Smart Test Analysis**: AI-powered failure analysis with actionable recommendations
- **Natural Language Test Creation**: Write tests using plain English descriptions

### 🎯 Core Testing Features
- **Visual Test Management**: Intuitive dashboard for managing test cases, suites, and executions
- **Cross-Browser Testing**: Built on Playwright for testing across Chrome, Firefox, Safari, and Edge
- **Parallel Execution**: Run multiple tests simultaneously for faster feedback
- **Screenshot & Video Recording**: Automatic capture of test execution with failure artifacts
- **Test Data Management**: Built-in test data generation and management

### 👥 Collaboration & Access Control
- **Role-Based Access Control (RBAC)**: Admin, QA Lead, QA Engineer, and Developer roles
- **Team Management**: Organize users into projects and teams
- **Audit Logging**: Complete history of actions and changes

### 📊 Reporting & Analytics
- **Comprehensive Test Reports**: Detailed execution reports with pass/fail metrics
- **Trend Analysis**: Historical test performance tracking
- **Custom Dashboards**: Configurable widgets for team-specific metrics
- **Export Capabilities**: Export reports in PDF, HTML, and JSON formats

### 🔄 CI/CD Integration
- **GitHub Actions Support**: Pre-built workflows for easy integration
- **GitLab CI/CD**: Native support for GitLab pipelines
- **Jenkins Integration**: REST API for Jenkins job integration
- **Webhook Support**: Real-time notifications for test events

### 🔒 Security Features
- **JWT Authentication**: Secure token-based authentication
- **API Rate Limiting**: Protection against abuse
- **Data Encryption**: Encrypted storage for sensitive information
- **Secure File Storage**: MinIO-based object storage with access controls

## 🏗️ Architecture

The platform follows a modern microservices architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                     │
│                  React 18 | Tailwind CSS | TypeScript            │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────────┐
│                      API Gateway (NestJS)                        │
│              Authentication | Rate Limiting | CORS               │
└─────┬────────┬────────┬────────┬────────┬────────┬─────────────┘
      │        │        │        │        │        │
      ▼        ▼        ▼        ▼        ▼        ▼
   ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐
   │Auth│  │User│  │Proj│  │Test│  │Exec│  │Rept│
   │Svc │  │Svc │  │Svc │  │Svc │  │Svc │  │Svc │
   └─┬──┘  └─┬──┘  └─┬──┘  └─┬──┘  └─┬──┘  └─┬──┘
     │       │       │       │       │       │
     └───────┴───────┴───────┴───────┴───────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌────────┐  ┌──────────┐
   │PostgreSQL│  │ Redis  │  │  MinIO   │
   │Database │  │ Cache  │  │ Storage  │
   └─────────┘  └────────┘  └──────────┘
```

### Services Architecture

- **Frontend Service**: Next.js 14 application with server-side rendering and API routes
- **Backend Service**: NestJS API with modular architecture
  - Auth Module: JWT-based authentication and authorization
  - Users Module: User management and profiles
  - Projects Module: Project and team management
  - Test Cases Module: Test case creation and management
  - Test Suites Module: Test suite organization
  - Executions Module: Test execution orchestration with Playwright
  - Reports Module: Report generation and analytics
  - AI Engine Module: OpenAI integration for intelligent features
  - Storage Module: File and artifact management
- **PostgreSQL**: Relational database for structured data
- **Redis**: Caching and session management
- **MinIO**: S3-compatible object storage for test artifacts

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 10.2 (Node.js)
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: TypeORM 0.3
- **Authentication**: Passport.js with JWT
- **API Documentation**: Swagger/OpenAPI
- **Queue Management**: Bull (Redis-based)

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript 5.3
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3
- **State Management**: React Context + Hooks
- **API Client**: Axios
- **Forms**: React Hook Form
- **UI Components**: shadcn/ui

### Testing & Automation
- **Test Framework**: Playwright (latest)
- **Unit Testing**: Jest
- **E2E Testing**: Playwright Test
- **Code Coverage**: Istanbul/NYC

### AI & ML
- **AI Provider**: OpenAI GPT-4
- **Use Cases**: Test generation, locator healing, failure analysis

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (optional)
- **CI/CD**: GitHub Actions
- **Monitoring**: (Prometheus, Grafana - optional)
- **Logging**: Winston (structured logging)

### Storage
- **Object Storage**: MinIO (S3-compatible)
- **File Types**: Screenshots, videos, test artifacts, reports

## 📦 Quick Start

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Docker**: 20.10 or higher (for containerized setup)
- **Docker Compose**: 2.0 or higher
- **OpenAI API Key**: For AI features

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/piyush26293/testing-module.git
   cd testing-module
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   nano .env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Wait for services to be ready** (first run takes 2-3 minutes)
   ```bash
   docker-compose logs -f backend
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs
   - MinIO Console: http://localhost:9001

6. **Default credentials**
   ```
   Email: admin@testing-platform.com
   Password: Admin@123
   ```

### Option 2: Local Development

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/piyush26293/testing-module.git
   cd testing-module
   npm run install:all
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres redis minio
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Configure database and service connections
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start backend and frontend**
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

For detailed setup instructions, see [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md).

## 📖 Documentation

### User Documentation
- [Getting Started Guide](docs/GETTING_STARTED.md) - Installation and initial setup
- [User Guide](docs/USER_GUIDE.md) - Using the platform features
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

### Developer Documentation
- [Architecture Overview](docs/ARCHITECTURE.md) - System design and components
- [API Reference](docs/API_REFERENCE.md) - REST API documentation
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Contributing to the codebase
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Production deployment

### API Documentation
- [Authentication API](docs/api/auth.md)
- [Users API](docs/api/users.md)
- [Projects API](docs/api/projects.md)
- [Test Cases API](docs/api/test-cases.md)
- [Test Suites API](docs/api/test-suites.md)
- [Executions API](docs/api/executions.md)
- [Reports API](docs/api/reports.md)
- [AI Engine API](docs/api/ai-engine.md)
- [Storage API](docs/api/storage.md)

### Additional Resources
- [Changelog](docs/CHANGELOG.md) - Version history and updates
- [Security Policy](docs/SECURITY.md) - Security practices and reporting
- [Code of Conduct](docs/CODE_OF_CONDUCT.md) - Community guidelines

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** (follow coding standards)
4. **Write/update tests** as needed
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## 📊 Project Status

- ✅ Core backend API implementation
- ✅ Authentication and authorization
- ✅ Test case management
- ✅ Playwright integration
- ✅ AI-powered test generation
- ✅ Report generation
- 🚧 Frontend dashboard (in progress)
- 🚧 CI/CD templates
- 📅 Mobile app (planned)

## 🔐 Security

Security is a top priority. If you discover a security vulnerability, please email security@testing-platform.com instead of using the issue tracker.

For more information, see [SECURITY.md](docs/SECURITY.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Next.js](https://nextjs.org/) - React framework for production
- [Playwright](https://playwright.dev/) - Modern web testing
- [OpenAI](https://openai.com/) - AI capabilities
- [TypeORM](https://typeorm.io/) - ORM for TypeScript and JavaScript

## 💬 Support & Community

- **Documentation**: [Full documentation](docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/piyush26293/testing-module/issues)
- **Discussions**: [GitHub Discussions](https://github.com/piyush26293/testing-module/discussions)

## 📈 Roadmap

### Q1 2024
- [ ] Advanced AI test healing
- [ ] Visual regression testing
- [ ] Performance testing integration
- [ ] Mobile testing support (iOS/Android)

### Q2 2024
- [ ] Multi-tenant architecture
- [ ] Advanced analytics dashboard
- [ ] Integration marketplace
- [ ] Accessibility testing

### Q3 2024
- [ ] Self-hosted option enhancements
- [ ] API testing capabilities
- [ ] Load testing integration
- [ ] Advanced reporting templates

See [CHANGELOG.md](docs/CHANGELOG.md) for version history and detailed updates.

---

**Built with ❤️ by the Testing Platform Team**