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

**Dockerfile** (déjà inclus dans le projet)
```dockerfile
# Étape 1 : image de base
FROM node:18

# Créer le dossier de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code, y compris le dossier prisma
COPY . .

# Générer le client Prisma (après avoir copié le schema)
RUN npx prisma generate

# Installer OpenSSL si nécessaire
RUN apt-get update && apt-get install -y openssl libssl-dev

# Exposer le port utilisé par le serveur
EXPOSE 3000

# Commande de démarrage
CMD ["node", "src/server.js"]
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
git clone https://github.com/ksertia/sonabhy-es-back.git /var/www/backend-sonaby
cd /var/www/backend-sonaby

# Installation des dépendances
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos valeurs (voir section Configuration ci-dessous)
nano .env

# Génération Prisma
npx prisma generate

# Synchroniser le schéma avec la base de données
npx prisma db push

# Insérer les données initiales
npm run prisma:seed

# Démarrer l'application avec PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Configuration du fichier .env

Assurez-vous que votre fichier `.env` contient au minimum :

```env
# Base de données
DATABASE_URL="mysql://sonaby_user:VOTRE_MOT_DE_PASSE@localhost:3306/sonaby_db"

# JWT Secrets (générer des clés fortes)
JWT_SECRET="votre-cle-jwt-super-securisee-32-caracteres-minimum"
JWT_REFRESH_SECRET="votre-cle-refresh-super-securisee-32-caracteres-minimum"

# Application
PORT=3000
NODE_ENV=production

