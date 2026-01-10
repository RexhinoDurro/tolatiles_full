# Tola Tiles - VPS Deployment Guide

This guide covers deploying the Tola Tiles application to a VPS (Ubuntu 22.04 LTS).

## Prerequisites

- VPS with Ubuntu 22.04 LTS (minimum 2GB RAM, 2 CPU cores)
- Domain name pointed to your VPS IP
- SSH access to the server
- Basic knowledge of Linux commands

## Server Setup

### 1. Initial Server Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl git build-essential software-properties-common

# Create deploy user
sudo adduser deploy
sudo usermod -aG sudo deploy

# Switch to deploy user
su - deploy
```

### 2. Install Node.js (v20 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Python 3.11+

```bash
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Set as default (optional)
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
```

### 4. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE USER tolatiles WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE tolatiles OWNER tolatiles;
GRANT ALL PRIVILEGES ON DATABASE tolatiles TO tolatiles;
EOF
```

### 5. Install Redis

```bash
sudo apt install -y redis-server

# Configure Redis
sudo sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf

# Start and enable Redis
sudo systemctl restart redis
sudo systemctl enable redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 6. Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Application Deployment

### 1. Clone the Repository

```bash
cd /home/deploy
git clone https://github.com/yourusername/tolatiles_full.git
cd tolatiles_full
```

### 2. Backend Setup (Django)

```bash
cd /home/deploy/tolatiles_full/server

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Create .env file
cat > .env << EOF
DEBUG=False
SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgres://tolatiles:your_secure_password_here@localhost:5432/tolatiles
CELERY_BROKER_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EOF

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Create media directory
mkdir -p media/gallery
sudo chown -R deploy:deploy media
```

### 3. Frontend Setup (Next.js)

```bash
cd /home/deploy/tolatiles_full/client

# Install dependencies
npm ci --production=false

# Create .env.production file
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
EOF

# Build the application
npm run build
```

## Systemd Services

### 1. Gunicorn Service (Django)

```bash
sudo nano /etc/systemd/system/tolatiles-backend.service
```

```ini
[Unit]
Description=Tola Tiles Django Backend
After=network.target postgresql.service

[Service]
User=deploy
Group=deploy
WorkingDirectory=/home/deploy/tolatiles_full/server
Environment="PATH=/home/deploy/tolatiles_full/server/venv/bin"
EnvironmentFile=/home/deploy/tolatiles_full/server/.env
ExecStart=/home/deploy/tolatiles_full/server/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/run/tolatiles-backend.sock \
    --access-logfile /var/log/tolatiles/gunicorn-access.log \
    --error-logfile /var/log/tolatiles/gunicorn-error.log \
    config.wsgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### 2. Celery Worker Service

```bash
sudo nano /etc/systemd/system/tolatiles-celery.service
```

```ini
[Unit]
Description=Tola Tiles Celery Worker
After=network.target redis.service

[Service]
User=deploy
Group=deploy
WorkingDirectory=/home/deploy/tolatiles_full/server
Environment="PATH=/home/deploy/tolatiles_full/server/venv/bin"
EnvironmentFile=/home/deploy/tolatiles_full/server/.env
ExecStart=/home/deploy/tolatiles_full/server/venv/bin/celery \
    -A config worker \
    --loglevel=info \
    --logfile=/var/log/tolatiles/celery.log
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### 3. Next.js Service

```bash
sudo nano /etc/systemd/system/tolatiles-frontend.service
```

```ini
[Unit]
Description=Tola Tiles Next.js Frontend
After=network.target

[Service]
User=deploy
Group=deploy
WorkingDirectory=/home/deploy/tolatiles_full/client
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### 4. Create Log Directory and Start Services

```bash
# Create log directory
sudo mkdir -p /var/log/tolatiles
sudo chown deploy:deploy /var/log/tolatiles

# Create socket directory
sudo mkdir -p /run
sudo chown deploy:deploy /run/tolatiles-backend.sock 2>/dev/null || true

# Reload systemd
sudo systemctl daemon-reload

# Enable and start services
sudo systemctl enable tolatiles-backend tolatiles-celery tolatiles-frontend
sudo systemctl start tolatiles-backend tolatiles-celery tolatiles-frontend

# Check status
sudo systemctl status tolatiles-backend
sudo systemctl status tolatiles-celery
sudo systemctl status tolatiles-frontend
```

## Nginx Configuration

