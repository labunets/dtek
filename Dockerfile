# Stage 1: Build React app
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime with Playwright + nginx
FROM mcr.microsoft.com/playwright:v1.57.0-noble

# Install nginx and supervisor
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built React app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy scraper and dependencies
COPY --from=build /app/node_modules ./node_modules
COPY scrape-dtek.js package.json ./

# Create public directory for schedule.json
RUN mkdir -p /app/public

# Copy configuration files
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Remove default nginx config
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