# CORS (votre domaine de production)
CORS_ORIGIN="https://votre-domaine.com"
```

### 4. Configuration PM2

**Créer le fichier `ecosystem.config.js` à la racine du projet**

```javascript
module.exports = {
  apps: [{
    name: 'backend-sonaby',
    script: 'src/server.js',
    instances: 2,  // ou 'max' pour utiliser tous les CPU
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
    node_args: '--max-old-space-size=1024',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

**Commandes PM2 utiles**

```bash
# Démarrer l'application
pm2 start ecosystem.config.js --env production

# Voir le statut
pm2 status
pm2 list

# Voir les logs
pm2 logs backend-sonaby
pm2 logs backend-sonaby --lines 100

# Redémarrer
pm2 restart backend-sonaby

# Recharger (zero-downtime)
pm2 reload backend-sonaby

# Arrêter
pm2 stop backend-sonaby

# Supprimer
pm2 delete backend-sonaby

# Monitoring
pm2 monit

# Sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique
pm2 startup
# Suivre les instructions affichées
```

### 5. Configuration Nginx

**Créer le fichier de configuration Nginx**

```bash
# Créer la configuration
sudo nano /etc/nginx/sites-available/backend-sonaby
```

**Contenu du fichier `/etc/nginx/sites-available/backend-sonaby`**

```nginx
# Configuration HTTP (redirection vers HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Taille maximale des uploads
    client_max_body_size 10M;

    # Logs
    access_log /var/log/nginx/backend-sonaby-access.log;
    error_log /var/log/nginx/backend-sonaby-error.log;

    # Proxy vers l'application Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # Headers pour WebSocket et proxy
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Servir les fichiers uploadés directement
    location /uploads/ {
        alias /var/www/backend-sonaby/src/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Documentation Swagger
    location /api-docs {
        proxy_pass http://localhost:3000/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Activer la configuration et obtenir le certificat SSL**

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/backend-sonaby /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Si le test est OK, recharger Nginx
sudo systemctl reload nginx

# Obtenir le certificat SSL avec Certbot
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
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

## 📝 Checklist de Déploiement

### Avant le Déploiement

- [ ] Variables d'environnement configurées dans `.env`
- [ ] Secrets JWT générés (32+ caractères)
- [ ] Base de données MySQL créée et accessible
- [ ] Nom de domaine configuré (DNS pointant vers le serveur)
- [ ] Ports 80, 443, 3000 ouverts sur le firewall
- [ ] Node.js 18+ installé
- [ ] PM2 installé globalement
- [ ] Nginx installé et configuré

### Pendant le Déploiement

- [ ] Code cloné depuis GitHub
- [ ] Dépendances npm installées
- [ ] Client Prisma généré
- [ ] Schéma de base de données synchronisé
- [ ] Données initiales insérées (seed)
- [ ] Application démarrée avec PM2
- [ ] Configuration PM2 sauvegardée
- [ ] Démarrage automatique PM2 configuré
- [ ] Configuration Nginx créée et activée
- [ ] Certificat SSL obtenu avec Certbot

### Après le Déploiement

- [ ] Application accessible via HTTPS
- [ ] Documentation Swagger accessible (`/api-docs`)
- [ ] Test de connexion à l'API
- [ ] Test d'authentification (login/register)
- [ ] Logs PM2 vérifiés (pas d'erreurs)
- [ ] Logs Nginx vérifiés
- [ ] Firewall UFW activé
- [ ] Sauvegarde automatique configurée
- [ ] Monitoring PM2 fonctionnel
- [ ] Renouvellement SSL automatique testé

## 🔍 Tests de Validation

### Test 1: Santé de l'API

```bash
curl https://votre-domaine.com/api/v1/health
# Réponse attendue: {"status":"ok","timestamp":"..."}
```

### Test 2: Documentation Swagger

```bash
curl https://votre-domaine.com/api-docs
# Doit retourner la page HTML de Swagger
```

### Test 3: Authentification

```bash
# Test de login
curl -X POST https://votre-domaine.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
# Doit retourner un accessToken et refreshToken
```

### Test 4: Endpoint Protégé

```bash
# Remplacer YOUR_TOKEN par le token obtenu
curl https://votre-domaine.com/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN"
# Doit retourner la liste des utilisateurs
```

## 🚨 Résolution de Problèmes Courants

### Problème: L'application ne démarre pas

**Symptômes**: PM2 montre l'app en erreur

**Solutions**:
```bash
# Vérifier les logs
pm2 logs backend-sonaby --lines 50

# Vérifier les variables d'environnement
cat .env

# Vérifier la connexion à la base de données
mysql -u sonaby_user -p sonaby_db

# Régénérer le client Prisma
npx prisma generate

# Redémarrer
pm2 restart backend-sonaby
```

### Problème: Erreur de connexion à la base de données

**Symptômes**: `Error: Can't connect to MySQL server`

**Solutions**:
```bash
# Vérifier que MySQL est actif
sudo systemctl status mysql

# Vérifier les credentials dans .env
cat .env | grep DATABASE_URL

# Tester la connexion manuellement
mysql -u sonaby_user -p

# Vérifier les permissions
mysql -u root -p
SHOW GRANTS FOR 'sonaby_user'@'localhost';
```

### Problème: Nginx retourne 502 Bad Gateway

**Symptômes**: Erreur 502 lors de l'accès au site

**Solutions**:
```bash
# Vérifier que l'application tourne
pm2 status

# Vérifier que le port 3000 est bien utilisé
netstat -tlnp | grep 3000

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/backend-sonaby-error.log

# Tester la connexion locale
curl http://localhost:3000/api/v1/health

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Problème: Certificat SSL ne se renouvelle pas

**Symptômes**: Avertissement d'expiration du certificat

**Solutions**:
```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Forcer le renouvellement
sudo certbot renew --force-renewal

# Vérifier la tâche cron
sudo systemctl status certbot.timer

# Recharger Nginx après renouvellement
sudo systemctl reload nginx
```

### Problème: Upload de fichiers échoue

**Symptômes**: Erreur 413 ou timeout

**Solutions**:
```bash
# Augmenter la limite dans Nginx
sudo nano /etc/nginx/sites-available/backend-sonaby
# Ajouter: client_max_body_size 50M;

# Vérifier les permissions du dossier uploads
ls -la /var/www/backend-sonaby/src/uploads/
sudo chown -R $USER:$USER /var/www/backend-sonaby/src/uploads/
sudo chmod -R 755 /var/www/backend-sonaby/src/uploads/

# Redémarrer Nginx
sudo systemctl reload nginx
```

## 📞 Support et Ressources

### Documentation
- **README.md**: Vue d'ensemble du projet
- **API_GUIDE.md**: Guide complet de l'API
- **DOCUMENTATION.md**: Documentation technique
- **structure_du_projet.md**: Architecture du code

### Liens Utiles
- **Repository GitHub**: https://github.com/ksertia/sonabhy-es-back
- **Swagger Documentation**: https://votre-domaine.com/api-docs
- **Prisma Docs**: https://www.prisma.io/docs
- **PM2 Docs**: https://pm2.keymetrics.io/docs
- **Nginx Docs**: https://nginx.org/en/docs

### Commandes de Maintenance Rapide

```bash
# Voir le statut de tous les services
sudo systemctl status nginx mysql
pm2 status

# Voir les logs en temps réel
pm2 logs backend-sonaby --lines 100
sudo tail -f /var/log/nginx/backend-sonaby-error.log

# Redémarrer tous les services
pm2 restart backend-sonaby
sudo systemctl restart nginx

# Mise à jour du code
cd /var/www/backend-sonaby
git pull origin main
npm install
npx prisma generate
npx prisma db push
pm2 reload backend-sonaby

# Sauvegarde manuelle
./backup.sh

# Vérifier l'utilisation des ressources
pm2 monit
htop
df -h
free -h
```

---

## 🎉 Félicitations !

Si vous avez suivi toutes les étapes, votre application **Backend Sonaby** est maintenant déployée en production avec :

✅ **Sécurité**: HTTPS, Firewall, Headers de sécurité  
✅ **Performance**: PM2 en mode cluster, Nginx reverse proxy  
✅ **Fiabilité**: Auto-restart, monitoring, logs  
✅ **Maintenance**: Sauvegardes automatiques, renouvellement SSL  
✅ **Documentation**: Swagger accessible en ligne  

**URL de votre API**: `https://votre-domaine.com/api/v1`  
**Documentation**: `https://votre-domaine.com/api-docs`

---

*Ce guide couvre les principales méthodes de déploiement. Adaptez les configurations selon vos besoins spécifiques et votre infrastructure.*

**Dernière mise à jour**: Novembre 2024  
**Version**: 1.0.0