### 1. Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/tolatiles
```

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

# Upstream servers
upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

upstream django_upstream {
    server unix:/run/tolatiles-backend.sock;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml image/svg+xml;

    # Client max body size (for image uploads)
    client_max_body_size 20M;

    # Django API
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://django_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://django_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django static files
    location /static/ {
        alias /home/deploy/tolatiles_full/server/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files (uploaded images)
    location /media/ {
        alias /home/deploy/tolatiles_full/server/media/;
        expires 1y;
        add_header Cache-Control "public";

        # WebP support
        location ~* \.webp$ {
            add_header Content-Type image/webp;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Next.js static files
    location /_next/static/ {
        proxy_pass http://nextjs_upstream;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Next.js image optimization
    location /_next/image {
        proxy_pass http://nextjs_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_valid 200 60m;
    }

    # Frontend images
    location /images/ {
        proxy_pass http://nextjs_upstream;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Next.js frontend (catch-all)
    location / {
        limit_req zone=general_limit burst=50 nodelay;

        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

### 2. Enable Site and Test Config

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tolatiles /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

## Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `DEBUG` | Django debug mode | `False` |
| `SECRET_KEY` | Django secret key | Auto-generated |
| `ALLOWED_HOSTS` | Allowed hostnames | `yourdomain.com,www.yourdomain.com` |
| `DATABASE_URL` | PostgreSQL connection | `postgres://user:pass@localhost:5432/db` |
| `CELERY_BROKER_URL` | Redis URL for Celery | `redis://localhost:6379/0` |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `https://yourdomain.com` |

### Frontend (.env.production)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://yourdomain.com/api` |

## Maintenance Commands

### Viewing Logs

```bash
# Backend logs
sudo journalctl -u tolatiles-backend -f

# Celery logs
sudo journalctl -u tolatiles-celery -f
tail -f /var/log/tolatiles/celery.log

# Frontend logs
sudo journalctl -u tolatiles-frontend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restarting Services

```bash
# Restart all services
sudo systemctl restart tolatiles-backend tolatiles-celery tolatiles-frontend

# Restart Nginx
sudo systemctl restart nginx
```

### Updating the Application

```bash
cd /home/deploy/tolatiles_full

# Pull latest changes
git pull origin main

# Update backend
cd server
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart tolatiles-backend tolatiles-celery

# Update frontend
cd ../client
npm ci
npm run build
sudo systemctl restart tolatiles-frontend
```

### Database Backup

```bash
# Create backup
pg_dump -U tolatiles -h localhost tolatiles > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U tolatiles -h localhost tolatiles < backup_file.sql
```

### Media Backup

```bash
# Backup media files
tar -czvf media_backup_$(date +%Y%m%d).tar.gz /home/deploy/tolatiles_full/server/media/
```

## Monitoring (Optional)

### Install Prometheus Node Exporter

```bash
sudo apt install -y prometheus-node-exporter
sudo systemctl enable prometheus-node-exporter
sudo systemctl start prometheus-node-exporter
```

### Health Check Endpoint

Add to your monitoring:
- Frontend: `https://yourdomain.com/`
- Backend API: `https://yourdomain.com/api/categories/`

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if backend service is running: `sudo systemctl status tolatiles-backend`
   - Check socket file exists: `ls -la /run/tolatiles-backend.sock`
   - Check backend logs: `sudo journalctl -u tolatiles-backend -n 50`

2. **Static files not loading**
   - Run `python manage.py collectstatic --noinput`
   - Check Nginx static file paths
   - Verify file permissions

3. **Celery tasks not processing**
   - Check Redis is running: `redis-cli ping`
   - Check Celery logs: `sudo journalctl -u tolatiles-celery -n 50`

4. **Database connection errors**
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check DATABASE_URL in .env file
   - Test connection: `psql -U tolatiles -h localhost tolatiles`

5. **Permission denied errors**
   - Fix ownership: `sudo chown -R deploy:deploy /home/deploy/tolatiles_full`
   - Fix media permissions: `chmod -R 755 /home/deploy/tolatiles_full/server/media`

## Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Set strong Django SECRET_KEY
- [ ] Enable UFW firewall
- [ ] Install and configure SSL
- [ ] Disable DEBUG in production
- [ ] Set up regular backups
- [ ] Configure fail2ban (optional)
- [ ] Enable automatic security updates

```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Performance Tips

1. **Enable HTTP/2** - Already configured in Nginx
2. **Use CDN** - Consider Cloudflare for static assets
3. **Database indexing** - Django migrations handle this
4. **Redis caching** - Already configured for Celery, can extend for Django cache
5. **Image optimization** - Celery automatically converts to WebP

---

For support, contact: menitola@tolatiles.com
