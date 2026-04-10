#!/bin/bash

# Deployment Validation Script
# This script validates that all components are deployed and working correctly

set -e

NAMESPACE="annotation-system"
TIMEOUT=300

echo "=========================================="
echo "Annotation System Deployment Validation"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        return 1
    fi
}

# Function to check namespace
check_namespace() {
    echo "Checking namespace..."
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        print_status 0 "Namespace '$NAMESPACE' exists"
    else
        print_status 1 "Namespace '$NAMESPACE' not found"
        return 1
    fi
}

# Function to check deployments
check_deployments() {
    echo ""
    echo "Checking deployments..."
    local deployments=("postgres" "annotation-backend" "annotation-frontend")
    for deployment in "${deployments[@]}"; do
        local ready=$(kubectl get deployment $deployment -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        local desired=$(kubectl get deployment $deployment -n $NAMESPACE -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
        if [ "$ready" -eq "$desired" ] && [ "$desired" -gt 0 ]; then
            print_status 0 "Deployment '$deployment': $ready/$desired replicas ready"
        else
            print_status 1 "Deployment '$deployment': $ready/$desired replicas ready (expected $desired)"
        fi
    done
}

# Function to check services
check_services() {
    echo ""
    echo "Checking services..."
    local services=("postgres-service" "backend-service" "frontend-service")
    for service in "${services[@]}"; do
        if kubectl get service $service -n $NAMESPACE &> /dev/null; then
            local ip=$(kubectl get service $service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
            print_status 0 "Service '$service': $ip"
        else
            print_status 1 "Service '$service' not found"
        fi
    done
}

# Function to check pods
check_pods() {
    echo ""
    echo "Checking pods..."
    local pods=$(kubectl get pods -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')
    echo "Pods: $pods"
    
    for pod in $pods; do
        local phase=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.phase}')
        if [ "$phase" = "Running" ]; then
            print_status 0 "Pod '$pod': $phase"
        else
            print_status 1 "Pod '$pod': $phase (expected Running)"
        fi
    done
}

# Function to check PVCs
check_pvcs() {
    echo ""
    echo "Checking persistent volumes..."
    local pvcs=$(kubectl get pvc -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')
    for pvc in $pvcs; do
        local status=$(kubectl get pvc $pvc -n $NAMESPACE -o jsonpath='{.status.phase}')
        if [ "$status" = "Bound" ]; then
            print_status 0 "PVC '$pvc': $status"
        else
            print_status 1 "PVC '$pvc': $status (expected Bound)"
        fi
    done
}

# Function to check health endpoints
check_health() {
    echo ""
    echo "Checking health endpoints..."
    
    # Port forward backend
    kubectl port-forward -n $NAMESPACE service/backend-service 8000:8000 &> /dev/null &
    PF_PID=$!
    sleep 2
    
    if curl -s http://localhost:8000/api/health/ | grep -q "ok"; then
        print_status 0 "Backend health check passed"
    else
        print_status 1 "Backend health check failed"
    fi
    
    kill $PF_PID 2>/dev/null || true
}

# Function to generate summary
generate_summary() {
    echo ""
    echo "=========================================="
    echo "Deployment Summary"
    echo "=========================================="
    echo ""
    echo "Namespace: $NAMESPACE"
    echo ""
    echo "Deployments:"
    kubectl get deployments -n $NAMESPACE
    echo ""
    echo "Services:"
    kubectl get services -n $NAMESPACE
    echo ""
    echo "Pods:"
    kubectl get pods -n $NAMESPACE
    echo ""
    echo "PVCs:"
    kubectl get pvc -n $NAMESPACE
    echo ""
    echo "To access the frontend:"
    echo "  kubectl port-forward -n $NAMESPACE service/frontend-service 5173:80"
    echo ""
    echo "To access the backend:"
    echo "  kubectl port-forward -n $NAMESPACE service/backend-service 8000:8000"
}

# Run all checks
check_namespace
check_deployments
check_services
check_pods
check_pvcs
# check_health  # Uncomment after ensuring services are accessible

generate_summary

echo ""
echo -e "${GREEN}Validation complete!${NC}"
