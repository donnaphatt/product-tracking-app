#!/bin/sh

echo "Starting nginx with simple configuration (no API proxy)"
echo "Frontend will make direct API calls to: $REACT_APP_API_URL"

# Copy the simple nginx config (no environment substitution needed)
cp /app/nginx.conf.simple /etc/nginx/conf.d/default.conf

# Debug: Show the nginx config being used
echo "Nginx configuration:"
cat /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'
