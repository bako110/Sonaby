// Test pour débuguer le problème des templates SOS
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugTemplates() {
  try {
    console.log('🔍 Vérification des templates en base de données...\n');

    // 1. Compter les templates
    const templateCount = await prisma.sosTemplate.count();
    console.log(`📊 Nombre de templates en BDD: ${templateCount}\n`);

    // 2. Lister tous les templates
    const templates = await prisma.sosTemplate.findMany({
      orderBy: { id: 'asc' }
    });

    if (templates.length === 0) {
      console.log('❌ PROBLÈME: Aucun template en base de données !');
      console.log('💡 Solution: Créer des templates d\'abord avec:');
      console.log('   POST /api/v1/sos/templates/admin_message');
      console.log('   { "titre": "...", "message": "..." }');
    } else {
      console.log('✅ Templates trouvés:');
      templates.forEach(template => {
        console.log(`   ID: ${template.id} | Titre: "${template.titre}"`);
        console.log(`   Message: "${template.message.substring(0, 50)}..."`);
        console.log('   ---');
      });
    }

    // 3. Test de recherche par ID
    console.log('\n🧪 Test recherche template ID 1:');
    const testTemplate = await prisma.sosTemplate.findUnique({
      where: { id: 1 }
    });

    if (testTemplate) {
      console.log('✅ Template ID 1 trouvé:', testTemplate.titre);
    } else {
      console.log('❌ Template ID 1 non trouvé');
    }

    return templates;

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Créer quelques templates de test si aucun n'existe
async function createTestTemplates() {
  try {
    const count = await prisma.sosTemplate.count();
    
    if (count === 0) {
      console.log('\n🏭 Création de templates de test...');
      
      const templates = [
        {
          titre: "Intrusion Détectée",
          message: "🚨 ALERTE INTRUSION - Une intrusion a été détectée au checkpoint. Intervention de sécurité requise immédiatement."
        },
        {
          titre: "Incendie Suspecté", 
          message: "🔥 ALERTE INCENDIE - Fumée ou flammes détectées. Évacuation préventive et intervention pompiers en cours."
        },
        {
          titre: "Urgence Médicale",
          message: "🚑 URGENCE MÉDICALE - Assistance médicale requise d'urgence. SAMU en route."
        }
      ];

      for (const templateData of templates) {
        const template = await prisma.sosTemplate.create({
          data: templateData
        });
        console.log(`✅ Template créé: ID ${template.id} - "${template.titre}"`);
      }
      
      console.log('\n🎉 Templates de test créés avec succès !');
    } else {
      console.log('\n✅ Templates déjà présents en base');
    }
    
  } catch (error) {
    console.error('❌ Erreur création templates:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

console.log('🚀 Diagnostic templates SOS...\n');
debugTemplates().then(() => {
  return createTestTemplates();
});