# 📁 Structure du Projet Backend Sonaby

## 🌳 Arborescence Complète

```
backend-sonaby/
│
├── 📄 package.json                 # Dépendances et scripts npm
├── 📄 package-lock.json            # Verrouillage des versions
├── 📄 .env                         # Variables d'environnement (non versionné)
├── 📄 .env.example                 # Template des variables d'environnement
├── 📄 .gitignore                   # Fichiers ignorés par Git
├── 📄 .dockerignore                # Fichiers ignorés par Docker
│
├── 📄 Dockerfile                   # Configuration Docker
├── 📄 fly.toml                     # Configuration Fly.io
│
├── 📚 README.md                    # Documentation principale
├── 📚 README_NEW.md                # Nouvelle documentation
├── 📚 DOCUMENTATION.md             # Documentation technique
├── 📚 API_GUIDE.md                 # Guide d'utilisation API
├── 📚 DEPLOYMENT_GUIDE.md          # Guide de déploiement
├── 📚 structure_du_projet.md       # Ce fichier
│
├── 🗄️ prisma/                      # Configuration Prisma ORM
│   ├── schema.prisma               # Schéma de base de données
│   ├── seed.js                     # Script de données initiales
│   └── migrations/                 # Migrations (si utilisées)
│
├── 📂 src/                         # Code source de l'application
│   │
│   ├── 🚀 server.js                # Point d'entrée principal de l'application
│   │
│   ├── ⚙️ config/                  # Configuration de l'application
│   │   ├── appConfig.js            # Configuration générale (port, env, etc.)
│   │   ├── prisma.js               # Instance du client Prisma
│   │   └── multer.js               # Configuration upload de fichiers
│   │
│   ├── 🛡️ middleware/              # Middlewares Express
│   │   ├── authMiddleware.js       # Vérification JWT et authentification
│   │   ├── errorHandler.js         # Gestion centralisée des erreurs
│   │   ├── asyncHandler.js         # Wrapper pour fonctions async
│   │   └── requestLogger.js        # Logging des requêtes HTTP
│   │
│   ├── 🔧 utils/                   # Utilitaires et helpers
│   │   ├── logger.js               # Configuration Winston (logs)
│   │   └── helpers.js              # Fonctions utilitaires diverses
│   │
│   ├── 📖 docs/                    # Documentation API
│   │   └── swagger.js              # Configuration Swagger/OpenAPI
│   │
│   ├── 📦 modules/                 # Modules métier (architecture modulaire)
│   │   │
│   │   ├── 🔐 auth/                # Module d'authentification
│   │   │   ├── auth.schema.js      # Schémas de validation Zod
│   │   │   ├── auth.service.js     # Logique métier (login, register, etc.)
│   │   │   ├── auth.controller.js  # Contrôleurs (gestion requêtes/réponses)
│   │   │   └── auth.routes.js      # Définition des routes
│   │   │
│   │   ├── 👤 user/                # Module gestion utilisateurs
│   │   │   ├── user.schema.js      # Validation des données utilisateur
│   │   │   ├── user.service.js     # CRUD utilisateurs, gestion rôles
│   │   │   ├── user.controller.js  # Contrôleurs utilisateurs
│   │   │   └── user.routes.js      # Routes /api/v1/users
│   │   │
│   │   ├── 🏢 site/                # Module gestion des sites
│   │   │   ├── site.schema.js      # Validation sites
│   │   │   ├── site.service.js     # CRUD sites d'entreprise
│   │   │   ├── site.controller.js  # Contrôleurs sites
│   │   │   └── site.routes.js      # Routes /api/v1/sites
│   │   │
│   │   ├── 📍 checkpoint/          # Module gestion checkpoints
│   │   │   ├── checkpoint.schema.js    # Validation checkpoints
│   │   │   ├── checkpoint.service.js   # CRUD points de contrôle
│   │   │   ├── checkpoint.controller.js # Contrôleurs checkpoints
│   │   │   └── checkpoint.routes.js    # Routes /api/v1/checkpoints
│   │   │
│   │   ├── 👥 visitor/             # Module gestion visiteurs
│   │   │   ├── visitor.schema.js   # Validation visiteurs
│   │   │   ├── visitor.service.js  # CRUD visiteurs, recherche
│   │   │   ├── visitor.controller.js # Contrôleurs visiteurs
│   │   │   └── visitor.routes.js   # Routes /api/v1/visitors
│   │   │
│   │   ├── 🚪 visit/               # Module gestion des visites
│   │   │   ├── visit.schema.js     # Validation visites
│   │   │   ├── visit.service.js    # Check-in/out, historique
│   │   │   ├── visit.controller.js # Contrôleurs visites
│   │   │   └── visit.routes.js     # Routes /api/v1/visits
│   │   │
│   │   ├── 📅 appointment/         # Module gestion rendez-vous
│   │   │   ├── appointment.schema.js    # Validation RDV
│   │   │   ├── appointment.service.js   # CRUD RDV, QR codes
│   │   │   ├── appointment.controller.js # Contrôleurs RDV
│   │   │   └── appointment.routes.js    # Routes /api/v1/appointments
│   │   │
│   │   ├── 🏢 service/             # Module gestion services/départements
│   │   │   ├── service.schema.js   # Validation services
│   │   │   ├── service.service.js  # CRUD services
│   │   │   ├── service.controller.js # Contrôleurs services
│   │   │   └── service.routes.js   # Routes /api/v1/services
│   │   │
│   │   ├── ⚠️ incident/            # Module gestion incidents
│   │   │   ├── incident.schema.js  # Validation incidents
│   │   │   ├── incident.service.js # Déclaration, résolution
│   │   │   ├── incident.controller.js # Contrôleurs incidents
│   │   │   └── incident.routes.js  # Routes /api/v1/incidents
│   │   │
│   │   ├── 🆘 sos/                 # Module alertes SOS
│   │   │   ├── sos.schema.js       # Validation alertes
│   │   │   ├── sos.service.js      # Déclenchement, résolution
│   │   │   ├── sos.controller.js   # Contrôleurs SOS
│   │   │   └── sos.routes.js       # Routes /api/v1/sos
│   │   │
│   │   ├── 👮 agent/               # Module assignation agents
│   │   │   ├── agent.schema.js     # Validation assignations
│   │   │   ├── agent.service.js    # Assignation agents/checkpoints
│   │   │   ├── agent.controller.js # Contrôleurs agents
│   │   │   └── agent.routes.js     # Routes /api/v1/agents
│   │   │
│   │   ├── 🚫 nondesirable/        # Module liste noire
│   │   │   ├── nondesirable.schema.js   # Validation liste noire
│   │   │   ├── nondesirable.service.js  # Gestion blacklist
│   │   │   ├── nondesirable.controller.js # Contrôleurs blacklist
│   │   │   └── nondesirable.routes.js   # Routes liste noire
│   │   │
│   │   └── 📎 file/                # Module upload fichiers
│   │       ├── file.schema.js      # Validation uploads
│   │       ├── file.service.js     # Gestion fichiers
│   │       ├── file.controller.js  # Contrôleurs upload
│   │       └── file.routes.js      # Routes /api/v1/files
│   │
│   ├── 🛣️ routes/                  # Routes principales
│   │   └── index.js                # Agrégation de toutes les routes
│   │
│   └── 📤 uploads/                 # Fichiers uploadés (non versionné)
│       ├── ids/                    # Scans pièces d'identité
│       ├── photos/                 # Photos visiteurs
│       └── signatures/             # Signatures numériques
│
├── 📋 logs/                        # Logs de l'application (non versionné)
│   ├── error.log                   # Logs d'erreurs
│   ├── combined.log                # Tous les logs
│   └── access.log                  # Logs d'accès HTTP
│
└── 🗃️ node_modules/                # Dépendances npm (non versionné)
```

