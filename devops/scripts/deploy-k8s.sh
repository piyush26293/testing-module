#!/bin/bash
# Deploy to Kubernetes

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="${NAMESPACE:-ai-testing-platform}"
ENVIRONMENT="${ENVIRONMENT:-production}"
KUBECONFIG_FILE="${KUBECONFIG_FILE:-}"
USE_HELM="${USE_HELM:-true}"

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
    echo "  -e, --environment ENV      Environment (dev, staging, production)"
    echo "  -n, --namespace NAMESPACE  Kubernetes namespace"
    echo "  -k, --kubeconfig FILE      Path to kubeconfig file"
    echo "  -m, --method METHOD        Deployment method (helm, kubectl)"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --environment production"
    echo "  $0 --environment staging --namespace ai-testing-staging"
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -k|--kubeconfig)
            KUBECONFIG_FILE="$2"
            shift 2
            ;;
        -m|--method)
            if [ "$2" = "kubectl" ]; then
                USE_HELM=false
            fi
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
echo -e "${GREEN}Kubernetes Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo "Method: $([ "$USE_HELM" = true ] && echo "Helm" || echo "kubectl")"
echo ""

# Check prerequisites
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

if ! command_exists kubectl; then
    print_error "kubectl is not installed"
    exit 1
fi

if [ "$USE_HELM" = true ] && ! command_exists helm; then
    print_error "Helm is not installed"
    exit 1
fi

# Set kubeconfig if provided
if [ -n "$KUBECONFIG_FILE" ]; then
    export KUBECONFIG="$KUBECONFIG_FILE"
    print_info "Using kubeconfig: $KUBECONFIG_FILE"
fi

# Check cluster connectivity
print_info "Checking cluster connectivity..."
if kubectl cluster-info >/dev/null 2>&1; then
    print_success "Connected to Kubernetes cluster"
else
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi

echo ""

# Create namespace if it doesn't exist
print_info "Checking namespace..."
if kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
    print_success "Namespace $NAMESPACE exists"
else
    print_info "Creating namespace $NAMESPACE..."
    kubectl create namespace "$NAMESPACE"
    print_success "Namespace created"
fi

echo ""

# Deploy using Helm or kubectl
if [ "$USE_HELM" = true ]; then
    print_info "Deploying with Helm..."
    
    VALUES_FILE="./devops/helm/testing-platform/values-${ENVIRONMENT}.yaml"
    
    if [ ! -f "$VALUES_FILE" ]; then
        print_error "Values file not found: $VALUES_FILE"
        exit 1
    fi
    
    helm upgrade --install testing-platform ./devops/helm/testing-platform \
        --namespace "$NAMESPACE" \
        --values "$VALUES_FILE" \
        --wait \
        --timeout 10m
    
    print_success "Helm deployment completed"
else
    print_info "Deploying with kubectl..."
    
    if [ -f "./devops/kubernetes/kustomization.yaml" ]; then
        kubectl apply -k ./devops/kubernetes --namespace "$NAMESPACE"
    else
        kubectl apply -f ./devops/kubernetes/ --namespace "$NAMESPACE" --recursive
    fi
    
    print_success "kubectl deployment completed"
fi

echo ""

# Wait for deployments to be ready
print_info "Waiting for deployments to be ready..."

DEPLOYMENTS=("backend" "frontend" "postgres" "redis" "minio")

for deployment in "${DEPLOYMENTS[@]}"; do
    if kubectl get deployment "$deployment" -n "$NAMESPACE" >/dev/null 2>&1; then
        print_info "Waiting for $deployment..."
        if kubectl rollout status deployment/"$deployment" -n "$NAMESPACE" --timeout=5m; then
            print_success "$deployment is ready"
        else
            print_error "$deployment failed to become ready"
        fi
    fi
done

echo ""

# Get deployment status
print_info "Deployment Status:"
kubectl get pods -n "$NAMESPACE"

echo ""

# Get service endpoints
print_info "Service Endpoints:"
kubectl get svc -n "$NAMESPACE"

echo ""

# Get ingress
if kubectl get ingress -n "$NAMESPACE" >/dev/null 2>&1; then
    print_info "Ingress Configuration:"
    kubectl get ingress -n "$NAMESPACE"
    echo ""
fi

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/backend -n $NAMESPACE"
echo ""
echo "To access the application:"
echo "  kubectl port-forward svc/frontend-service 3000:3000 -n $NAMESPACE"
echo ""
