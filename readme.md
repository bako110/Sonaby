# 🚀 Sonabhy ES Back - Documentation Complète

> **API REST complète pour la gestion des visites multi-sites d'entreprise**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-purple.svg)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-red.svg)](https://jwt.io/)

## 📋 Table des Matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [✨ Fonctionnalités Principales](#-fonctionnalités-principales)
- [🏗️ Architecture Technique](#️-architecture-technique)
- [📦 Technologies & Dépendances](#-technologies--dépendances)
- [🗄️ Modèle de Données](#️-modèle-de-données)
- [🚀 Installation & Configuration](#-installation--configuration)
- [🏃‍♂️ Démarrage](#️-démarrage)
- [📖 API Endpoints](#-api-endpoints)
- [🔐 Authentification & Sécurité](#-authentification--sécurité)
- [📁 Structure du Projet](#-structure-du-projet)
- [🛠️ Scripts & Commandes](#️-scripts--commandes)
- [🐳 Déploiement](#-déploiement)
- [🧪 Tests & Validation](#-tests--validation)
- [📊 Monitoring & Logs](#-monitoring--logs)
- [🤝 Contribution](#-contribution)
- [📚 Ressources Additionnelles](#-ressources-additionnelles)

## 🎯 Vue d'ensemble

**Sonabhy ES Back** est une API REST moderne et sécurisée conçue pour gérer les systèmes de visites d'entreprise multi-sites. Elle offre une solution complète pour :

- 👥 **Gestion des visiteurs** et contrôle d'accès
- 📅 **Planification de rendez-vous** avec QR codes
- 🏢 **Administration multi-sites** et checkpoints
- ⚠️ **Gestion des incidents** et alertes SOS
- 📊 **Traçabilité complète** et audit trail
- 🔒 **Sécurité avancée** avec authentification JWT

## ✨ Fonctionnalités Principales

### 🔐 Authentification & Autorisation
- **JWT Double Token**: Access token (15 min) + Refresh token (7 jours)
- **Rotation des tokens**: Renouvellement automatique sécurisé
- **Système de rôles**: ADMIN, AGENT_GESTION, AGENT_CONTROLE, CHEF_SERVICE
- **Permissions granulaires**: Contrôle d'accès basé sur les rôles (RBAC)
- **Sessions sécurisées**: Gestion des refresh tokens en base de données
- **Déconnexion globale**: Invalidation de tous les tokens utilisateur

### 👥 Gestion des Utilisateurs
- **CRUD complet**: Création, lecture, modification, suppression
- **Gestion des rôles**: Attribution et modification des permissions
- **Profils personnalisables**: Informations détaillées (nom, email, téléphone)
- **Activation/Désactivation**: Contrôle du statut actif des comptes
- **Changement de mot de passe**: Avec validation sécurisée
- **Recherche et filtrage**: Par nom, email, rôle, statut
- **Pagination**: Liste paginée pour performances optimales

### 🏢 Gestion Multi-Sites
- **Sites multiples**: Support de plusieurs sites d'entreprise
- **Informations complètes**: Nom, adresse, téléphone, statut
- **Checkpoints associés**: Points de contrôle par site
- **Activation/Désactivation**: Gestion du statut des sites
- **Recherche**: Filtrage par nom et statut

### 📍 Gestion des Checkpoints
- **Points de contrôle**: Tablettes/postes de sécurité
- **Code SOS unique**: Identification pour alertes d'urgence
- **Localisation**: Description détaillée de l'emplacement
- **Assignation d'agents**: Affectation des agents de contrôle
- **Historique**: Suivi des assignations avec dates
- **Statut actif**: Activation/désactivation des checkpoints

### 👤 Gestion des Visiteurs
- **Enregistrement complet**: Nom, prénom, contact, entreprise
- **Validation d'identité**: Type et numéro de pièce d'identité
- **Types ID supportés**: CNI, Passeport, Permis, Carte de séjour, Autre
- **Upload de documents**: Scan de pièce d'identité et photo
- **Liste noire/blanche**: Gestion des visiteurs indésirables
- **Historique des actions**: Traçabilité des ajouts/retraits de liste noire
- **Recherche avancée**: Par nom, entreprise, numéro ID, statut
- **Unicité garantie**: Vérification type ID + numéro unique

### 📅 Rendez-vous & Planification
- **Pré-enregistrement**: Création de rendez-vous planifiés
- **QR Code unique**: Génération automatique pour chaque RDV
- **Validation hiérarchique**: Approbation par chef de service
- **Statuts multiples**: pending, validated, cancelled
- **Informations détaillées**: Date, heure début/fin, motif, notes
- **Visiteur ou groupe**: Support des visites individuelles et groupées
- **Service visité**: Association au département concerné
- **Organisateur**: Traçabilité de qui crée le rendez-vous

### 🚪 Contrôle d'Accès & Visites
- **Check-in**: Enregistrement de l'entrée du visiteur
- **Check-out**: Enregistrement de la sortie
- **Temps réel**: Suivi des visites actives en cours
- **Signature numérique**: Capture de signature à l'entrée/sortie
- **Lien avec RDV**: Association automatique si rendez-vous planifié
- **Visites de groupe**: Support des groupes avec code unique
- **Statuts**: active, finished, refused
- **Notes**: Commentaires et observations
- **Historique complet**: Toutes les visites archivées

### 🏢 Gestion des Services
- **Départements**: Services visitables de l'entreprise
- **Chef de service**: Assignation d'un responsable
- **Description**: Informations détaillées sur le service
- **Activation**: Contrôle du statut actif
- **Rendez-vous associés**: Lien avec les RDV du service

### ⚠️ Gestion des Incidents
- **Déclaration**: Signalement d'incidents lors des visites
- **Niveaux de sévérité**: Classification 1-5
- **Titre et description**: Détails complets de l'incident
- **Résolution**: Suivi et clôture avec notes
- **Traçabilité**: Qui a déclaré, quand, résolu par qui
- **Lien avec visite**: Association à la visite concernée

### 🆘 Alertes SOS
- **Déclenchement rapide**: Alerte d'urgence depuis checkpoint
- **Code SOS**: Identification du point d'alerte
- **Message**: Description de la situation
- **Résolution**: Suivi et clôture de l'alerte
- **Horodatage**: Date/heure de déclenchement et résolution
- **Responsables**: Qui a déclenché, qui a résolu

### 📊 Audit & Traçabilité
- **Audit Log complet**: Toutes les actions utilisateur
- **Conformité RGPD**: Traçabilité des données personnelles
- **Historique des modifications**: Anciennes et nouvelles valeurs
- **Informations réseau**: IP, User-Agent
- **Recherche**: Filtrage par utilisateur, entité, date

### 📈 Reporting & Analytics
- **Rapports de visite**: Statistiques détaillées
- **Filtres avancés**: Par date, site, checkpoint, visiteur
- **Export de données**: Format JSON pour intégration
- **Statistiques temps réel**: Visites actives, total par période

## 🏗️ Architecture Technique

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS                       │
│  (Web Frontend, Mobile Apps, Third-party Integrations)          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                    │
│  - SSL/TLS Termination  - Load Balancing  - Static Files        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS API SERVER                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARE LAYER                       │  │
│  │  • Helmet (Security Headers)                             │  │
│  │  • CORS (Cross-Origin)                                   │  │
│  │  • Rate Limiting                                         │  │
│  │  • Request Logger (Winston)                             │  │
│  │  • JWT Authentication                                    │  │
│  │  • Error Handler                                         │  │
│  │  • Async Handler                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ROUTES LAYER                          │  │
│  │  /api/v1/auth      /api/v1/users      /api/v1/sites     │  │
│  │  /api/v1/visitors  /api/v1/visits     /api/v1/checkpoints│ │
│  │  /api/v1/appointments  /api/v1/services  /api/v1/sos    │  │
│  │  /api/v1/incidents  /api/v1/agents                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  CONTROLLERS LAYER                       │  │
│  │  • Request Validation (Zod)                             │  │
│  │  • Business Logic Orchestration                         │  │
│  │  • Response Formatting                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   SERVICES LAYER                         │  │
│  │  • Business Logic                                        │  │
│  │  • Data Processing                                       │  │
│  │  • External API Calls                                    │  │
│  │  • File Operations (Multer)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   PRISMA ORM LAYER                       │  │
│  │  • Query Builder                                         │  │
│  │  • Type Safety                                           │  │
│  │  • Migrations                                            │  │
│  │  • Connection Pooling                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MySQL DATABASE                            │
│  • Users & Roles          • Sites & Checkpoints                 │
│  • Visitors & Visits      • Appointments                        │
│  • Services               • Incidents & SOS Alerts              │
│  • Audit Logs             • Refresh Tokens                      │
│  • Blacklist History      • Visitor Groups                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
│  • File Storage (Local/S3)  • Logging (Winston)                │
│  • Swagger Documentation    • Health Checks                     │
└─────────────────────────────────────────────────────────────────┘
```

### Stack Technique Détaillé

#### Backend Framework
- **Node.js 18+**: Runtime JavaScript côté serveur
- **Express.js 4.18+**: Framework web minimaliste et flexible
- **Architecture modulaire**: Séparation claire des responsabilités

#### Base de Données
- **MySQL 8.0+**: Système de gestion de base de données relationnelle
- **Prisma ORM 5.0+**: ORM moderne avec type-safety
- **Migrations**: Gestion versionnée du schéma
- **Seeding**: Données initiales automatisées

#### Authentification & Sécurité
- **JWT (jsonwebtoken)**: Tokens d'authentification stateless
- **bcryptjs**: Hachage sécurisé des mots de passe
- **Helmet**: Protection contre vulnérabilités web courantes
- **CORS**: Gestion des origines cross-domain
- **express-rate-limit**: Protection contre attaques par force brute

#### Validation & Documentation
- **Zod**: Validation de schémas avec type inference
- **Swagger/OpenAPI 3.0**: Documentation API interactive
- **swagger-ui-express**: Interface Swagger intégrée
- **swagger-jsdoc**: Génération de documentation depuis JSDoc

#### Upload & Fichiers
- **Multer**: Gestion des uploads multipart/form-data
- **UUID**: Génération d'identifiants uniques
- **Stockage local**: Fichiers dans `/src/uploads/`

#### Logging & Monitoring
- **Winston**: Système de logging professionnel
- **Niveaux**: error, warn, info, debug
- **Rotation**: Logs quotidiens avec archivage
- **Formats**: JSON (production) / Coloré (développement)

#### Développement
- **nodemon**: Auto-reload en développement
- **dotenv**: Gestion des variables d'environnement
- **ESM**: Support des modules ES6

#### Déploiement
- **Docker**: Containerisation de l'application
- **Fly.io**: Plateforme de déploiement cloud
- **PM2**: Gestionnaire de processus Node.js
- **Nginx**: Reverse proxy et load balancer

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

### Installation rapide
```bash
# Cloner le projet
git clone <repository-url>
cd sonabhy-es-back

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

