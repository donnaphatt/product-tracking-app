# Multi-stage build for React frontend
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy simple nginx configuration (no environment substitution)
COPY nginx.conf.simple /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx directly (no custom script needed)
CMD ["nginx", "-g", "daemon off;"]
