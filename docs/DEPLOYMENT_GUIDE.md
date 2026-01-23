# Deployment Guide

This guide provides comprehensive instructions for deploying the AI-Powered Testing Platform to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Provider Guides](#cloud-provider-guides)
- [Database Setup](#database-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Scaling Guidelines](#scaling-guidelines)
- [CI/CD Integration](#cicd-integration)
- [Security Best Practices](#security-best-practices)
- [Backup and Disaster Recovery](#backup-and-disaster-recovery)

## Prerequisites

### System Requirements

- **Production Server**: 4+ CPU cores, 8GB+ RAM, 100GB+ storage
- **Database Server**: 2+ CPU cores, 4GB+ RAM, 50GB+ storage
- **Container Runtime**: Docker 20.10+ or containerd 1.5+
- **Orchestration** (optional): Kubernetes 1.24+
- **Load Balancer**: NGINX, HAProxy, or cloud-native load balancer
- **SSL Certificate**: Valid SSL/TLS certificates

### Software Requirements

- Node.js 18.0.0+
- PostgreSQL 15+
- Redis 7+
- MinIO (or S3-compatible storage)
- Docker & Docker Compose 2.0+
- kubectl (for Kubernetes deployments)
- Helm 3+ (for Kubernetes deployments)

### Required Services

- OpenAI API access (for AI features)
- SMTP server (for email notifications)
- DNS configuration
- Firewall/Security group configuration

## Environment Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Application
NODE_ENV=production
PORT=3001
APP_URL=https://your-domain.com
API_URL=https://api.your-domain.com

# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=<strong-password>
DATABASE_NAME=ai_testing_platform
DATABASE_SSL=true

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>
REDIS_TLS=true

# MinIO/S3 Storage
MINIO_ENDPOINT=minio.your-domain.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=<access-key>
MINIO_SECRET_KEY=<secret-key>
MINIO_BUCKET_NAME=testing-platform

# Alternative: AWS S3
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=<access-key>
# AWS_SECRET_ACCESS_KEY=<secret-key>
# AWS_S3_BUCKET=testing-platform

# JWT Authentication
JWT_SECRET=<generate-strong-secret-minimum-32-chars>
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=<generate-another-strong-secret>
JWT_REFRESH_EXPIRATION=30d

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# Email (SMTP)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=<smtp-username>
SMTP_PASSWORD=<smtp-password>
EMAIL_FROM=noreply@your-domain.com

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=https://your-domain.com

# Session
SESSION_SECRET=<generate-strong-secret>

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/testing-platform

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

### Secrets Management

#### Using Docker Secrets

```bash
# Create secrets
echo "your-db-password" | docker secret create db_password -
echo "your-jwt-secret" | docker secret create jwt_secret -
echo "your-openai-key" | docker secret create openai_key -

# Reference in docker-compose.yml
secrets:
  - db_password
  - jwt_secret
  - openai_key
```

#### Using Kubernetes Secrets

```bash
# Create secret from literal
kubectl create secret generic app-secrets \
  --from-literal=database-password='<password>' \
  --from-literal=jwt-secret='<secret>' \
  --from-literal=openai-api-key='<key>'

# Create secret from file
kubectl create secret generic app-config \
  --from-file=.env.production
```

#### Using AWS Secrets Manager

```bash
# Store secret
aws secretsmanager create-secret \
  --name testing-platform/prod \
  --secret-string file://secrets.json

# Access in application
# Use AWS SDK to retrieve secrets at runtime
```

#### Using HashiCorp Vault

```bash
# Store secrets
vault kv put secret/testing-platform \
  database_password="<password>" \
  jwt_secret="<secret>"

# Access in application
# Use Vault agent or SDK
```

## Docker Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: testing-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_DB: ai_testing_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - testing-network
    restart: unless-stopped
    secrets:
      - db_password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: testing-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - testing-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MinIO Object Storage
  minio:
    image: minio/minio:latest
    container_name: testing-minio
    environment:
      MINIO_ROOT_USER_FILE: /run/secrets/minio_access_key
      MINIO_ROOT_PASSWORD_FILE: /run/secrets/minio_secret_key
    volumes:
      - minio_data:/data
    networks:
      - testing-network
    command: server /data --console-address ":9001"
    restart: unless-stopped
    secrets:
      - minio_access_key
      - minio_secret_key
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # Backend API Service
  backend:
    image: your-registry.com/testing-platform-backend:latest
    container_name: testing-backend
    env_file: .env.production
    ports:
      - "3001:3001"
    networks:
      - testing-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G

  # Frontend Service
  frontend:
    image: your-registry.com/testing-platform-frontend:latest
    container_name: testing-frontend
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: https://api.your-domain.com
    ports:
      - "3000:3000"
    networks:
      - testing-network
    depends_on:
      - backend
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G

  # NGINX Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: testing-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    networks:
      - testing-network
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

networks:
  testing-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  minio_data:
    driver: local

secrets:
  db_password:
    file: ./secrets/db_password.txt
  minio_access_key:
    file: ./secrets/minio_access_key.txt
  minio_secret_key:
    file: ./secrets/minio_secret_key.txt
```

### Building Production Images

```bash
# Backend
cd backend
docker build -t your-registry.com/testing-platform-backend:latest \
  -f Dockerfile.prod .

# Frontend
cd frontend
docker build -t your-registry.com/testing-platform-frontend:latest \
  -f Dockerfile.prod .

# Push to registry
docker push your-registry.com/testing-platform-backend:latest
docker push your-registry.com/testing-platform-frontend:latest
```

### Deploy with Docker Compose

```bash
# Deploy services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run

# Scale backend service
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Kubernetes Deployment

### Namespace Setup

```bash
# Create namespace
kubectl create namespace testing-platform

# Set as default
kubectl config set-context --current --namespace=testing-platform
```

### Helm Chart Structure

```
helm/
├── Chart.yaml
├── values.yaml
├── values-production.yaml
├── templates/
│   ├── deployment-backend.yaml
│   ├── deployment-frontend.yaml
│   ├── service-backend.yaml
│   ├── service-frontend.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── pvc.yaml
│   ├── statefulset-postgres.yaml
│   ├── statefulset-redis.yaml
│   └── hpa.yaml
```

### Chart.yaml

```yaml
apiVersion: v2
name: testing-platform
description: AI-Powered Testing Platform Helm Chart
type: application
version: 1.0.0
appVersion: "1.0.0"
keywords:
  - testing
  - automation
  - ai
maintainers:
  - name: Testing Platform Team
    email: support@testing-platform.com
```

### values.yaml

```yaml
# Global settings
global:
  storageClass: standard
  imagePullSecrets: []

# Backend configuration
backend:
  replicaCount: 3
  image:
    repository: your-registry.com/testing-platform-backend
    tag: "1.0.0"
    pullPolicy: IfNotPresent
  
  service:
    type: ClusterIP
    port: 3001
  
  resources:
    limits:
      cpu: 2000m
      memory: 4Gi
    requests:
      cpu: 500m
      memory: 1Gi
  
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
  
  env:
    nodeEnv: production
    port: 3001
    logLevel: info

# Frontend configuration
frontend:
  replicaCount: 2
  image:
    repository: your-registry.com/testing-platform-frontend
    tag: "1.0.0"
    pullPolicy: IfNotPresent
  
  service:
    type: ClusterIP
    port: 3000
  
  resources:
    limits:
      cpu: 1000m
      memory: 2Gi
    requests:
      cpu: 250m
      memory: 512Mi

# PostgreSQL
postgresql:
  enabled: true
  image:
    tag: 15-alpine
  auth:
    username: postgres
    password: ""  # Use secret
    database: ai_testing_platform
  primary:
    persistence:
      enabled: true
      size: 50Gi
      storageClass: standard
    resources:
      limits:
        cpu: 2000m
        memory: 4Gi
      requests:
        cpu: 500m
        memory: 2Gi

# Redis
redis:
  enabled: true
  architecture: standalone
  auth:
    enabled: true
    password: ""  # Use secret
  master:
    persistence:
      enabled: true
      size: 10Gi
    resources:
      limits:
        cpu: 1000m
        memory: 2Gi
      requests:
        cpu: 250m
        memory: 512Mi

# MinIO
minio:
  enabled: true
  mode: standalone
  rootUser: admin
  rootPassword: ""  # Use secret
  persistence:
    enabled: true
    size: 100Gi
  resources:
    limits:
      cpu: 1000m
      memory: 2Gi
    requests:
      cpu: 250m
      memory: 512Mi

# Ingress
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
  hosts:
    - host: testing-platform.com
      paths:
        - path: /
          pathType: Prefix
          service: frontend
        - path: /api
          pathType: Prefix
          service: backend
  tls:
    - secretName: testing-platform-tls
      hosts:
        - testing-platform.com
        - api.testing-platform.com

# Monitoring
monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
    interval: 30s
```

### Deployment Templates

**backend-deployment.yaml**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "testing-platform.fullname" . }}-backend
  labels:
    {{- include "testing-platform.labels" . | nindent 4 }}
    app.kubernetes.io/component: backend
spec:
  replicas: {{ .Values.backend.replicaCount }}
  selector:
    matchLabels:
      {{- include "testing-platform.selectorLabels" . | nindent 6 }}
      app.kubernetes.io/component: backend
  template:
    metadata:
      labels:
        {{- include "testing-platform.selectorLabels" . | nindent 8 }}
        app.kubernetes.io/component: backend
    spec:
      containers:
      - name: backend
        image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
        imagePullPolicy: {{ .Values.backend.image.pullPolicy }}
        ports:
        - name: http
          containerPort: {{ .Values.backend.service.port }}
          protocol: TCP
        env:
        - name: NODE_ENV
          value: {{ .Values.backend.env.nodeEnv }}
        - name: PORT
          value: "{{ .Values.backend.env.port }}"
        - name: DATABASE_HOST
          value: {{ include "testing-platform.fullname" . }}-postgresql
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: {{ include "testing-platform.fullname" . }}-secrets
              key: database-password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: {{ include "testing-platform.fullname" . }}-secrets
              key: jwt-secret
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: {{ include "testing-platform.fullname" . }}-secrets
              key: openai-api-key
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          {{- toYaml .Values.backend.resources | nindent 12 }}
```

### Deploy with Helm

```bash
# Add repositories (if using external charts)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Install chart
helm install testing-platform ./helm \
  -f ./helm/values-production.yaml \
  --namespace testing-platform \
  --create-namespace

# Upgrade
helm upgrade testing-platform ./helm \
  -f ./helm/values-production.yaml \
  --namespace testing-platform

# Rollback
helm rollback testing-platform 1

# Check status
helm status testing-platform -n testing-platform

# List releases
helm list -n testing-platform
```

## Cloud Provider Guides

### AWS Deployment

#### AWS ECS (Elastic Container Service)

**Task Definition**:

```json
{
  "family": "testing-platform-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-registry.com/testing-platform-backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-password"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/testing-platform",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "backend"
        }
      }
    }
  ]
}
```

**Deploy to ECS**:

```bash
# Create cluster
aws ecs create-cluster --cluster-name testing-platform

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster testing-platform \
  --service-name backend \
  --task-definition testing-platform-backend \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