## 📊 Description des Composants

### 🚀 Point d'Entrée (`server.js`)
- Initialisation de l'application Express
- Configuration des middlewares globaux
- Montage des routes
- Démarrage du serveur HTTP
- Gestion de la connexion à la base de données

### ⚙️ Configuration (`config/`)
- **appConfig.js**: Variables d'environnement, configuration générale
- **prisma.js**: Instance singleton du client Prisma
- **multer.js**: Configuration pour l'upload de fichiers (taille max, types acceptés)

### 🛡️ Middlewares (`middleware/`)
- **authMiddleware.js**: Vérification des tokens JWT, extraction de l'utilisateur
- **errorHandler.js**: Gestion centralisée des erreurs avec codes HTTP appropriés
- **asyncHandler.js**: Wrapper pour éviter les try/catch répétitifs
- **requestLogger.js**: Logging de toutes les requêtes HTTP avec Winston

### 🔧 Utilitaires (`utils/`)
- **logger.js**: Configuration Winston (niveaux, formats, transports)
- Fonctions helpers réutilisables dans toute l'application

### 📖 Documentation (`docs/`)
- **swagger.js**: Configuration Swagger/OpenAPI pour documentation interactive
- Définition des schémas, endpoints, exemples

### 📦 Modules Métier (`modules/`)

Chaque module suit la même structure (pattern MVC + Services):

