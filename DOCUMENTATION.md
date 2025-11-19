# 📚 Documentation Backend Sonaby

## 🎯 Vue d'ensemble

**Backend Sonaby** est une API REST complète pour la gestion des visites multi-sites d'entreprise. Elle permet de gérer les visiteurs, les rendez-vous, les contrôles d'accès, les incidents et les alertes SOS.

## 🏗️ Architecture

### Stack Technique
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de données**: MySQL
- **ORM**: Prisma
- **Authentification**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI 3.0
- **Validation**: Zod
- **Logging**: Winston
- **Sécurité**: Helmet, CORS, Rate Limiting

### Structure du Projet
```
backend-sonaby/
├── prisma/                    # Configuration Prisma
│   ├── schema.prisma         # Schéma de base de données
│   ├── seed.js              # Script de données initiales
│   └── migrations/          # Migrations de base de données
├── src/
│   ├── config/              # Configuration de l'application
│   ├── docs/                # Documentation Swagger
│   ├── middleware/          # Middlewares Express
│   ├── modules/             # Modules métier
│   │   ├── auth/           # Authentification
│   │   ├── user/           # Gestion des utilisateurs
│   │   ├── site/           # Gestion des sites
│   │   ├── checkpoint/     # Gestion des points de contrôle
│   │   ├── visitor/        # Gestion des visiteurs
│   │   ├── visit/          # Gestion des visites
│   │   ├── appointment/    # Gestion des rendez-vous
│   │   ├── service/        # Gestion des services
│   │   ├── incident/       # Gestion des incidents
│   │   ├── sos/           # Gestion des alertes SOS
│   │   └── ...
│   ├── routes/             # Routes principales
│   ├── utils/              # Utilitaires
│   └── server.js           # Point d'entrée de l'application
├── package.json
├── Dockerfile
└── README.md
```

## 🗄️ Modèle de Données

### Entités Principales

#### 👤 Users (Utilisateurs)
- **Rôles**: ADMIN, AGENT_GESTION, AGENT_CONTROLE, CHEF_SERVICE
- **Authentification**: JWT avec refresh tokens
- **Champs**: email, mot de passe, nom, prénom, rôle, statut actif

#### 🏢 Sites
- **Description**: Sites physiques de l'entreprise
- **Champs**: nom, adresse, téléphone, statut actif

#### 📍 Checkpoints
- **Description**: Points de contrôle/tablettes sur les sites
- **Champs**: nom, code SOS, description localisation, site associé

#### 👥 Visitors (Visiteurs)
- **Description**: Personnes externes visitant l'entreprise
- **Champs**: nom, prénom, type/numéro ID, entreprise, statut liste noire
- **Types ID**: CNI, Passeport, Permis de conduire, Carte de séjour, Autre

#### 🚪 Visits (Visites)
- **Description**: Visites réelles des visiteurs
- **Statuts**: active, finished, refused
- **Champs**: heure d'entrée/sortie, motif, signature, notes

#### 📅 Rendezvous (Rendez-vous)
- **Description**: Pré-enregistrements de visites
- **Statuts**: pending, validated, cancelled
- **Champs**: date/heure, QR code, organisateur, service visité

#### 🏢 Services
- **Description**: Départements/services visitables
- **Champs**: nom, description, chef de service

#### ⚠️ Incidents
- **Description**: Déclarations d'incidents lors des visites
- **Champs**: titre, description, niveau de sévérité, résolution

#### 🆘 SOS Alerts
- **Description**: Alertes d'urgence depuis les checkpoints
- **Champs**: message, statut résolu, notes de résolution

### Relations Clés
- Un site peut avoir plusieurs checkpoints
- Un utilisateur peut être assigné à plusieurs checkpoints
- Un visiteur peut avoir plusieurs visites
- Une visite peut être liée à un rendez-vous planifié
- Les incidents sont liés aux visites
- Les alertes SOS sont liées aux checkpoints

## 🔐 Authentification & Autorisation

### Système JWT
- **Access Token**: Durée de vie courte (15 minutes)
- **Refresh Token**: Durée de vie longue (7 jours)
- **Rotation**: Les refresh tokens sont renouvelés à chaque utilisation

