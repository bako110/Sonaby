# 🚀 Guide d'Utilisation API Sonabhy ES Back

## 🎯 Guide Rapide

### Base URL
```
http://localhost:3000/api/v1
```

### Documentation Interactive
```
http://localhost:3000/api-docs
```

## 🔐 Authentification

### 1. Inscription d'un Utilisateur
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "AGENT_CONTROLE"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "AGENT_CONTROLE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. Connexion
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

### 3. Utilisation du Token
```http
GET /api/v1/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 4. Renouvellement du Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 🏢 Gestion des Sites

### Créer un Site
```http
POST /api/v1/sites
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Siège Social Paris",
  "address": "123 Avenue des Champs-Élysées, 75008 Paris",
  "phone": "+33 1 23 45 67 89"
}
```

### Lister les Sites
```http
GET /api/v1/sites?page=1&limit=10&search=Paris
Authorization: Bearer <token>
```

## 📍 Gestion des Checkpoints

### Créer un Checkpoint
```http
POST /api/v1/checkpoints
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteId": "site-uuid",
  "name": "Entrée Principale",
  "sosCode": "SOS-PARIS-001",
  "locationDescription": "Hall d'accueil principal"
}
```

## 👥 Gestion des Visiteurs

### Créer un Visiteur
```http
POST /api/v1/visitors
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Marie",
  "lastName": "Martin",
  "email": "marie.martin@example.com",
  "phone": "+33 6 12 34 56 78",
  "idType": "CNI",
  "idNumber": "123456789",
  "company": "Entreprise ABC"
}
```

### Rechercher des Visiteurs
```http
GET /api/v1/visitors?search=Martin&company=ABC&isBlacklisted=false
Authorization: Bearer <token>
```

### Mettre en Liste Noire
```http
POST /api/v1/visitors/{id}/blacklist
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "add",
  "reason": "Comportement inapproprié lors de la dernière visite"
}
```

## 🚪 Gestion des Visites

### Créer une Visite (Check-in)
```http
POST /api/v1/visits
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitorId": "visitor-uuid",
  "checkpointId": "checkpoint-uuid",
  "serviceId": "service-uuid",
  "reason": "Réunion avec l'équipe marketing",
  "plannedId": "rendezvous-uuid", // Optionnel
  "isGroup": false
}
```

### Terminer une Visite (Check-out)
```http
POST /api/v1/visits/{id}/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "endAt": "2024-11-19T17:30:00Z", // Optionnel, par défaut maintenant
  "notes": "Visite terminée sans incident"
}
```

### Lister les Visites Actives
```http
GET /api/v1/visits?status=active&checkpointId=checkpoint-uuid
Authorization: Bearer <token>
```

## 📅 Gestion des Rendez-vous

### Créer un Rendez-vous
```http
POST /api/v1/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitorId": "visitor-uuid",
  "serviceId": "service-uuid",
  "reason": "Présentation produit",
  "visitDate": "2024-11-20",
  "startTime": "14:00:00",
  "endTime": "15:30:00",
  "notes": "Salle de réunion A réservée"
}
```

### Valider un Rendez-vous
```http
POST /api/v1/appointments/{id}/validate
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Rendez-vous confirmé par le chef de service"
}
```

### Générer QR Code
Le QR code est généré automatiquement lors de la création et peut être récupéré :
```http
GET /api/v1/appointments/{id}
Authorization: Bearer <token>
```

## 🏢 Gestion des Services

### Créer un Service
```http
POST /api/v1/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Marketing",
  "description": "Service marketing et communication",
  "chefId": "user-uuid" // Optionnel
}
```

## ⚠️ Gestion des Incidents

### Déclarer un Incident
```http
POST /api/v1/incidents
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitId": "visit-uuid",
  "title": "Visiteur sans badge",
  "description": "Le visiteur a tenté d'accéder aux étages sans badge d'accompagnement",
  "severityLevel": 2
}
```

### Résoudre un Incident
```http
POST /api/v1/incidents/{id}/resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "resolutionNotes": "Badge temporaire fourni, visiteur accompagné par agent de sécurité"
}
```

## 🆘 Gestion des Alertes SOS

### Déclencher une Alerte SOS
```http
POST /api/v1/sos
Authorization: Bearer <token>
Content-Type: application/json

