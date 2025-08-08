#!/bin/sh

# Substitute environment variables in nginx template
envsubst '${REACT_APP_API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'