### Rôles et Permissions
- **ADMIN**: Accès complet à toutes les fonctionnalités
- **AGENT_GESTION**: Gestion des visiteurs, rendez-vous, rapports
- **AGENT_CONTROLE**: Contrôle des entrées/sorties, incidents
- **CHEF_SERVICE**: Gestion de son service, validation rendez-vous

## 🛠️ API Endpoints

### 🔑 Authentification (`/api/v1/auth`)
- `POST /register` - Inscription d'un nouvel utilisateur
- `POST /login` - Connexion utilisateur
- `POST /refresh` - Renouvellement du token
- `POST /logout` - Déconnexion
- `GET /profile` - Profil utilisateur connecté

### 👤 Utilisateurs (`/api/v1/users`)
- `GET /` - Liste des utilisateurs (paginée)
- `POST /` - Création d'un utilisateur
- `GET /:id` - Détails d'un utilisateur
- `PUT /:id` - Modification d'un utilisateur
- `DELETE /:id` - Suppression d'un utilisateur
- `PUT /:id/password` - Changement de mot de passe

### 🏢 Sites (`/api/v1/sites`)
- `GET /` - Liste des sites
- `POST /` - Création d'un site
- `GET /:id` - Détails d'un site
- `PUT /:id` - Modification d'un site
- `DELETE /:id` - Suppression d'un site

### 📍 Checkpoints (`/api/v1/checkpoints`)
- `GET /` - Liste des checkpoints
- `POST /` - Création d'un checkpoint
- `GET /:id` - Détails d'un checkpoint
- `PUT /:id` - Modification d'un checkpoint
- `DELETE /:id` - Suppression d'un checkpoint

### 👥 Visiteurs (`/api/v1/visitors`)
- `GET /` - Liste des visiteurs (avec filtres)
- `POST /` - Création d'un visiteur
- `GET /:id` - Détails d'un visiteur
- `PUT /:id` - Modification d'un visiteur
- `DELETE /:id` - Suppression d'un visiteur
- `POST /:id/blacklist` - Ajout/retrait liste noire

### 🚪 Visites (`/api/v1/visits`)
- `GET /` - Liste des visites (avec filtres)
- `POST /` - Création d'une visite (check-in)
- `GET /:id` - Détails d'une visite
- `PUT /:id` - Modification d'une visite
- `POST /:id/checkout` - Fin de visite (check-out)

### 📅 Rendez-vous (`/api/v1/appointments`)
- `GET /` - Liste des rendez-vous
- `POST /` - Création d'un rendez-vous
- `GET /:id` - Détails d'un rendez-vous
- `PUT /:id` - Modification d'un rendez-vous
- `POST /:id/validate` - Validation d'un rendez-vous
- `POST /:id/cancel` - Annulation d'un rendez-vous

### 🏢 Services (`/api/v1/services`)
- `GET /` - Liste des services
- `POST /` - Création d'un service
- `GET /:id` - Détails d'un service
- `PUT /:id` - Modification d'un service
- `DELETE /:id` - Suppression d'un service

### ⚠️ Incidents (`/api/v1/incidents`)
- `GET /` - Liste des incidents
- `POST /` - Déclaration d'un incident
- `GET /:id` - Détails d'un incident
- `POST /:id/resolve` - Résolution d'un incident

### 🆘 Alertes SOS (`/api/v1/sos`)
- `GET /` - Liste des alertes SOS
- `POST /` - Déclenchement d'une alerte SOS
- `GET /:id` - Détails d'une alerte
- `POST /:id/resolve` - Résolution d'une alerte

## 🚀 Installation et Configuration

### Prérequis
- Node.js (v18+)
- MySQL (v8.0+)
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd backend-sonaby

# Installer les dépendances
npm install

# Configuration de l'environnement
cp .env.example .env
# Éditer le fichier .env avec vos paramètres
```

### Configuration Base de Données
```bash
# Générer le client Prisma
npx prisma generate

# Synchroniser le schéma avec la base de données
npx prisma db push

# Insérer les données initiales
npm run prisma:seed
```

### Variables d'Environnement
```env
# Base de données
DATABASE_URL="mysql://username:password@localhost:3306/sonaby"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Application
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

## 🏃‍♂️ Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

