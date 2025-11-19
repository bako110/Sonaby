# 🚀 Backend Sonaby

> **API REST complète pour la gestion des visites multi-sites d'entreprise**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-purple.svg)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-red.svg)](https://jwt.io/)

## 📋 Table des Matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🗄️ Base de Données](#️-base-de-données)
- [🏃‍♂️ Démarrage](#️-démarrage)
- [📖 Documentation](#-documentation)
- [🔐 Authentification](#-authentification)
- [🛠️ Scripts Disponibles](#️-scripts-disponibles)
- [📚 Documentation Complète](#-documentation-complète)

## 🎯 Vue d'ensemble

**Backend Sonaby** est une API REST moderne et sécurisée conçue pour gérer les systèmes de visites d'entreprise multi-sites. Elle offre une solution complète pour :

- 👥 **Gestion des visiteurs** et contrôle d'accès
- 📅 **Planification de rendez-vous** avec QR codes
- 🏢 **Administration multi-sites** et checkpoints
- ⚠️ **Gestion des incidents** et alertes SOS
- 📊 **Traçabilité complète** et audit trail
- 🔒 **Sécurité avancée** avec authentification JWT

## ✨ Fonctionnalités

### 🔐 Authentification & Autorisation
- Authentification JWT avec refresh tokens
- Système de rôles granulaire (Admin, Agent, Chef de service)
- Gestion des sessions et déconnexion sécurisée

### 👥 Gestion des Utilisateurs
- CRUD complet des utilisateurs
- Gestion des rôles et permissions
- Profils utilisateur personnalisables

### 🏢 Multi-Sites
- Gestion de plusieurs sites d'entreprise
- Configuration des points de contrôle (checkpoints)
- Assignation des agents aux checkpoints

### 👤 Gestion des Visiteurs
- Enregistrement des visiteurs avec validation d'identité
- Système de liste noire/blanche
- Historique complet des visites

### 📅 Rendez-vous & Planification
- Création de rendez-vous avec QR codes uniques
- Validation par les chefs de service
- Notifications et rappels

### 🚪 Contrôle d'Accès
- Check-in/Check-out en temps réel
- Suivi des visites actives
- Signatures numériques

### ⚠️ Sécurité & Incidents
- Déclaration et suivi des incidents
- Système d'alertes SOS
- Audit trail complet (RGPD compliant)

### 📊 Reporting & Analytics
- Rapports de visite détaillés
- Statistiques en temps réel
- Export de données

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Database      │
│   (React/Vue)   │◄──►│   (Express.js)  │◄──►│   (MySQL)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Middleware    │
                    │   - Auth JWT    │
                    │   - Validation  │
                    │   - Logging     │
                    │   - Security    │
                    └─────────────────┘
```

### Stack Technique
- **Backend**: Node.js + Express.js
- **Base de données**: MySQL + Prisma ORM
- **Authentification**: JWT (Access + Refresh tokens)
- **Validation**: Zod schemas
- **Documentation**: Swagger/OpenAPI 3.0
- **Sécurité**: Helmet, CORS, Rate limiting
- **Logging**: Winston
- **Déploiement**: Docker, Fly.io

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

### Installation rapide
```bash
# Cloner le projet
git clone <repository-url>
cd backend-sonaby

# Installer les dépendances
npm install

# Copier la configuration
cp .env.example .env
```

## ⚙️ Configuration

Créer un fichier `.env` avec vos paramètres :

```env
# Base de données
DATABASE_URL="mysql://username:password@localhost:3306/sonaby"

# JWT Secrets (générer des clés fortes)
JWT_SECRET="your-super-strong-jwt-secret"
JWT_REFRESH_SECRET="your-super-strong-refresh-secret"

# Application
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

## 🗄️ Base de Données

### Initialisation
```bash
# Générer le client Prisma
npx prisma generate

# Synchroniser le schéma
npx prisma db push

# Insérer les données initiales
npm run prisma:seed
```

### Données par défaut
Le seed crée automatiquement :
- **Admin** : `admin@example.com` / `password123`
- **Agent** : `agent@example.com` / `password123`
- Sites et services de démonstration
- Données de référence (rôles, types ID, statuts)

## 🏃‍♂️ Démarrage

### Développement
```bash
npm run dev
```
🌐 **API** : `http://localhost:3000/api/v1`  
📚 **Documentation** : `http://localhost:3000/api-docs`

### Production
```bash
npm start
```

## 📖 Documentation

### 🔗 Accès Rapide
- **Swagger UI** : `http://localhost:3000/api-docs`
- **Postman Collection** : Exportable depuis Swagger
- **Guide API** : Voir `API_GUIDE.md`

### 📋 Endpoints Principaux

#### 🔑 Authentification (`/api/v1/auth`)
```http
POST /auth/register    # Inscription
POST /auth/login       # Connexion
POST /auth/refresh     # Renouvellement token
GET  /auth/profile     # Profil utilisateur
```

#### 👥 Utilisateurs (`/api/v1/users`)
```http
GET    /users          # Liste paginée
POST   /users          # Création
GET    /users/:id      # Détails
PUT    /users/:id      # Modification
DELETE /users/:id      # Suppression
```

#### 🏢 Sites (`/api/v1/sites`)
```http
GET    /sites          # Liste des sites
POST   /sites          # Création site
GET    /sites/:id      # Détails site
PUT    /sites/:id      # Modification
```

#### 👤 Visiteurs (`/api/v1/visitors`)
```http
GET    /visitors       # Liste avec filtres
POST   /visitors       # Enregistrement
PUT    /visitors/:id   # Modification
POST   /visitors/:id/blacklist  # Liste noire
```

#### 🚪 Visites (`/api/v1/visits`)
```http
GET    /visits         # Historique visites
POST   /visits         # Check-in
POST   /visits/:id/checkout  # Check-out
```

## 🔐 Authentification

### Workflow JWT
1. **Login** → Obtenir `accessToken` + `refreshToken`
2. **Requêtes** → Header `Authorization: Bearer <accessToken>`
3. **Expiration** → Utiliser `refreshToken` pour renouveler
4. **Logout** → Invalider les tokens

### Exemple d'utilisation
```javascript
// Connexion
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
});

const { accessToken } = await response.json();

// Utilisation du token
const users = await fetch('/api/v1/users', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur avec auto-reload

# Production  
npm start               # Serveur production

# Base de données
npm run prisma:generate # Générer client Prisma
npm run prisma:migrate  # Migrations
npm run prisma:seed     # Données initiales
npm run prisma:studio   # Interface graphique DB

# Maintenance
npm run logs            # Voir les logs
npm run health          # Vérifier la santé de l'API
```

## 📚 Documentation Complète

### 📖 Guides Détaillés
- **[📋 Documentation Technique](./DOCUMENTATION.md)** - Architecture, modèles, sécurité
- **[🚀 Guide API](./API_GUIDE.md)** - Endpoints, exemples, intégration
- **[🐳 Guide Déploiement](./DEPLOYMENT_GUIDE.md)** - Docker, VPS, Fly.io

### 🔧 Ressources Développeur
- **Prisma Studio** : `npx prisma studio`
- **Logs** : `./logs/` (Winston)
- **Uploads** : `./src/uploads/`
- **Tests** : Collection Postman disponible

### 🆘 Support & Contribution
- **Issues** : GitHub Issues
- **Discussions** : GitHub Discussions  
- **Wiki** : Documentation collaborative
- **Changelog** : Voir `CHANGELOG.md`

---

## 🏆 Fonctionnalités Avancées

### 🔒 Sécurité
- ✅ Validation stricte des données (Zod)
- ✅ Protection CSRF et XSS
- ✅ Rate limiting par IP
- ✅ Audit trail complet
- ✅ Chiffrement des mots de passe (bcrypt)

### 📊 Performance  
- ✅ Pagination automatique
- ✅ Index de base de données optimisés
- ✅ Compression des réponses
- ✅ Cache des requêtes fréquentes

### 🌐 Intégration
- ✅ API RESTful standard
- ✅ Documentation OpenAPI 3.0
- ✅ CORS configurable
- ✅ Webhooks (à venir)

### 📱 Mobile Ready
- ✅ Réponses JSON optimisées
- ✅ Upload d'images
- ✅ QR codes pour mobile
- ✅ API offline-first compatible

---

## 📄 Licence

MIT License - Voir `LICENSE` pour plus de détails.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez `CONTRIBUTING.md` pour les guidelines.

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

**Développé avec ❤️ pour simplifier la gestion des visites d'entreprise**