#### AWS EKS (Elastic Kubernetes Service)

```bash
# Create EKS cluster
eksctl create cluster \
  --name testing-platform \
  --version 1.28 \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 5 \
  --managed

# Configure kubectl
aws eks update-kubeconfig --name testing-platform --region us-east-1

# Deploy application
helm install testing-platform ./helm -f values-aws.yaml
```

**AWS RDS for PostgreSQL**:

```bash
# Create DB instance
aws rds create-db-instance \
  --db-instance-identifier testing-platform-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.3 \
  --master-username postgres \
  --master-user-password <password> \
  --allocated-storage 50 \
  --vpc-security-group-ids sg-xxx \
  --db-subnet-group-name testing-platform-subnet
```

### GCP Deployment

#### GCP GKE (Google Kubernetes Engine)

```bash
# Create GKE cluster
gcloud container clusters create testing-platform \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-2 \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 5 \
  --enable-autorepair \
  --enable-autoupgrade

# Get credentials
gcloud container clusters get-credentials testing-platform --zone us-central1-a

# Deploy application
helm install testing-platform ./helm -f values-gcp.yaml
```

**Cloud SQL for PostgreSQL**:

```bash
# Create instance
gcloud sql instances create testing-platform-db \
  --database-version=POSTGRES_15 \
  --tier=db-n1-standard-2 \
  --region=us-central1

# Create database
gcloud sql databases create ai_testing_platform \
  --instance=testing-platform-db

# Set up Cloud SQL Proxy
kubectl create secret generic cloudsql-instance-credentials \
  --from-file=credentials.json=./key.json
```