### Scripts Disponibles
- `npm run dev` - Démarrage en mode développement avec nodemon
- `npm start` - Démarrage en mode production
- `npm run prisma:generate` - Génération du client Prisma
- `npm run prisma:migrate` - Exécution des migrations
- `npm run prisma:seed` - Insertion des données initiales
- `npm run prisma:studio` - Interface graphique Prisma Studio

## 📖 Documentation API

### Swagger UI
Une fois l'application démarrée, la documentation interactive est disponible à :
- **URL**: `http://localhost:3000/api-docs`
- **Format**: OpenAPI 3.0
- **Fonctionnalités**: Test des endpoints, schémas de données, exemples

### Authentification dans Swagger
1. Utiliser l'endpoint `/api/v1/auth/login` pour obtenir un token
2. Cliquer sur "Authorize" dans Swagger UI
3. Entrer le token au format: `Bearer <votre-token>`

## 🔒 Sécurité

### Mesures Implémentées
- **Helmet**: Protection contre les vulnérabilités web communes
- **CORS**: Configuration des origines autorisées
- **Rate Limiting**: Limitation du nombre de requêtes par IP
- **JWT**: Authentification stateless sécurisée
- **Validation**: Validation stricte des données avec Zod
- **Hachage**: Mots de passe hachés avec bcrypt

### Bonnes Pratiques
- Tokens JWT avec expiration courte
- Refresh tokens avec rotation
- Validation côté serveur pour toutes les entrées
- Logs détaillés pour audit de sécurité
- Variables d'environnement pour les secrets

## 📊 Logging et Monitoring

### Winston Logger
- **Niveaux**: error, warn, info, debug
- **Formats**: JSON en production, coloré en développement
- **Rotation**: Fichiers de logs avec rotation quotidienne
- **Destinations**: Console + fichiers

### Logs d'Audit
- Toutes les actions utilisateur sont loggées
- Traçabilité complète pour conformité RGPD
- Stockage dans la table `audit_logs`

## 🐳 Déploiement

### Docker
```bash
# Construction de l'image
docker build -t backend-sonaby .

# Exécution du conteneur
docker run -p 3000:3000 --env-file .env backend-sonaby
```

### Fly.io (Configuration incluse)
```bash
# Déploiement sur Fly.io
fly deploy
```

## 🧪 Tests

### Structure des Tests
```bash
# Exécution des tests (à implémenter)
npm test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

## 🔄 Workflow de Développement

### Git Flow
1. **Feature branches**: `feature/nom-de-la-fonctionnalite`
2. **Bug fixes**: `bugfix/description-du-bug`
3. **Releases**: `release/v1.0.0`

### Conventions de Commit
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, style
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

## 📈 Performance

### Optimisations
- **Pagination**: Toutes les listes sont paginées
- **Index DB**: Index optimisés sur les colonnes de recherche
- **Cache**: Mise en cache des données fréquemment utilisées
- **Compression**: Compression gzip des réponses

### Monitoring
- Temps de réponse des endpoints
- Utilisation mémoire et CPU
- Métriques de base de données
- Logs d'erreurs centralisés

## 🤝 Contribution

### Guidelines
1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

### Standards de Code
- ESLint pour la qualité du code
- Prettier pour le formatage
- JSDoc pour la documentation
- Tests unitaires obligatoires

## 📞 Support

### Contacts
- **Développeur Principal**: [Votre nom]
- **Email**: [votre.email@entreprise.com]
- **Documentation**: `/api-docs`
- **Issues**: GitHub Issues

### Ressources
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [OpenAPI Specification](https://swagger.io/specification/)

---

## 📝 Changelog

### v1.0.0 (2024-11-19)
- ✅ Architecture initiale avec Express + Prisma + MySQL
- ✅ Authentification JWT complète
- ✅ Gestion des utilisateurs et rôles
- ✅ Gestion des sites et checkpoints
- ✅ Gestion des visiteurs et visites
- ✅ Système de rendez-vous avec QR codes
- ✅ Gestion des incidents et alertes SOS
- ✅ Documentation Swagger complète
- ✅ Sécurité et validation des données
- ✅ Logging et audit trail
- ✅ Configuration Docker et Fly.io

---

*Cette documentation est maintenue à jour avec chaque version du projet. Pour des questions spécifiques, consultez la documentation Swagger ou contactez l'équipe de développement.*
