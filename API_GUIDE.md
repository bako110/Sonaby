# 🚀 Guide Complet API Sonabhy ES Back

## 📋 Table des Matières

- [Introduction](#-introduction)
- [Authentification](#-authentification)
- [Auth - Authentification](#auth---authentification)
- [Users - Utilisateurs](#users---utilisateurs)
- [Sites - Sites d'entreprise](#sites---sites-dentreprise)
- [Checkpoints - Points de contrôle](#checkpoints---points-de-contrôle)
- [Visitors - Visiteurs](#visitors---visiteurs)
- [Visits - Visites](#visits---visites)
- [Appointments - Rendez-vous](#appointments---rendez-vous)
- [Services - Départements](#services---départements)
- [Incidents - Gestion incidents](#incidents---gestion-incidents)
- [SOS - Alertes d'urgence](#sos---alertes-durgence)
- [Agents - Assignation](#agents---assignation)
- [Non-Desirable - Liste noire](#non-desirable---liste-noire)
- [Files - Gestion fichiers](#files---gestion-fichiers)
- [Codes de Réponse](#-codes-de-réponse)
- [Exemples d'Intégration](#️-exemples-dintégration)

---

## 🎯 Introduction

**Sonabhy ES Back** est une API REST complète pour la gestion des visites multi-sites d'entreprise.

### Base URL
```
http://localhost:3000/api/v1
```

### Documentation Interactive Swagger
```
http://localhost:3000/api-docs
```

### Format des Réponses

**Succès:**
```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { }
}
```

**Succès avec pagination:**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

**Erreur:**
```json
{
  "success": false,
  "error": "Type d'erreur",
  "message": "Description",
  "details": { }
}
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) avec un système de double token :
- **Access Token** : Valide 15 minutes
- **Refresh Token** : Valide 7 jours

**Rôles disponibles:**
- `ADMIN` - Administrateur système (accès complet)
- `AGENT_GESTION` - Agent de gestion (gestion sites, checkpoints, visiteurs)
- `AGENT_CONTROLE` - Agent de contrôle (check-in/out, visites)
- `CHEF_SERVICE` - Chef de service (validation rendez-vous)

---

## Auth - Authentification

### 1. Inscription (Register)

```http
POST /api/v1/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "MotDePasse123!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "role": "AGENT_CONTROLE",
  "phone": "+33612345678"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "AGENT_CONTROLE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 2. Connexion (Login)

```http
POST /api/v1/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "MotDePasse123!"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "AGENT_CONTROLE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 3. Rafraîchir le Token

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

---

### 4. Déconnexion (Logout)

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### 5. Profil Utilisateur

```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "role": "AGENT_CONTROLE",
    "phone": "+33612345678",
    "isActive": true,
    "createdAt": "2024-11-20T10:00:00Z"
  }
}
```

---

## Users - Utilisateurs

### 1. Lister les Utilisateurs

```http
GET /api/v1/user?page=1&limit=10
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN, AGENT_GESTION, AGENT_CONTROLE, CHEF_SERVICE

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "AGENT_CONTROLE",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 2. Créer un Utilisateur

```http
POST /api/v1/user
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Permissions:** ADMIN

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "Marie",
  "lastName": "Martin",
  "role": "AGENT_CONTROLE",
  "phone": "+33698765432"
}
```

---

### 3. Récupérer un Utilisateur

```http
GET /api/v1/user/{id}
Authorization: Bearer <access_token>
```

---

### 4. Mettre à Jour un Utilisateur

```http
PATCH /api/v1/user/{id}
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Jean-Pierre",
  "phone": "+33611111111",
  "isActive": true
}
```

---

### 5. Supprimer un Utilisateur

```http
DELETE /api/v1/user/{id}
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN

---

## Sites - Sites d'entreprise

### 1. Lister les Sites

```http
GET /api/v1/sites?page=1&limit=10&search=paris
Authorization: Bearer <access_token>
```

**Paramètres:**
- `page` (integer): Numéro de page (défaut: 1)
- `limit` (integer): Éléments par page (défaut: 10)
- `search` (string): Recherche par nom ou localisation

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "site-uuid",
      "name": "Site Paris Nord",
      "location": "75018 Paris, France",
      "createdAt": "2024-11-01T08:00:00Z",
      "checkpoints": [
        {
          "id": "checkpoint-uuid",
          "name": "Entrée Principale"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### 2. Créer un Site

```http
POST /api/v1/sites
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Permissions:** ADMIN

**Body:**
```json
{
  "name": "Site Lyon Centre",
  "location": "69002 Lyon, France"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Site créé avec succès",
  "data": {
    "id": "new-site-uuid",
    "name": "Site Lyon Centre",
    "location": "69002 Lyon, France"
  }
}
```

---

### 3. Récupérer un Site

```http
GET /api/v1/sites/{id}
Authorization: Bearer <access_token>
```

---

### 4. Mettre à Jour un Site

```http
PUT /api/v1/sites/{id}
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Permissions:** ADMIN

**Body:**
```json
{
  "name": "Site Paris Nord - Nouveau Nom",
  "location": "75018 Paris, France"
}
```

---

### 5. Supprimer un Site

```http
DELETE /api/v1/sites/{id}
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN

---

### 6. Statistiques des Sites

```http
GET /api/v1/sites/stats
Authorization: Bearer <access_token>
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "totalSites": 5,
    "checkpointsPerSite": [
      {
        "siteName": "Site Paris Nord",
        "checkpointCount": 3
      }
    ]
  }
}
```

---

## Checkpoints - Points de contrôle

### 1. Lister les Checkpoints

```http
GET /api/v1/checkpoints?page=1&limit=10&siteId=site-uuid&search=entrée
Authorization: Bearer <access_token>
```

**Paramètres:**
- `page`, `limit`: Pagination
- `search`: Recherche par nom ou identifiant SOS
- `siteId`: Filtrer par site

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "checkpoint-uuid",
      "name": "Entrée Principale",
      "siteId": "site-uuid",
      "sosIdentifier": "SOS-001",
      "site": {
        "name": "Site Paris Nord"
      },
      "agents": [
        {
          "firstName": "Pierre",
          "lastName": "Durand"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

---

### 2. Créer un Checkpoint

```http
POST /api/v1/checkpoints
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Permissions:** ADMIN, AGENT_GESTION

**Body:**
```json
{
  "name": "Entrée Secondaire",
  "siteId": "site-uuid",
  "sosIdentifier": "SOS-002"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Checkpoint créé avec succès",
  "data": {
    "id": "new-checkpoint-uuid",
    "name": "Entrée Secondaire",
    "siteId": "site-uuid",
    "sosIdentifier": "SOS-002"
  }
}
```

---

### 3. Assigner un Agent

```http
POST /api/v1/checkpoints/{id}/assign-agent
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Permissions:** ADMIN, AGENT_GESTION

**Body:**
```json
{
  "agentId": "agent-uuid"
}
```

---

### 4. Envoyer une Alerte SOS

```http
POST /api/v1/checkpoints/{id}/sos
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body (optionnel):**
```json
{
  "message": "Situation d'urgence - Intervention requise"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Alerte SOS envoyée",
  "data": {
    "id": "sos-uuid",
    "checkpointId": "checkpoint-uuid",
    "message": "Situation d'urgence",
    "triggeredAt": "2024-11-20T15:30:00Z",
    "isActive": true
  }
}
```

---

### 5. Statistiques Checkpoints

```http
GET /api/v1/checkpoints/stats
Authorization: Bearer <access_token>
```

---

## Visitors - Visiteurs

### 1. Lister les Visiteurs

```http
GET /api/v1/visitors?page=1&limit=10&search=martin&company=TechCorp
Authorization: Bearer <access_token>
```

**Paramètres:**
- `search`: Recherche par nom, prénom, email ou téléphone
- `company`: Filtrer par entreprise

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "visitor-uuid",
      "firstname": "Sophie",
      "lastname": "Martin",
      "email": "sophie.martin@techcorp.com",
      "phone": "+33612345678",
      "company": "TechCorp",
      "fileId": "file-uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### 2. Créer un Visiteur

```http
POST /api/v1/visitors
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "firstname": "Thomas",
  "lastname": "Dubois",
  "email": "thomas.dubois@example.com",
  "phone": "+33698765432",
  "company": "ABC Industries",
  "fileId": "file-uuid"
}
```

---

### 3. Vérifier Liste Noire

```http
GET /api/v1/visitors/{id}/check-non-desirable
Authorization: Bearer <access_token>
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "visitor": {
      "id": "visitor-uuid",
      "firstname": "Thomas",
      "lastname": "Dubois"
    },
    "isNonDesirable": false,
    "nonDesirable": null
  }
}
```

---

### 4. Historique Visiteur

```http
GET /api/v1/visitors/{id}/history?days=30
Authorization: Bearer <access_token>
```

---

### 5. Statistiques Visiteurs

```http
GET /api/v1/visitors/stats
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN, AGENT_GESTION

---

## Visits - Visites

### 1. Lister les Visites

```http
GET /api/v1/visits?page=1&limit=10&status=active
Authorization: Bearer <access_token>
```

**Paramètres:**
- `status`: Filtrer par statut (active, finished)
- `visitorId`: Filtrer par visiteur
- `checkpointId`: Filtrer par checkpoint

---

### 2. Créer une Visite (Check-in)

```http
POST /api/v1/visits
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "visitorId": "visitor-uuid",
  "checkpointId": "checkpoint-uuid",
  "serviceId": "service-uuid",
  "reason": "Réunion avec le service RH"
}
```

---

### 3. Check-out

```http
PATCH /api/v1/visits/{id}/checkout
Authorization: Bearer <access_token>
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Check-out effectué",
  "data": {
    "id": "visit-uuid",
    "entryTime": "2024-11-20T10:00:00Z",
    "exitTime": "2024-11-20T16:30:00Z",
    "status": "finished"
  }
}
```

---

### 4. Visites Actives

```http
GET /api/v1/visits/active
Authorization: Bearer <access_token>
```

---

### 5. Statistiques Visites

```http
GET /api/v1/visits/stats
Authorization: Bearer <access_token>
```

---

## Appointments - Rendez-vous

### 1. Lister les Rendez-vous

```http
GET /api/v1/appointments?page=1&limit=10
Authorization: Bearer <access_token>
```

---

### 2. Créer un Rendez-vous

```http
POST /api/v1/appointments
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "visitorId": "visitor-uuid",
  "serviceId": "service-uuid",
  "scheduledDate": "2024-11-25T14:00:00Z",
  "reason": "Entretien d'embauche"
}
```

---

### 3. Générer QR Code

```http
GET /api/v1/appointments/{id}/qr-code
Authorization: Bearer <access_token>
```

---

## Services - Départements

### 1. Lister les Services

```http
GET /api/v1/services?page=1&limit=10&search=RH
Authorization: Bearer <access_token>
```

---

### 2. Créer un Service

```http
POST /api/v1/services
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Permissions:** ADMIN

**Body:**
```json
{
  "name": "Service Informatique"
}
```

---

### 3. Activité d'un Service

```http
GET /api/v1/services/{id}/activity?days=30
Authorization: Bearer <access_token>
```

---

### 4. Statistiques Services

```http
GET /api/v1/services/stats
Authorization: Bearer <access_token>
```

---

## Incidents - Gestion incidents

### 1. Lister les Incidents

```http
GET /api/v1/incidents
Authorization: Bearer <access_token>
```

---

### 2. Créer un Incident

```http
POST /api/v1/incidents
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "visitId": "visit-uuid",
  "title": "Comportement inapproprié",
  "description": "Description détaillée de l'incident",
  "severity": 3
}
```

---

## SOS - Alertes d'urgence

### 1. Lister les Alertes SOS

```http
GET /api/v1/sos
Authorization: Bearer <access_token>
```

---

### 2. Alertes SOS Actives

```http
GET /api/v1/sos/active
Authorization: Bearer <access_token>
```

---

### 3. Créer une Alerte SOS

```http
POST /api/v1/sos
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "checkpointId": "checkpoint-uuid",
  "message": "Urgence médicale"
}
```

---

### 4. Désactiver une Alerte SOS

```http
PATCH /api/v1/sos/{id}/deactivate
Authorization: Bearer <access_token>
```

---

### 5. Statistiques SOS

```http
GET /api/v1/sos/stats
Authorization: Bearer <access_token>
```

---

## Agents - Assignation

Gestion de l'assignation des agents aux checkpoints.

```http
GET /api/v1/agents
POST /api/v1/agents/assign
DELETE /api/v1/agents/{id}
```

---

## Non-Desirable - Liste noire

Gestion de la liste noire des visiteurs indésirables.

```http
GET /api/v1/nondesirable
POST /api/v1/nondesirable
DELETE /api/v1/nondesirable/{id}
```

---

## Files - Gestion fichiers

Upload et gestion des fichiers (pièces d'identité, photos).

```http
POST /api/v1/files/upload
GET /api/v1/files/{id}
DELETE /api/v1/files/{id}
```

## � Codes de Réponse

### Codes de Succès
- `200 OK` - Requête réussie
- `201 Created` - Ressource créée avec succès
- `204 No Content` - Suppression réussie

### Codes d'Erreur Client
- `400 Bad Request` - Données invalides ou manquantes
- `401 Unauthorized` - Token manquant, invalide ou expiré
- `403 Forbidden` - Permissions insuffisantes pour cette action
- `404 Not Found` - Ressource non trouvée
- `409 Conflict` - Conflit (ex: email déjà utilisé, identifiant en double)
- `422 Unprocessable Entity` - Erreur de validation des données

### Codes d'Erreur Serveur
- `500 Internal Server Error` - Erreur serveur interne
- `503 Service Unavailable` - Service temporairement indisponible

---

## 🛠️ Exemples d'Intégration

### JavaScript/Fetch

```javascript
// Configuration de base
const API_BASE_URL = 'http://localhost:3000/api/v1';
let accessToken = localStorage.getItem('accessToken');

// Fonction utilitaire pour les appels API
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Gestion du token expiré
    if (response.status === 401 && endpoint !== '/auth/login') {
      await refreshToken();
      return apiCall(endpoint, options);
    }
    throw new Error(data.message || 'Erreur API');
  }
  
  return data;
}

// Rafraîchir le token
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  accessToken = data.data.accessToken;
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
}

// Exemples d'utilisation
async function exemples() {
  try {
    // Connexion
    const login = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    accessToken = login.data.accessToken;
    localStorage.setItem('accessToken', login.data.accessToken);
    localStorage.setItem('refreshToken', login.data.refreshToken);
    
    // Lister les visiteurs
    const visitors = await apiCall('/visitors?page=1&limit=10');
    console.log('Visiteurs:', visitors.data);
    
    // Créer un visiteur
    const newVisitor = await apiCall('/visitors', {
      method: 'POST',
      body: JSON.stringify({
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+33612345678',
        company: 'TechCorp'
      })
    });
    console.log('Nouveau visiteur:', newVisitor.data);
    
    // Check-in
    const visit = await apiCall('/visits', {
      method: 'POST',
      body: JSON.stringify({
        visitorId: newVisitor.data.id,
        checkpointId: 'checkpoint-uuid',
        serviceId: 'service-uuid',
        reason: 'Réunion'
      })
    });
    console.log('Visite créée:', visit.data);
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}
```

---

### Python/Requests

```python
import requests
from typing import Dict, Any

class SonabyAPI:
    def __init__(self, base_url: str = "http://localhost:3000/api/v1"):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Connexion à l'API"""
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        
        data = response.json()
        self.access_token = data['data']['accessToken']
        self.refresh_token = data['data']['refreshToken']
        
        return data
    
    def _get_headers(self) -> Dict[str, str]:
        """Headers avec authentification"""
        headers = {"Content-Type": "application/json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        return headers
    
    def get_visitors(self, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Récupérer la liste des visiteurs"""
        response = requests.get(
            f"{self.base_url}/visitors",
            params={"page": page, "limit": limit},
            headers=self._get_headers()
        )
        response.raise_for_status()
        return response.json()
    
    def create_visitor(self, visitor_data: Dict[str, Any]) -> Dict[str, Any]:
        """Créer un nouveau visiteur"""
        response = requests.post(
            f"{self.base_url}/visitors",
            json=visitor_data,
            headers=self._get_headers()
        )
        response.raise_for_status()
        return response.json()
    
    def check_in(self, visit_data: Dict[str, Any]) -> Dict[str, Any]:
        """Effectuer un check-in"""
        response = requests.post(
            f"{self.base_url}/visits",
            json=visit_data,
            headers=self._get_headers()
        )
        response.raise_for_status()
        return response.json()

# Utilisation
api = SonabyAPI()

# Connexion
api.login("admin@example.com", "password123")

# Lister les visiteurs
visitors = api.get_visitors(page=1, limit=10)
print(f"Total visiteurs: {visitors['pagination']['total']}")

# Créer un visiteur
new_visitor = api.create_visitor({
    "firstname": "Marie",
    "lastname": "Martin",
    "email": "marie.martin@example.com",
    "phone": "+33698765432",
    "company": "ABC Corp"
})
print(f"Visiteur créé: {new_visitor['data']['id']}")
```

---

### cURL

```bash
# Variables
API_URL="http://localhost:3000/api/v1"
EMAIL="admin@example.com"
PASSWORD="password123"

# Connexion et récupération du token
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | jq -r '.data.accessToken')

echo "Token: $TOKEN"

# Lister les visiteurs
curl -X GET "$API_URL/visitors?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Créer un visiteur
curl -X POST "$API_URL/visitors" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+33612345678",
    "company": "TechCorp"
  }'

# Check-in
curl -X POST "$API_URL/visits" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "visitorId": "visitor-uuid",
    "checkpointId": "checkpoint-uuid",
    "serviceId": "service-uuid",
    "reason": "Réunion"
  }'
```

---

## 📱 Bonnes Pratiques

### Gestion des Tokens
1. **Stocker les tokens de manière sécurisée** (localStorage pour web, Keychain/Keystore pour mobile)
2. **Rafraîchir automatiquement** le token avant expiration
3. **Gérer les erreurs 401** en tentant un refresh avant de déconnecter l'utilisateur

### Gestion des Erreurs
```javascript
try {
  const response = await apiCall('/endpoint');
} catch (error) {
  if (error.status === 401) {
    // Token expiré, rediriger vers login
    window.location.href = '/login';
  } else if (error.status === 403) {
    // Permissions insuffisantes
    alert('Vous n\'avez pas les permissions nécessaires');
  } else if (error.status === 404) {
    // Ressource non trouvée
    alert('Ressource non trouvée');
  } else {
    // Erreur générique
    alert('Une erreur est survenue');
  }
}
```

### Pagination
```javascript
async function loadAllPages(endpoint) {
  let page = 1;
  let allData = [];
  let hasMore = true;
  
  while (hasMore) {
    const response = await apiCall(`${endpoint}?page=${page}&limit=50`);
    allData = [...allData, ...response.data];
    
    hasMore = page < response.pagination.pages;
    page++;
  }
  
  return allData;
}
```

---

## 🔗 Ressources

- **Documentation Swagger Interactive**: `http://localhost:3000/api-docs`
- **Repository GitHub**: https://github.com/ksertia/sonabhy-es-back
- **Documentation Technique**: Voir `DOCUMENTATION.md`
- **Guide de Déploiement**: Voir `DEPLOYMENT_GUIDE.md`

---

**Dernière mise à jour**: Novembre 2024  
**Version API**: 1.0.0

*Ce guide couvre tous les endpoints disponibles. Pour des exemples plus détaillés et des cas d'usage spécifiques, consultez la documentation Swagger interactive.*

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
