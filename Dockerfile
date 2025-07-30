# Multi-stage build for Angular application with nginx

# Stage 1: Build the Angular application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy the built application from the build stage
COPY --from=build /app/dist/wealth-proxies-angular/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy basic auth password file
COPY .htpasswd /etc/nginx/.htpasswd

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
