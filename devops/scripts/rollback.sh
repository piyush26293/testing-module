#!/bin/bash
# Rollback Kubernetes Deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="${NAMESPACE:-ai-testing-platform}"
RELEASE_NAME="${RELEASE_NAME:-testing-platform}"
REVISION="${REVISION:-0}"

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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Usage information
usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -n, --namespace NAMESPACE  Kubernetes namespace (default: ai-testing-platform)"
    echo "  -r, --revision REVISION    Revision to rollback to (0 for previous, default: 0)"
    echo "  -c, --component COMPONENT  Rollback specific component only"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Rollback to previous version"
    echo "  $0 --revision 3                       # Rollback to specific revision"
    echo "  $0 --component backend                # Rollback specific component"
    exit 0
}

# Parse arguments
COMPONENT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -r|--revision)
            REVISION="$2"
            shift 2
            ;;
        -c|--component)
            COMPONENT="$2"
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
echo -e "${RED}========================================${NC}"
echo -e "${RED}Kubernetes Rollback Script${NC}"
echo -e "${RED}========================================${NC}"
echo ""
print_warning "This will rollback your deployment!"
echo ""
echo "Namespace: $NAMESPACE"
if [ -n "$COMPONENT" ]; then
    echo "Component: $COMPONENT"
else
    echo "Component: All"
fi
if [ "$REVISION" -eq 0 ]; then
    echo "Target: Previous version"
else
    echo "Target: Revision $REVISION"
fi
echo ""

# Confirmation
read -p "Are you sure you want to proceed? (yes/no) " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "Rollback cancelled"
    exit 0
fi

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

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
    print_error "Namespace $NAMESPACE does not exist"
    exit 1
fi

echo ""

# Rollback function for deployment
rollback_deployment() {
    local deployment=$1
    
    print_info "Rolling back $deployment..."
    
    if ! kubectl get deployment "$deployment" -n "$NAMESPACE" >/dev/null 2>&1; then
        print_warning "Deployment $deployment not found, skipping"
        return 0
    fi
    
    if [ "$REVISION" -eq 0 ]; then
        kubectl rollout undo deployment/"$deployment" -n "$NAMESPACE"
    else
        kubectl rollout undo deployment/"$deployment" --to-revision="$REVISION" -n "$NAMESPACE"
    fi
    
    print_info "Waiting for $deployment rollback to complete..."
    if kubectl rollout status deployment/"$deployment" -n "$NAMESPACE" --timeout=5m; then
        print_success "$deployment rolled back successfully"
    else
        print_error "$deployment rollback failed"
        return 1
    fi
}

# Check if Helm is being used
if command -v helm >/dev/null 2>&1; then
    if helm list -n "$NAMESPACE" | grep -q "$RELEASE_NAME"; then
        print_info "Helm release detected, using Helm rollback..."
        
        # Show history
        print_info "Release history:"
        helm history "$RELEASE_NAME" -n "$NAMESPACE"
        echo ""
        
        # Perform Helm rollback
        if [ "$REVISION" -eq 0 ]; then
            print_info "Rolling back to previous release..."
            helm rollback "$RELEASE_NAME" -n "$NAMESPACE" --wait --timeout 10m
        else
            print_info "Rolling back to revision $REVISION..."
            helm rollback "$RELEASE_NAME" "$REVISION" -n "$NAMESPACE" --wait --timeout 10m
        fi
        
        print_success "Helm rollback completed"
    else
        print_info "No Helm release found, using kubectl rollback..."
    fi
else
    print_info "Helm not found, using kubectl rollback..."
fi

# Rollback deployments using kubectl
if [ -n "$COMPONENT" ]; then
    rollback_deployment "$COMPONENT"
else
    DEPLOYMENTS=("backend" "frontend" "runner")
    
    for deployment in "${DEPLOYMENTS[@]}"; do
        rollback_deployment "$deployment"
        echo ""
    done
fi

echo ""

# Verify rollback
print_info "Verifying rollback..."
echo ""

kubectl get pods -n "$NAMESPACE"

echo ""

# Show deployment history
if [ -n "$COMPONENT" ]; then
    print_info "Rollout history for $COMPONENT:"
    kubectl rollout history deployment/"$COMPONENT" -n "$NAMESPACE"
else
    for deployment in "${DEPLOYMENTS[@]}"; do
        if kubectl get deployment "$deployment" -n "$NAMESPACE" >/dev/null 2>&1; then
            print_info "Rollout history for $deployment:"
            kubectl rollout history deployment/"$deployment" -n "$NAMESPACE"
            echo ""
        fi
    done
fi

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Rollback Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Namespace: $NAMESPACE"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/backend -n $NAMESPACE"
echo ""
echo "To check status:"
echo "  kubectl get pods -n $NAMESPACE"
echo ""
