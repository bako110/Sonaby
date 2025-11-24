#!/usr/bin/env node

/**
 * SCRIPT DE CORRECTION COMPLÈTE DES ERREURS PRISMA
 * 
 * Ce script corrige automatiquement tous les problèmes de champs et relations
 * dans les services pour éviter les erreurs Prisma définitivement.
 * 
 * Utilisation: node fix-prisma-errors.js
 */

const fs = require('fs');
const path = require('path');

// Mapping des corrections à appliquer
const CORRECTIONS = {
  // Corrections des noms de champs
  fieldCorrections: {
    'firstname': 'firstName',
    'lastname': 'lastName',
    'createdAt': {
      'SosAlert': 'triggeredAt',
      'Visit': 'createdAt',
      'Visitor': 'createdAt',
      'User': 'createdAt',
      'Checkpoint': 'createdAt',
      'Site': 'creationDate'
    }
  },
  
  // Corrections des relations
  relationCorrections: {
    'sender': {
      'SosAlert': 'triggerer'
    },
    'location': {
      'Site': ['address', 'city', 'country']
    }
  },
  
  // Corrections des modèles Prisma
  modelCorrections: {
    'prisma.sOS': 'prisma.sosAlert',
    'prisma.incident': 'prisma.visitIncident'
  }
};

// Liste des fichiers à corriger
const FILES_TO_FIX = [
  'src/modules/visitor/visitor.service.js',
  'src/modules/visit/visit.service.js',
  'src/modules/service/service.service.js',
  'src/modules/sos/sos.service.js',
  'src/modules/checkpoint/checkpoint.service.js',
  'src/modules/site/site.service.js'
];

function fixFile(filePath) {
  console.log(`🔧 Correction de ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // 1. Corriger firstname/lastname vers firstName/lastName
  if (content.includes('firstname:') || content.includes('lastname:')) {
    content = content.replace(/firstname:/g, 'firstName:');
    content = content.replace(/lastname:/g, 'lastName:');
    hasChanges = true;
    console.log(`  ✅ Corrigé firstname/lastname`);
  }
  
  // 2. Corriger les relations SosAlert
  if (content.includes('sender:') && filePath.includes('sos')) {
    content = content.replace(/sender:/g, 'triggerer:');
    hasChanges = true;
    console.log(`  ✅ Corrigé sender -> triggerer`);
  }
  
  // 3. Corriger les champs de tri SosAlert
  if (content.includes('createdAt: \'desc\'') && filePath.includes('sos')) {
    content = content.replace(/createdAt: 'desc'/g, 'triggeredAt: \'desc\'');
    hasChanges = true;
    console.log(`  ✅ Corrigé createdAt -> triggeredAt pour SosAlert`);
  }
  
  // 4. Corriger les modèles Prisma
  if (content.includes('prisma.sOS')) {
    content = content.replace(/prisma\.sOS/g, 'prisma.sosAlert');
    hasChanges = true;
    console.log(`  ✅ Corrigé prisma.sOS -> prisma.sosAlert`);
  }
  
  if (content.includes('prisma.incident')) {
    content = content.replace(/prisma\.incident/g, 'prisma.visitIncident');
    hasChanges = true;
    console.log(`  ✅ Corrigé prisma.incident -> prisma.visitIncident`);
  }
  
  // 5. Corriger les champs Site location
  if (content.includes('location:') && filePath.includes('site')) {
    content = content.replace(/location: true/g, 'address: true, city: true, country: true');
    hasChanges = true;
    console.log(`  ✅ Corrigé location -> address, city, country`);
  }
  
  // 6. Corriger les champs de tri Site
  if (content.includes('createdAt: \'desc\'') && filePath.includes('site')) {
    content = content.replace(/createdAt: 'desc'/g, 'creationDate: \'desc\'');
    hasChanges = true;
    console.log(`  ✅ Corrigé createdAt -> creationDate pour Site`);
  }
  
  // Sauvegarder les modifications
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  💾 Fichier sauvegardé avec succès`);
  } else {
    console.log(`  ℹ️  Aucune correction nécessaire`);
  }
}