### Azure Deployment

#### Azure AKS (Azure Kubernetes Service)

```bash
# Create resource group
az group create --name testing-platform-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group testing-platform-rg \
  --name testing-platform \
  --node-count 3 \
  --node-vm-size Standard_D2s_v3 \
  --enable-cluster-autoscaler \
  --min-count 2 \
  --max-count 5 \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group testing-platform-rg --name testing-platform

# Deploy application
helm install testing-platform ./helm -f values-azure.yaml
```

**Azure Database for PostgreSQL**:

```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group testing-platform-rg \
  --name testing-platform-db \
  --location eastus \
  --admin-user postgres \
  --admin-password <password> \
  --sku-name Standard_D2s_v3 \
  --tier GeneralPurpose \
  --storage-size 128
```

## Database Setup

### PostgreSQL Configuration

**postgresql.conf** (production settings):

```conf
# Memory
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 512MB

# Connections
max_connections = 200
superuser_reserved_connections = 3

# Checkpoints
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Query Planning
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d.log'
log_rotation_age = 1d
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0
log_autovacuum_min_duration = 0
log_error_verbosity = default
```

### Database Migrations

```bash
# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Generate migration
npm run migration:generate -- -n MigrationName

# Create empty migration
npm run migration:create -- -n MigrationName
```

