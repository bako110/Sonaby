# 🚀 Guide de Déploiement - Backend Sonaby

## 📋 Prérequis

### Environnement de Production
- **Serveur**: Linux (Ubuntu 20.04+ recommandé)
- **Node.js**: v18.0.0 ou supérieur
- **MySQL**: v8.0 ou supérieur
- **RAM**: Minimum 2GB, recommandé 4GB+
- **Stockage**: Minimum 20GB SSD
- **Réseau**: Ports 80, 443, 3000 ouverts

### Outils Requis
- Docker & Docker Compose
- Git
- PM2 (pour la gestion des processus)
- Nginx (reverse proxy)
- Certbot (SSL/TLS)

## 🐳 Déploiement avec Docker

### 1. Configuration Docker

**Dockerfile** (déjà inclus)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copie du code source
COPY . .

# Génération du client Prisma
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://sonaby_user:${DB_PASSWORD}@db:3306/sonaby_db
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - ./uploads:/app/src/uploads
      - ./logs:/app/logs

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=sonaby_db
      - MYSQL_USER=sonaby_user
      - MYSQL_PASSWORD=${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mysql_data:
```

### 2. Variables d'Environnement

**Créer `.env.production`**
```env
# Base de données
DATABASE_URL="mysql://sonaby_user:STRONG_PASSWORD@localhost:3306/sonaby_db"

# JWT Secrets (générer des clés fortes)
JWT_SECRET="your-super-strong-jwt-secret-key-here"
JWT_REFRESH_SECRET="your-super-strong-refresh-secret-key-here"

# Application
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGIN="https://votre-domaine.com"

# Base de données (pour Docker)
DB_PASSWORD="STRONG_DB_PASSWORD"
DB_ROOT_PASSWORD="STRONG_ROOT_PASSWORD"

# SSL/TLS
SSL_CERT_PATH="/etc/letsencrypt/live/votre-domaine.com/fullchain.pem"
SSL_KEY_PATH="/etc/letsencrypt/live/votre-domaine.com/privkey.pem"
```

### 3. Configuration Nginx

**nginx/nginx.conf**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Redirection HTTP vers HTTPS
    server {
        listen 80;
        server_name votre-domaine.com www.votre-domaine.com;
        return 301 https://$server_name$request_uri;
    }

    # Configuration HTTPS
    server {
        listen 443 ssl http2;
        server_name votre-domaine.com www.votre-domaine.com;

        # Certificats SSL
        ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

        # Configuration SSL moderne
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;

        # Headers de sécurité
        add_header Strict-Transport-Security "max-age=63072000" always;
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # Proxy vers l'application
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Gestion des fichiers statiques
        location /uploads/ {
            alias /app/src/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 4. Déploiement

```bash
# 1. Cloner le projet
git clone <your-repo-url>
cd backend-sonaby

# 2. Configurer l'environnement
cp .env.example .env.production
# Éditer .env.production avec vos valeurs

# 3. Construire et démarrer
docker-compose up -d --build

# 4. Initialiser la base de données
docker-compose exec app npx prisma db push
docker-compose exec app npm run prisma:seed

# 5. Vérifier le statut
docker-compose ps
docker-compose logs app
```

## 🌐 Déploiement sur Fly.io

### 1. Configuration Fly.io

**fly.toml** (déjà inclus)
```toml
app = "backend-sonaby"
primary_region = "cdg"

[build]

[env]
  NODE_ENV = "production"
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 1024

[processes]
  app = "npm start"
```

### 2. Déploiement

```bash
# 1. Installer Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Se connecter
fly auth login

# 3. Créer l'application
fly apps create backend-sonaby

# 4. Configurer les secrets
fly secrets set JWT_SECRET="your-jwt-secret"
fly secrets set JWT_REFRESH_SECRET="your-refresh-secret"
fly secrets set DATABASE_URL="your-mysql-connection-string"

# 5. Déployer
fly deploy

# 6. Ouvrir l'application
fly open
```

## 🖥️ Déploiement VPS Traditionnel

### 1. Préparation du Serveur

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Installation PM2
sudo npm install -g pm2

# Installation Nginx
sudo apt install nginx -y

# Installation Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configuration MySQL

```bash
# Connexion à MySQL
sudo mysql -u root -p

# Création de la base de données
CREATE DATABASE sonaby_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sonaby_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON sonaby_db.* TO 'sonaby_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Déploiement de l'Application

```bash
# Cloner le projet
git clone <your-repo-url> /var/www/backend-sonaby
cd /var/www/backend-sonaby

# Installation des dépendances
npm ci --only=production

# Configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# Génération Prisma
npx prisma generate
npx prisma db push
npm run prisma:seed

# Configuration PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Configuration PM2

**ecosystem.config.js**
```javascript
module.exports = {
  apps: [{
    name: 'backend-sonaby',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 5. Configuration Nginx

```bash
# Créer la configuration
sudo nano /etc/nginx/sites-available/backend-sonaby

# Contenu du fichier
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Activer le site
sudo ln -s /etc/nginx/sites-available/backend-sonaby /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## 🔒 Sécurité en Production

### 1. Firewall

```bash
# Configuration UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Monitoring et Logs

```bash
# Installation de Logrotate pour les logs
sudo nano /etc/logrotate.d/backend-sonaby

# Contenu
/var/www/backend-sonaby/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reload backend-sonaby
    endscript
}
```

### 3. Sauvegarde Automatique

**backup.sh**
```bash
#!/bin/bash

# Variables
BACKUP_DIR="/var/backups/sonaby"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="sonaby_db"
DB_USER="sonaby_user"
DB_PASS="your_password"

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Sauvegarde des fichiers uploadés
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /var/www/backend-sonaby/src/uploads/

# Nettoyage (garder seulement les 7 derniers jours)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Sauvegarde terminée: $DATE"
```

```bash
# Rendre exécutable
chmod +x backup.sh

# Ajouter au crontab (sauvegarde quotidienne à 2h du matin)
crontab -e
0 2 * * * /path/to/backup.sh
```

## 📊 Monitoring

### 1. PM2 Monitoring

```bash
# Monitoring en temps réel
pm2 monit

# Logs
pm2 logs backend-sonaby

# Métriques
pm2 show backend-sonaby
```

### 2. Health Check

**healthcheck.js**
```javascript
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Service healthy');
    process.exit(0);
  } else {
    console.log('❌ Service unhealthy');
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('❌ Service unreachable:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Service timeout');
  req.destroy();
  process.exit(1);
});

req.end();
```

## 🔄 Mise à Jour

### Script de Déploiement

**deploy.sh**
```bash
#!/bin/bash

echo "🚀 Début du déploiement..."

# Sauvegarde
./backup.sh

# Mise à jour du code
git pull origin main

# Installation des dépendances
npm ci --only=production

# Mise à jour de la base de données
npx prisma generate
npx prisma db push

# Redémarrage de l'application
pm2 reload backend-sonaby

# Vérification
sleep 5
node healthcheck.js

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi!"
else
    echo "❌ Déploiement échoué, rollback..."
    git reset --hard HEAD~1
    pm2 reload backend-sonaby
    exit 1
fi
```

## 🆘 Dépannage

### Problèmes Courants

**1. Erreur de connexion à la base de données**
```bash
# Vérifier le statut MySQL
sudo systemctl status mysql

# Vérifier les logs
sudo tail -f /var/log/mysql/error.log

# Tester la connexion
mysql -u sonaby_user -p sonaby_db
```

**2. Application qui ne démarre pas**
```bash
# Vérifier les logs PM2
pm2 logs backend-sonaby

# Vérifier les permissions
ls -la /var/www/backend-sonaby

# Tester manuellement
cd /var/www/backend-sonaby
npm start
```

**3. Problèmes SSL**
```bash
# Renouveler le certificat
sudo certbot renew

# Vérifier la configuration Nginx
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Commandes Utiles

```bash
# Statut des services
sudo systemctl status nginx mysql
pm2 status

# Utilisation des ressources
htop
df -h
free -h

# Logs système
sudo journalctl -u nginx -f
sudo tail -f /var/log/mysql/error.log

# Redémarrage complet
pm2 restart all
sudo systemctl restart nginx mysql
```

---

*Ce guide couvre les principales méthodes de déploiement. Adaptez les configurations selon vos besoins spécifiques et votre infrastructure.*
