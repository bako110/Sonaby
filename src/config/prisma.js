// config/prisma.js
const { PrismaClient } = require('@prisma/client');

// On stocke le client globalement pour éviter plusieurs instances en dev
const globalForPrisma = global;

// Si déjà défini, on réutilise ; sinon on crée un nouveau client
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['warn', 'error'], // Logs réduits : seulement warnings et erreurs
});

// On ne le réaffecte globalement qu'en dev pour éviter les fuites de connexion
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Vérification de la connexion au démarrage
async function testConnection() {
  try {
    await prisma.$connect();
  } catch (err) {
    console.error('❌ Prisma connection error:', err);
  }
}
testConnection();

module.exports = { prisma };