### Database Backups

**Automated Backup Script**:

```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
DB_NAME="ai_testing_platform"
DB_USER="postgres"
DB_HOST="localhost"
RETENTION_DAYS=7

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v \
  -f "${BACKUP_DIR}/${DB_NAME}_${DATE}.backup"

# Compress backup
gzip "${BACKUP_DIR}/${DB_NAME}_${DATE}.backup"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/${DB_NAME}_${DATE}.backup.gz" \
  s3://your-backup-bucket/postgresql/

# Clean old backups
find $BACKUP_DIR -name "*.backup.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: ${DB_NAME}_${DATE}.backup.gz"
```

**Cron Schedule**:

```cron
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-database.sh >> /var/log/backup.log 2>&1
```

**Restore Database**:

```bash
# Restore from backup
pg_restore -h localhost -U postgres -d ai_testing_platform \
  -v backup_file.backup

# Restore from SQL dump
psql -h localhost -U postgres -d ai_testing_platform < backup.sql
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d testing-platform.com -d api.testing-platform.com

# Auto-renewal
sudo certbot renew --dry-run

# Add to crontab
0 0,12 * * * python3 -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew --quiet
```

### NGINX SSL Configuration

```nginx
# /etc/nginx/sites-available/testing-platform.conf

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name testing-platform.com api.testing-platform.com;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name testing-platform.com;

    ssl_certificate /etc/letsencrypt/live/testing-platform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/testing-platform.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.testing-platform.com;

    ssl_certificate /etc/letsencrypt/live/testing-platform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/testing-platform.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 50M;

    location / {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for long-running tests
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
}
```

