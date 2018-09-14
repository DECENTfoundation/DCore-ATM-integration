FROM nginx:1.13.7

COPY nginx.conf /etc/nginx/nginx.conf
COPY api /etc/nginx/sites-enabled/api

## upstreams must loaded before use
COPY upstreams /etc/nginx/sites-enabled/Aupstreams

## enviroments
#COPY production /etc/nginx/sites-enabled/production
COPY development /etc/nginx/sites-enabled/development