#### Structure d'un module
```
module/
├── *.schema.js      # Schémas de validation Zod
├── *.service.js     # Logique métier (business logic)
├── *.controller.js  # Contrôleurs (orchestration)
└── *.routes.js      # Définition des routes Express
```

#### Responsabilités par couche

**Schemas (*.schema.js)**
- Validation des données entrantes avec Zod
- Définition des types et contraintes
- Messages d'erreur personnalisés

**Services (*.service.js)**
- Logique métier pure
- Interactions avec la base de données (Prisma)
- Transformations de données
- Règles de gestion

**Controllers (*.controller.js)**
- Réception des requêtes HTTP
- Validation avec les schémas
- Appel des services
- Formatage des réponses
- Gestion des codes HTTP

**Routes (*.routes.js)**
- Définition des endpoints
- Association verbes HTTP → contrôleurs
- Application des middlewares (auth, validation)
- Documentation Swagger inline

## 🗂️ Modules Disponibles

| Module | Route | Description |
|--------|-------|-------------|
| 🔐 **auth** | `/api/v1/auth` | Authentification (login, register, refresh) |
| 👤 **user** | `/api/v1/users` | Gestion des utilisateurs et rôles |
| 🏢 **site** | `/api/v1/sites` | Gestion des sites d'entreprise |
| 📍 **checkpoint** | `/api/v1/checkpoints` | Gestion des points de contrôle |
| 👥 **visitor** | `/api/v1/visitors` | Gestion des visiteurs |
| 🚪 **visit** | `/api/v1/visits` | Gestion des visites (check-in/out) |
| 📅 **appointment** | `/api/v1/appointments` | Gestion des rendez-vous |
| 🏢 **service** | `/api/v1/services` | Gestion des services/départements |
| ⚠️ **incident** | `/api/v1/incidents` | Déclaration et suivi d'incidents |
| 🆘 **sos** | `/api/v1/sos` | Alertes SOS d'urgence |
| 👮 **agent** | `/api/v1/agents` | Assignation agents aux checkpoints |
| 🚫 **nondesirable** | `/api/v1/nondesirable` | Gestion liste noire |
| 📎 **file** | `/api/v1/files` | Upload de fichiers |

## 🔄 Flux de Requête

```
Client HTTP Request
       ↓
[Nginx] (Production)
       ↓
[Express Server] (server.js)
       ↓
[Global Middlewares]
  • Helmet (Security)
  • CORS
  • Body Parser
  • Request Logger
       ↓
[Routes] (routes/index.js)
       ↓
[Module Routes] (module/*.routes.js)
       ↓
[Auth Middleware] (si protégé)
       ↓
[Controller] (module/*.controller.js)
  • Validation (Zod schema)
  • Extraction des paramètres
       ↓
[Service] (module/*.service.js)
  • Logique métier
  • Accès base de données (Prisma)
       ↓
[Prisma ORM]
       ↓
[MySQL Database]
       ↓
[Response] ← Format JSON standardisé
       ↓
Client
```

## 📝 Conventions de Nommage

### Fichiers
- **Modules**: `nomModule.type.js` (ex: `user.service.js`)
- **Configuration**: `camelCase.js` (ex: `appConfig.js`)
- **Middleware**: `camelCase.js` (ex: `authMiddleware.js`)

### Fonctions
- **Services**: verbes d'action (ex: `createUser`, `getUserById`)
- **Controllers**: nom de l'action (ex: `register`, `login`, `getAll`)
- **Routes**: verbes HTTP + path (ex: `router.post('/login', ...)`)

### Variables
- **camelCase** pour les variables et fonctions
- **PascalCase** pour les classes et modèles Prisma
- **UPPER_SNAKE_CASE** pour les constantes

## 🔒 Sécurité

### Fichiers Sensibles (non versionnés)
- `.env` - Variables d'environnement
- `node_modules/` - Dépendances
- `logs/` - Fichiers de logs
- `src/uploads/` - Fichiers uploadés
- `*.log` - Tous les fichiers de logs

### Fichiers de Configuration
- `.env.example` - Template des variables (versionné)
- `.gitignore` - Exclusions Git
- `.dockerignore` - Exclusions Docker

## 📚 Documentation Associée

- **README.md**: Vue d'ensemble et démarrage rapide
- **DOCUMENTATION.md**: Documentation technique complète
- **API_GUIDE.md**: Guide d'utilisation de l'API
- **DEPLOYMENT_GUIDE.md**: Guide de déploiement
- **prisma/schema.prisma**: Schéma de base de données commenté

---

**Note**: Cette structure suit les meilleures pratiques Node.js/Express avec une architecture modulaire, scalable et maintenable.