{
  "checkpointId": "checkpoint-uuid",
  "message": "Situation d'urgence à l'entrée principale"
}
```

### Résoudre une Alerte SOS
```http
POST /api/v1/sos/{id}/resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "resolutionNotes": "Fausse alerte - test du système"
}
```

## 📊 Filtres et Pagination

### Paramètres de Pagination
```http
GET /api/v1/visits?page=1&limit=20
```

### Filtres Avancés
```http
GET /api/v1/visits?visitorId=uuid&status=active&checkpointId=uuid&startDate=2024-11-01&endDate=2024-11-30
```

### Recherche Textuelle
```http
GET /api/v1/visitors?search=martin&company=ABC
```

## 🔍 Codes de Réponse

### Succès
- `200 OK` - Requête réussie
- `201 Created` - Ressource créée
- `204 No Content` - Suppression réussie

### Erreurs Client
- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Token manquant/invalide
- `403 Forbidden` - Permissions insuffisantes
- `404 Not Found` - Ressource non trouvée
- `409 Conflict` - Conflit (ex: email déjà utilisé)

### Erreurs Serveur
- `500 Internal Server Error` - Erreur serveur

## 📝 Format des Réponses

### Réponse de Succès
```json
{
  "success": true,
  "message": "Opération réussie",
  "data": {
    // Données de la réponse
  }
}
```

### Réponse Paginée
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### Réponse d'Erreur
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Les données fournies sont invalides",
  "details": {
    "email": "Format d'email invalide",
    "password": "Le mot de passe doit contenir au moins 8 caractères"
  }
}
```

## 🛠️ Exemples d'Intégration

### JavaScript/Fetch
```javascript
// Fonction utilitaire pour les appels API
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`http://localhost:3000/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Erreur API');
  }
  
  return data;
}

// Exemple d'utilisation
try {
  const visitors = await apiCall('/visitors?page=1&limit=10');
  console.log(visitors.data.items);
} catch (error) {
  console.error('Erreur:', error.message);
}
```

### cURL
```bash
# Connexion
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Utilisation avec token
curl -X GET http://localhost:3000/api/v1/visitors \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## 🔄 Workflow Typique

### 1. Enregistrement d'un Visiteur
```mermaid
sequenceDiagram
    Client->>API: POST /visitors (données visiteur)
    API->>DB: Vérification unicité ID
    API->>DB: Création visiteur
    API->>Client: Visiteur créé avec ID
```

### 2. Création et Validation de Rendez-vous
```mermaid
sequenceDiagram
    Client->>API: POST /appointments (détails RDV)
    API->>DB: Création RDV avec QR code
    API->>Client: RDV créé
    ChefService->>API: POST /appointments/{id}/validate
    API->>DB: Mise à jour statut
    API->>Client: RDV validé
```

### 3. Visite Complète
```mermaid
sequenceDiagram
    Agent->>API: POST /visits (check-in)
    API->>DB: Création visite active
    Note over Visiteur: Visite en cours
    Agent->>API: POST /visits/{id}/checkout
    API->>DB: Mise à jour heure sortie
    API->>Client: Visite terminée
```

## 🚨 Gestion des Erreurs

### Retry Logic
```javascript
async function apiCallWithRetry(endpoint, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall(endpoint, options);
    } catch (error) {
      if (error.status === 401 && i < maxRetries - 1) {
        // Token expiré, tentative de renouvellement
        await refreshToken();
        continue;
      }
      if (i === maxRetries - 1) throw error;
      
      // Attente exponentielle
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}
```

## 📱 Intégration Mobile

### Headers Recommandés
```http
User-Agent: SonabyMobile/1.0 (iOS 17.0)
X-Device-ID: unique-device-identifier
X-App-Version: 1.0.0
```

### Gestion Offline
- Stocker les données critiques localement
- Synchroniser lors de la reconnexion
- Gérer les conflits de données

---

*Ce guide couvre les principales fonctionnalités de l'API. Pour une documentation complète et interactive, consultez `/api-docs` une fois le serveur démarré.*
