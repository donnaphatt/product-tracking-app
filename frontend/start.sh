#!/bin/sh

# Set default value if REACT_APP_API_URL is not set
if [ -z "$REACT_APP_API_URL" ]; then
    export REACT_APP_API_URL="localhost:8000"
    echo "Warning: REACT_APP_API_URL not set, using default: $REACT_APP_API_URL"
fi

echo "Using API URL: $REACT_APP_API_URL"

# Substitute environment variables in nginx template
envsubst '${REACT_APP_API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Debug: Show the generated config
echo "Generated nginx config:"
cat /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'
