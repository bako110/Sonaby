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
      description: "Documentation de l'API Backend Sonaby"
    },
    // ✅ Base URL avec slash final
    servers: [
      { url: `http://localhost:${appConfig.port}/` }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        // Import de tous les schémas depuis swaggerSchemas.js
        ...swaggerSchemas,
        
        // Schémas de réponse spécifiques à l'auth
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                accessToken: { type: "string" },
                refreshToken: { type: "string" }
              }
            }
          }
        },
        
        // Schéma de réponse pour le profil utilisateur
        ProfileResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" }
              }
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
              schema: { $ref: '#/components/schemas/ApiError' }
            }
          }
        },
        Forbidden: {
          description: 'Accès interdit - permissions insuffisantes',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' }
            }
          }
        },
        NotFound: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' }
            }
          }
        },
        BadRequest: {
          description: 'Données invalides',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' }
            }
          }
        }
      }
    },

    // Tous les paths API
    paths: allSwaggerPaths,

    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Users", description: "User management endpoints" },
      { name: "Sites", description: "Site management endpoints" },
      { name: "Checkpoints", description: "Checkpoint management endpoints" },
      { name: "Agents", description: "Agent management endpoints" },
      { name: "Services", description: "Service management endpoints" },
      { name: "Visitors", description: "Visitor management endpoints" },
      { name: "Visits", description: "Visit management endpoints" },
      { name: "Appointments", description: "Appointment management endpoints" },
      { name: "Incidents", description: "Incident management endpoints" },
      { name: "Nondesirables", description: "Nondesirable management endpoints" },
      { name: "SOS", description: "SOS alert management endpoints" },
      { name: "Files", description: "File upload and management endpoints" },
      { name: "System", description: "System health and monitoring endpoints" }
    ]
  },
  apis: ["./src/modules/**/*.js", "./src/server.js"]
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = { swaggerSpec };
