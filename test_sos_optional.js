// Test SOS avec templateId optionnel
const axios = require('axios');

const SERVER_URL = 'https://sonabhy-es-back.fly.dev';

async function testSOSCreation() {
  try {
    console.log('🧪 Test création SOS sans templateId...');

    // Test 1: SOS sans templateId (devrait marcher maintenant)
    const sosData = {
      checkpointId: "checkpoint-test-id", // Remplacer par un vrai ID
      message: "Test SOS sans template",
      statut: "MEDIUM",
      priorite: "NORMAL",
      typeIncident: "GENERAL"
    };

    const response = await axios.post(`${SERVER_URL}/api/sos`, sosData, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Remplacer par vraie auth
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ SOS créé avec succès:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Erreur HTTP:', error.response.status);
      console.log('📋 Détails:', error.response.data);
    } else {
      console.log('❌ Erreur réseau:', error.message);
    }
  }
}

async function testFiltering() {
  try {
    console.log('🧪 Test filtrage SOS...');

    const response = await axios.get(`${SERVER_URL}/api/sos`, {
      params: {
        statut: 'MEDIUM',
        priorite: 'NORMAL',
        typeIncident: 'GENERAL',
        page: 1,
        limit: 5
      },
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });

    console.log('✅ Filtrage fonctionnel:', {
      total: response.data.pagination.total,
      results: response.data.sosAlerts.length
    });
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Erreur filtrage:', error.response.status);
      console.log('📋 Détails:', error.response.data);
    } else {
      console.log('❌ Erreur réseau:', error.message);
    }
  }
}

console.log('🚀 Début des tests SOS...');
testSOSCreation();
setTimeout(() => testFiltering(), 2000);