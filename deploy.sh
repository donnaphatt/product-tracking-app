#!/bin/bash

# Product Tracking App Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

echo -e "${GREEN}🚀 Deploying Product Tracking App in $ENVIRONMENT mode${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example${NC}"
    cp .env.example .env
    echo -e "${RED}❗ Please update .env file with your configuration before running again${NC}"
    exit 1
fi

# Load environment variables
source .env

# Pre-deployment checks
echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Check Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

# Build and deploy
echo -e "${YELLOW}🔨 Building and starting services...${NC}"

if [ "$ENVIRONMENT" = "production" ]; then
    # Production deployment
    echo -e "${YELLOW}📦 Pulling latest images...${NC}"
    docker compose -f $COMPOSE_FILE pull
    
    echo -e "${YELLOW}🔄 Starting services with zero downtime...${NC}"
    docker compose -f $COMPOSE_FILE up -d --remove-orphans
else
    # Development deployment
    echo -e "${YELLOW}🔨 Building images...${NC}"
    docker compose -f $COMPOSE_FILE build
    
    echo -e "${YELLOW}🔄 Starting services...${NC}"
    docker compose -f $COMPOSE_FILE up -d --remove-orphans
fi

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"

# Check backend health
BACKEND_URL="http://localhost:${BACKEND_PORT:-8000}"
if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker compose -f $COMPOSE_FILE logs backend
    exit 1
fi

# Check frontend
FRONTEND_URL="http://localhost:${FRONTEND_PORT:-3000}"
if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend accessibility check failed${NC}"
    docker compose -f $COMPOSE_FILE logs frontend
    exit 1
fi

# Check database
if docker compose -f $COMPOSE_FILE exec -T mongo mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is accessible${NC}"
else
    echo -e "${RED}❌ Database check failed${NC}"
    docker compose -f $COMPOSE_FILE logs mongo
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📱 Frontend: $FRONTEND_URL${NC}"
echo -e "${GREEN}🔧 Backend API: $BACKEND_URL${NC}"
echo -e "${GREEN}📊 Health Check: $BACKEND_URL/health${NC}"

# Show running containers
echo -e "${YELLOW}📋 Running containers:${NC}"
docker compose -f $COMPOSE_FILE ps