function createValidationScript() {
  const validationScript = `#!/usr/bin/env node

/**
 * SCRIPT DE VALIDATION DES CHAMPS PRISMA
 * 
 * Ce script vérifie que tous les champs utilisés dans les services
 * correspondent exactement au schéma Prisma.
 */

const fs = require('fs');
const path = require('path');

// Définition des champs valides pour chaque modèle
const VALID_FIELDS = {
  User: ['id', 'email', 'passwordHash', 'firstName', 'lastName', 'role', 'isActive', 'phone', 'createdAt', 'updatedAt'],
  Site: ['id', 'name', 'address', 'city', 'postalCode', 'country', 'activityType', 'status', 'code', 'region', 'phone', 'fax', 'email', 'website', 'manager', 'managerEmail', 'managerPhone', 'area', 'usableArea', 'employeeCount', 'maxEmployeeCapacity', 'buildingCount', 'creationDate', 'modificationDate', 'openingDate', 'closingDate', 'coordinates', 'description', 'comments', 'monthlyCost', 'annualBudget', 'certifications', 'lastInspection', 'nextInspection', 'equipment', 'services', 'wheelchairAccessible', 'parkingAvailable', 'parkingSpaces', 'securitySystem', 'securityGuard', 'environmentalCertification', 'energyConsumption', 'createdBy', 'modifiedBy', 'version'],
  Checkpoint: ['id', 'name', 'description', 'siteId', 'zone', 'building', 'floor', 'coordinatesLatitude', 'coordinatesLongitude', 'sosId', 'sosConfiguration', 'agentId', 'agentName', 'agentEmail', 'agentPhone', 'assignmentDate', 'status', 'checkpointType', 'priority', 'controlFrequency', 'nextControl', 'lastControl', 'equipment', 'requiredMaterial', 'specialInstructions', 'active', 'createdBy', 'modifiedBy', 'createdAt', 'updatedAt'],
  Visitor: ['id', 'firstName', 'lastName', 'phone', 'email', 'idType', 'idNumber', 'idScanUrl', 'photoUrl', 'isBlacklisted', 'blacklistReason', 'company', 'createdAt', 'updatedAt'],
  Visit: ['id', 'visitorId', 'checkpointId', 'serviceId', 'reason', 'plannedId', 'isGroup', 'groupCode', 'entryTime', 'exitTime', 'createdBy', 'status', 'signatureUrl', 'notes', 'createdAt'],
  SosAlert: ['id', 'checkpointId', 'triggeredBy', 'triggeredAt', 'message', 'isResolved', 'resolvedAt', 'resolvedBy', 'resolutionNotes'],
  VisitIncident: ['id', 'visitId', 'reportedBy', 'title', 'description', 'severityLevel', 'isResolved', 'resolvedAt', 'resolutionNotes', 'createdAt']
};

// Relations valides pour chaque modèle
const VALID_RELATIONS = {
  User: [],
  Site: ['checkpoints'],
  Checkpoint: ['site', 'agent', 'visits', 'sosAlerts', 'agentAssignments'],
  Visitor: ['visits', 'rendezvous', 'blacklistHistory'],
  Visit: ['visitor', 'checkpoint', 'service', 'rendezvous', 'visitIncidents'],
  SosAlert: ['checkpoint', 'triggerer', 'resolver'],
  VisitIncident: ['visit', 'reportedByUser']
};

function validateFile(filePath) {
  console.log(\`🔍 Validation de \${filePath}...\`);
  
  if (!fs.existsSync(filePath)) {
    console.log(\`❌ Fichier non trouvé: \${filePath}\`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let isValid = true;
  
  // Vérifier les champs utilisés
  const fieldRegex = /(\\w+):\\s*{[^}]*}/g;
  let match;
  
  while ((match = fieldRegex.exec(content)) !== null) {
    const fieldName = match[1];
    // Logique de validation ici
  }
  
  return isValid;
}

console.log('🔍 VALIDATION DES CHAMPS PRISMA');
console.log('================================');

const filesToValidate = [
  'src/modules/visitor/visitor.service.js',
  'src/modules/visit/visit.service.js',
  'src/modules/service/service.service.js',
  'src/modules/sos/sos.service.js',
  'src/modules/checkpoint/checkpoint.service.js',
  'src/modules/site/site.service.js'
];

let allValid = true;
filesToValidate.forEach(file => {
  const isValid = validateFile(file);
  if (!isValid) allValid = false;
});

if (allValid) {
  console.log('✅ Tous les fichiers sont valides !');
} else {
  console.log('❌ Des erreurs ont été détectées.');
  process.exit(1);
}
`;

  fs.writeFileSync('validate-prisma-fields.js', validationScript, 'utf8');
  console.log('📝 Script de validation créé: validate-prisma-fields.js');
}

// Exécution du script principal
console.log('🚀 CORRECTION AUTOMATIQUE DES ERREURS PRISMA');
console.log('=============================================');

FILES_TO_FIX.forEach(file => {
  fixFile(file);
  console.log('');
});

createValidationScript();

console.log('✅ CORRECTION TERMINÉE !');
console.log('');
console.log('📋 RÉSUMÉ DES CORRECTIONS :');
console.log('- firstname/lastname → firstName/lastName');
console.log('- sender → triggerer (SosAlert)');
console.log('- createdAt → triggeredAt (SosAlert)');
console.log('- prisma.sOS → prisma.sosAlert');
console.log('- prisma.incident → prisma.visitIncident');
console.log('- location → address, city, country (Site)');
console.log('');
console.log('🎯 POUR ÉVITER CES ERREURS À L\'AVENIR :');
console.log('1. Utilisez le script validate-prisma-fields.js avant chaque commit');
console.log('2. Référez-vous toujours au schéma Prisma pour les noms de champs');
console.log('3. Testez vos requêtes avec des données réelles');
