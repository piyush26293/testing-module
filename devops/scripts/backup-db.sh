#!/bin/bash
# Backup PostgreSQL Database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="${NAMESPACE:-ai-testing-platform}"
POD_NAME="${POD_NAME:-}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
S3_BUCKET="${S3_BUCKET:-}"
S3_ENDPOINT="${S3_ENDPOINT:-}"

# Database configuration
DB_NAME="${DB_NAME:-ai_testing_platform}"
DB_USER="${DB_USER:-postgres}"

# Print functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Usage information
usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -n, --namespace NAMESPACE      Kubernetes namespace (default: ai-testing-platform)"
    echo "  -d, --database DB_NAME         Database name (default: ai_testing_platform)"
    echo "  -u, --user DB_USER             Database user (default: postgres)"
    echo "  -o, --output DIR               Backup output directory (default: ./backups)"
    echo "  -r, --retention DAYS           Retention period in days (default: 7)"
    echo "  -s, --s3-bucket BUCKET         S3 bucket for upload"
    echo "  -e, --s3-endpoint ENDPOINT     S3 endpoint URL"
    echo "  -h, --help                     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  $0 --output /backups --retention 30"
    echo "  $0 --s3-bucket my-backups --s3-endpoint https://s3.amazonaws.com"
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        -u|--user)
            DB_USER="$2"
            shift 2
            ;;
        -o|--output)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -r|--retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -s|--s3-bucket)
            S3_BUCKET="$2"
            shift 2
            ;;
        -e|--s3-endpoint)
            S3_ENDPOINT="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Header
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database Backup Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Namespace: $NAMESPACE"
echo "Database: $DB_NAME"
echo "Backup Directory: $BACKUP_DIR"
echo ""

# Check prerequisites
if ! command -v kubectl >/dev/null 2>&1; then
    print_error "kubectl is not installed"
    exit 1
fi

# Check cluster connectivity
print_info "Checking cluster connectivity..."
if kubectl cluster-info >/dev/null 2>&1; then
    print_success "Connected to Kubernetes cluster"
else
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi

# Find PostgreSQL pod if not specified
if [ -z "$POD_NAME" ]; then
    print_info "Finding PostgreSQL pod..."
    POD_NAME=$(kubectl get pods -n "$NAMESPACE" -l app=postgres -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$POD_NAME" ]; then
        print_error "PostgreSQL pod not found in namespace $NAMESPACE"
        exit 1
    fi
    
    print_success "Found pod: $POD_NAME"
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

print_info "Creating backup..."
echo "Backup file: $BACKUP_FILE_GZ"
echo ""

# Create database backup
if kubectl exec -n "$NAMESPACE" "$POD_NAME" -- pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE_GZ"; then
    print_success "Backup created successfully"
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
    print_info "Backup size: $BACKUP_SIZE"
else
    print_error "Backup failed"
    exit 1
fi

echo ""

# Upload to S3 if configured
if [ -n "$S3_BUCKET" ]; then
    print_info "Uploading backup to S3..."
    
    if command -v aws >/dev/null 2>&1; then
        UPLOAD_CMD="aws s3 cp \"$BACKUP_FILE_GZ\" \"s3://${S3_BUCKET}/backups/$(basename "$BACKUP_FILE_GZ")\""
        
        if [ -n "$S3_ENDPOINT" ]; then
            UPLOAD_CMD="$UPLOAD_CMD --endpoint-url \"$S3_ENDPOINT\""
        fi
        
        if eval "$UPLOAD_CMD"; then
            print_success "Backup uploaded to S3"
        else
            print_error "Failed to upload backup to S3"
        fi
    else
        print_error "AWS CLI not installed, skipping S3 upload"
    fi
    
    echo ""
fi

# Clean up old backups
print_info "Cleaning up old backups (older than $RETENTION_DAYS days)..."

find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.sql.gz" -type f -mtime +"$RETENTION_DAYS" -delete

OLD_COUNT=$(find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.sql.gz" -type f | wc -l)
print_success "Retained $OLD_COUNT backup(s)"

echo ""

# List recent backups
print_info "Recent backups:"
ls -lh "$BACKUP_DIR"/${DB_NAME}_backup_*.sql.gz 2>/dev/null | tail -5

echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Backup file: $BACKUP_FILE_GZ"
echo "Backup size: $BACKUP_SIZE"
echo ""
echo "To restore this backup:"
echo "  gunzip -c $BACKUP_FILE_GZ | kubectl exec -i -n $NAMESPACE $POD_NAME -- psql -U $DB_USER $DB_NAME"
echo ""
