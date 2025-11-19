const swaggerJsdoc = require('swagger-jsdoc');
const { appConfig } = require('../config/appConfig');
const swaggerSchemas = require('./swaggerSchemas');
const allSwaggerPaths = require('./allSwaggerPaths');

const options = {
  definition: {
    openapi: "3.0.0",
    info: { 
      title: "Backend Sonaby API",
      version: "1.0.0",
      description: "Documentation de l'API Backend Sonaby - Système de gestion des visites multi-sites"
    },
    // ✅ Base URLs pour tous les environnements
    servers: [
      { 
        url: `http://localhost:${appConfig.port}/`,
        description: "Serveur de développement local"
      },
      { 
        url: "https://backend-sonaby.fly.dev/",
        description: "Serveur de production Fly.io"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Jeton JWT d'authentification"
        }
      },
      schemas: {
        // Import de tous les schémas depuis swaggerSchemas.js
        ...swaggerSchemas,
        
        // Schémas de réponse spécifiques à l'auth
        AuthResponse: {
          type: "object",
          properties: {
            success: { 
              type: "boolean",
              example: true
            },
            message: { 
              type: "string",
              example: "Authentification réussie"
            },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                accessToken: { 
                  type: "string",
                  description: "Jeton d'accès JWT"
                },
                refreshToken: { 
                  type: "string",
                  description: "Jeton de rafraîchissement JWT"
                }
              }
            }
          }
        },
        
        // Schéma de réponse pour le profil utilisateur
        ProfileResponse: {
          type: "object",
          properties: {
            success: { 
              type: "boolean",
              example: true
            },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" }
              }
            }
          }
        },

        // Schéma de réponse d'erreur standardisé
        ApiError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false
            },
            message: {
              type: "string",
              description: "Message d'erreur détaillé"
            },
            error: {
              type: "string",
              description: "Type d'erreur",
              example: "ValidationError"
            },
            details: {
              type: "array",
              items: {
                type: "object"
              },
              description: "Détails supplémentaires sur l'erreur"
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Horodatage de l'erreur"
            }
          }
        }
      },

      // Réponses communes réutilisables
      responses: {
        Unauthorized: {
          description: 'Token manquant ou invalide',
          content: {
            'application/json': {
              schema: { 
                $ref: '#/components/schemas/ApiError'
              },
              example: {
                success: false,
                message: "Token d'authentification manquant ou invalide",
                error: "Unauthorized",
                timestamp: "2024-01-15T10:30:00.000Z"
              }
            }
          }
        },
        Forbidden: {
          description: 'Accès interdit - permissions insuffisantes',
          content: {
            'application/json': {
              schema: { 
                $ref: '#/components/schemas/ApiError'
              },
              example: {
                success: false,
                message: "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource",
                error: "Forbidden",
                timestamp: "2024-01-15T10:30:00.000Z"
              }
            }
          }
        },
        NotFound: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: { 
                $ref: '#/components/schemas/ApiError'
              },
              example: {
                success: false,
                message: "Utilisateur non trouvé",
                error: "NotFound",
                timestamp: "2024-01-15T10:30:00.000Z"
              }
            }
          }
        },
        BadRequest: {
          description: 'Données invalides ou validation échouée',
          content: {
            'application/json': {
              schema: { 
                $ref: '#/components/schemas/ApiError'
              },
              example: {
                success: false,
                message: "Données de validation invalides",
                error: "ValidationError",
                details: [
                  {
                    field: "email",
                    message: "L'email doit être une adresse valide"
                  }
                ],
                timestamp: "2024-01-15T10:30:00.000Z"
              }
            }
          }
        },
        InternalServerError: {
          description: 'Erreur interne du serveur',
          content: {
            'application/json': {
              schema: { 
                $ref: '#/components/schemas/ApiError'
              },
              example: {
                success: false,
                message: "Une erreur interne est survenue",
                error: "InternalServerError",
                timestamp: "2024-01-15T10:30:00.000Z"
              }
            }
          }
        }
      }
    },

    // Tous les paths API
    paths: allSwaggerPaths,

    // Tags pour organiser la documentation
    tags: [
      { name: "Auth", description: "Endpoints d'authentification et gestion des tokens" },
      { name: "Users", description: "Gestion des utilisateurs et profils" },
      { name: "Sites", description: "Gestion des sites de l'entreprise" },
      { name: "Checkpoints", description: "Gestion des postes de contrôle" },
      { name: "Agents", description: "Gestion des agents et affectations" },
      { name: "Services", description: "Gestion des services/départements" },
      { name: "Visitors", description: "Gestion des visiteurs et identités" },
      { name: "Visits", description: "Gestion des visites et enregistrements" },
      { name: "Appointments", description: "Gestion des rendez-vous et pré-enregistrements" },
      { name: "Incidents", description: "Gestion des incidents de visite" },
      { name: "Nondesirables", description: "Gestion de la liste noire et historique" },
      { name: "SOS", description: "Gestion des alertes SOS et urgences" },
      { name: "Files", description: "Upload et gestion des fichiers (photos, scans)" },
      { name: "System", description: "Santé du système et monitoring" },
      { name: "Reports", description: "Rapports et statistiques" }
    ],

    // Sécurité globale - JWT requis par défaut
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  
  // Chemins vers les fichiers contenant les annotations Swagger
  apis: [
    "./src/modules/**/*.js", 
    "./src/routes/**/*.js",
    "./src/controllers/**/*.js",
    "./src/server.js",
    "./src/app.js"
  ]
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = { swaggerSpec };