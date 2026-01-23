#!/bin/bash
# Build and Push Docker Images

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
IMAGE_PREFIX="${IMAGE_PREFIX:-piyush26293/testing-module}"
VERSION="${VERSION:-latest}"
COMPONENTS=("backend" "frontend" "runner" "nginx")

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
    echo "  -r, --registry REGISTRY    Docker registry (default: ghcr.io)"
    echo "  -v, --version VERSION      Image version tag (default: latest)"
    echo "  -c, --component COMPONENT  Build specific component only"
    echo "  -p, --push                 Push images after building"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Components: backend, frontend, runner, nginx, all"
    echo ""
    echo "Examples:"
    echo "  $0 --version v1.0.0 --push"
    echo "  $0 --component backend --push"
    exit 0
}

# Parse arguments
PUSH=false
SELECTED_COMPONENT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -c|--component)
            SELECTED_COMPONENT="$2"
            shift 2
            ;;
        -p|--push)
            PUSH=true
            shift
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
echo -e "${GREEN}Docker Image Build Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Registry: $REGISTRY"
echo "Version: $VERSION"
echo "Push: $PUSH"
echo ""

# Build function
build_image() {
    local component=$1
    local context=""
    local dockerfile=""
    local image_name="${REGISTRY}/${IMAGE_PREFIX}-${component}:${VERSION}"
    
    case $component in
        "backend")
            context="./backend"
            dockerfile="./devops/docker/backend/Dockerfile"
            ;;
        "frontend")
            context="./frontend"
            dockerfile="./devops/docker/frontend/Dockerfile"
            ;;
        "runner")
            context="./runner"
            dockerfile="./devops/docker/runner/Dockerfile"
            ;;
        "nginx")
            context="./devops/docker/nginx"
            dockerfile="./devops/docker/nginx/Dockerfile"
            ;;
        *)
            print_error "Unknown component: $component"
            return 1
            ;;
    esac
    
    print_info "Building $component image..."
    
    if [ ! -d "$context" ] && [ "$component" != "nginx" ]; then
        print_error "Context directory not found: $context"
        return 1
    fi
    
    if docker build \
        -t "$image_name" \
        -t "${REGISTRY}/${IMAGE_PREFIX}-${component}:latest" \
        -f "$dockerfile" \
        --target production \
        "$context"; then
        print_success "$component image built successfully"
        
        if [ "$PUSH" = true ]; then
            print_info "Pushing $component image..."
            if docker push "$image_name" && docker push "${REGISTRY}/${IMAGE_PREFIX}-${component}:latest"; then
                print_success "$component image pushed successfully"
            else
                print_error "Failed to push $component image"
                return 1
            fi
        fi
    else
        print_error "Failed to build $component image"
        return 1
    fi
    
    echo ""
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running"
    exit 1
fi

# Login to registry if pushing
if [ "$PUSH" = true ]; then
    print_info "Logging in to $REGISTRY..."
    if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
        echo "$DOCKER_PASSWORD" | docker login "$REGISTRY" -u "$DOCKER_USERNAME" --password-stdin
        print_success "Logged in to registry"
    else
        print_info "Using existing Docker credentials"
    fi
    echo ""
fi

# Build images
if [ -n "$SELECTED_COMPONENT" ]; then
    if [ "$SELECTED_COMPONENT" = "all" ]; then
        for component in "${COMPONENTS[@]}"; do
            build_image "$component"
        done
    else
        build_image "$SELECTED_COMPONENT"
    fi
else
    for component in "${COMPONENTS[@]}"; do
        build_image "$component"
    done
fi

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Built images:"
for component in "${COMPONENTS[@]}"; do
    if [ -z "$SELECTED_COMPONENT" ] || [ "$SELECTED_COMPONENT" = "$component" ] || [ "$SELECTED_COMPONENT" = "all" ]; then
        echo "  - ${REGISTRY}/${IMAGE_PREFIX}-${component}:${VERSION}"
    fi
done
echo ""

if [ "$PUSH" = true ]; then
    echo "Images have been pushed to the registry."
else
    echo "To push images, run with --push flag"
fi
echo ""
