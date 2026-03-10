const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugIncidents() {
  const checkpointId = 'dd41d429-d5d9-11f0-9a3d-0242ac140006';
  
  // 1. Récupérer le checkpoint et son site
  const checkpoint = await prisma.checkpoint.findUnique({
    where: { id: checkpointId },
    select: {
      id: true,
      name: true,
      siteId: true,
      site: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  
  console.log('=== CHECKPOINT INFO ===');
  console.log('Checkpoint:', checkpoint.name);
  console.log('Site ID:', checkpoint.siteId);
  console.log('Site Nom:', checkpoint.site.name);
  
  // 2. Tous les incidents de ce site
  const allIncidents = await prisma.incident.findMany({
    where: {
      siteId: checkpoint.siteId
    },
    select: {
      id: true,
      titre: true,
      dateIncident: true,
      createdAt: true,
      siteId: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });
  
  console.log('\n=== TOUS LES INCIDENTS DE CE SITE (10 derniers) ===');
  console.log('Total incidents pour ce site:', allIncidents.length);
  
  if (allIncidents.length > 0) {
    allIncidents.forEach(inc => {
      console.log(`\n- ID: ${inc.id}`);
      console.log(`  Titre: ${inc.titre}`);
      console.log(`  Date incident: ${inc.dateIncident}`);
      console.log(`  Date création: ${inc.createdAt}`);
    });
  } else {
    console.log('Aucun incident trouvé pour ce site !');
  }
  
  // 3. Incidents d'aujourd'hui
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  console.log(`\n=== PÉRIODE DE RECHERCHE ===`);
  console.log('Aujourd\'hui:', today.toISOString());
  console.log('Début du jour:', startOfDay.toISOString());
  console.log('Fin du jour:', endOfDay.toISOString());
  
  const todayIncidents = await prisma.incident.findMany({
    where: {
      siteId: checkpoint.siteId,
      createdAt: { gte: startOfDay, lt: endOfDay }
    }
  });
  
  console.log(`\n=== INCIDENTS D'AUJOURD'HUI (par createdAt) ===`);
  console.log('Total:', todayIncidents.length);
  
  const todayIncidentsByDate = await prisma.incident.findMany({
    where: {
      siteId: checkpoint.siteId,
      dateIncident: { gte: startOfDay, lt: endOfDay }
    }
  });
  
  console.log(`\n=== INCIDENTS D'AUJOURD'HUI (par dateIncident) ===`);
  console.log('Total:', todayIncidentsByDate.length);
  
  if (todayIncidentsByDate.length > 0) {
    todayIncidentsByDate.forEach(inc => {
      console.log(`\n- ${inc.titre}`);
      console.log(`  Date incident: ${inc.dateIncident}`);
      console.log(`  Date création: ${inc.createdAt}`);
    });
  }
  
  await prisma.$disconnect();
}

debugIncidents().catch(console.error);
