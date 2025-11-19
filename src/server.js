// src/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const router = require('./routes'); // Toutes les routes regroupées
const { swaggerSpec } = require('./docs/swagger');
const { appConfig } = require('./config/appConfig');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https://swagger.io"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'https://backend-sonaby.fly.dev',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging des requêtes
app.use(requestLogger);

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Backend Sonaby API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    displayOperationId: true
  }
}));

// Endpoint pour récupérer la spec Swagger en JSON
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes principales
app.use(`/api/${appConfig.apiVersion}`, router);

// Route de santé (essentielle pour Fly.io)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'MySQL'
  });
});

// Route de vérification de l'API (pour Fly.io health checks)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy and running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route d'accueil
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Backend Sonaby API is running!',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
    api: `/api/${appConfig.apiVersion}`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route 404 pour les endpoints non trouvés
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'NotFound',
    timestamp: new Date().toISOString()
  });
});

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Démarrage serveur - IMPORTANT pour Fly.io
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Host: 0.0.0.0:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🌐 Production Docs: https://backend-sonaby.fly.dev/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🚀 Ready to accept requests!`);
});

// Graceful shutdown pour Fly.io
process.on('SIGTERM', () => {
  console.log('SIGTERM received, starting graceful shutdown');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, starting graceful shutdown');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Gestion des erreurs non catchées
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;