### Kubernetes Ingress with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@testing-platform.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## Monitoring and Logging

### Prometheus Setup

**prometheus-values.yaml**:

```yaml
prometheus:
  prometheusSpec:
    serviceMonitorSelectorNilUsesHelmValues: false
    retention: 30d
    storageSpec:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 50Gi
```

**Install Prometheus**:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  -f prometheus-values.yaml \
  --namespace monitoring \
  --create-namespace
```

### Grafana Dashboards

```bash
# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Default credentials
# Username: admin
# Password: prom-operator
```

**Custom Dashboard JSON** (import to Grafana):

```json
{
  "dashboard": {
    "title": "Testing Platform Metrics",
    "panels": [
      {
        "title": "Test Execution Rate",
        "targets": [
          {
            "expr": "rate(test_executions_total[5m])"
          }
        ]
      },
      {
        "title": "API Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

**Filebeat configuration**:

```yaml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/testing-platform/*.log
  json.keys_under_root: true
  json.add_error_key: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "testing-platform-%{+yyyy.MM.dd}"

setup.kibana:
  host: "kibana:5601"
```

**Deploy ELK Stack**:

```bash
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n logging --create-namespace
helm install kibana elastic/kibana -n logging
helm install filebeat elastic/filebeat -n logging -f filebeat-values.yaml
```

### Application Metrics

**Expose metrics endpoint** (backend):

```typescript
// metrics.controller.ts
import { Controller, Get } from '@nestjs/common';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics() {
    return register.metrics();
  }
}
```

## Scaling Guidelines

### Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: testing-platform-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 15
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 2
        periodSeconds: 15
      selectPolicy: Max
```

### Load Balancing

**HAProxy Configuration**:

```conf
global
    maxconn 4096
    log /dev/log local0

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog
    option dontlognull

frontend http_front
    bind *:80
    default_backend backend_servers

backend backend_servers
    balance roundrobin
    option httpchk GET /health
    server backend1 10.0.1.10:3001 check
    server backend2 10.0.1.11:3001 check
    server backend3 10.0.1.12:3001 check
```

### Database Scaling

**Read Replicas**:

```yaml
# PostgreSQL replication setup
# Master configuration
postgresql:
  replication:
    enabled: true
    user: replicator
    password: replicator-password
    readReplicas: 2
```

**Connection Pooling with PgBouncer**:

```ini
[databases]
ai_testing_platform = host=postgres port=5432 dbname=ai_testing_platform

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

## CI/CD Integration

### GitHub Actions

**.github/workflows/deploy.yml**:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ secrets.REGISTRY_URL }}
        username: ${{ secrets.REGISTRY_USERNAME }}
        password: ${{ secrets.REGISTRY_PASSWORD }}
    
    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: |
          ${{ secrets.REGISTRY_URL }}/testing-platform-backend:${{ github.sha }}
          ${{ secrets.REGISTRY_URL }}/testing-platform-backend:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Build and push frontend
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        push: true
        tags: |
          ${{ secrets.REGISTRY_URL }}/testing-platform-frontend:${{ github.sha }}
          ${{ secrets.REGISTRY_URL }}/testing-platform-frontend:latest
    
    - name: Configure kubectl
      uses: azure/k8s-set-context@v3
      with:
        method: kubeconfig
        kubeconfig: ${{ secrets.KUBE_CONFIG }}
    
    - name: Deploy to Kubernetes
      run: |
        helm upgrade --install testing-platform ./helm \
          --namespace production \
          --set backend.image.tag=${{ github.sha }} \
          --set frontend.image.tag=${{ github.sha }} \
          --values ./helm/values-production.yaml \
          --wait --timeout 10m
    
    - name: Run smoke tests
      run: |
        kubectl wait --for=condition=ready pod \
          -l app.kubernetes.io/component=backend \
          -n production --timeout=300s
        curl -f https://api.testing-platform.com/health
```

### GitLab CI/CD

**.gitlab-ci.yml**:

```yaml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA ./backend
    - docker build -t $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA ./frontend
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA

deploy:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context $KUBE_CONTEXT
    - helm upgrade --install testing-platform ./helm
        --namespace production
        --set backend.image.tag=$CI_COMMIT_SHA
        --set frontend.image.tag=$CI_COMMIT_SHA
        --values ./helm/values-production.yaml
  only:
    - main
```

### Jenkins Pipeline

**Jenkinsfile**:

```groovy
pipeline {
    agent any
    
    environment {
        REGISTRY = 'your-registry.com'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Build') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'docker build -t ${REGISTRY}/backend:${IMAGE_TAG} .'
                            sh 'docker push ${REGISTRY}/backend:${IMAGE_TAG}'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'docker build -t ${REGISTRY}/frontend:${IMAGE_TAG} .'
                            sh 'docker push ${REGISTRY}/frontend:${IMAGE_TAG}'
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                    helm upgrade --install testing-platform ./helm \
                      --namespace production \
                      --set backend.image.tag=${IMAGE_TAG} \
                      --set frontend.image.tag=${IMAGE_TAG} \
                      --values ./helm/values-production.yaml
                '''
            }
        }
        
        stage('Verify') {
            steps {
                sh 'curl -f https://api.testing-platform.com/health'
            }
        }
    }
    
    post {
        success {
            slackSend color: 'good', message: "Deployment successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
        failure {
            slackSend color: 'danger', message: "Deployment failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
    }
}
```

## Security Best Practices

### 1. Use Strong Secrets

```bash
# Generate strong secrets
openssl rand -base64 32

# Use secret management
# - Kubernetes Secrets
# - AWS Secrets Manager
# - HashiCorp Vault
# - Azure Key Vault
```

### 2. Network Security

```yaml
# Network Policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-netpol
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 3001
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

### 3. Security Scanning

```bash
# Scan Docker images
trivy image your-registry.com/backend:latest

# Scan Kubernetes manifests
kubesec scan deployment.yaml
```

### 4. RBAC Configuration

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-deployer
rules:
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "update", "patch"]
```

## Backup and Disaster Recovery

### Backup Strategy

1. **Database Backups**: Daily full + hourly incremental
2. **Object Storage**: Continuous replication
3. **Configuration**: Version controlled
4. **Secrets**: Encrypted backups

### Disaster Recovery Plan

```bash
# 1. Restore Database
pg_restore -d ai_testing_platform backup.dump

# 2. Restore MinIO
mc mirror backup-bucket/ minio/testing-platform/

# 3. Redeploy Application
helm install testing-platform ./helm -f values-production.yaml

# 4. Verify Services
kubectl get pods -n production
curl https://api.testing-platform.com/health
```

### Recovery Time Objective (RTO)

- **Target RTO**: < 4 hours
- **Target RPO**: < 1 hour

## Health Checks and Monitoring

### Health Check Endpoints

```typescript
// health.controller.ts
@Get('health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: await this.checkDatabase(),
    redis: await this.checkRedis(),
    storage: await this.checkStorage(),
  };
}
```

### Monitoring Alerts

```yaml
# AlertManager rules
groups:
- name: testing-platform
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
  
  - alert: HighMemoryUsage
    expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage"
```

## Support and Troubleshooting

For troubleshooting common deployment issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

For security concerns, see [SECURITY.md](SECURITY.md).

## Conclusion

This deployment guide covers comprehensive production deployment scenarios. Always test deployments in staging environments before production, maintain proper backups, and monitor system health continuously.

For additional support:
- Documentation: [docs/README.md](README.md)
- Issues: [GitHub Issues](https://github.com/piyush26293/testing-module/issues)
- Community: [GitHub Discussions](https://github.com/piyush26293/testing-module/discussions)
