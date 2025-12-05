// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dossiers
const createUploadDirs = () => {
  const dirs = [
    'public/uploads/non-desirables/photos/',
    'public/uploads/non-desirables/documents/'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};
createUploadDirs();

// Storage dynamique
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'public/uploads/non-desirables/';

    if (file.fieldname === 'photo') {
      folder += 'photos/';
    } else {
      folder += 'documents/';
    }

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    // CORRECTION ICI : Vérifier si originalname est une string
    let ext = '.jpg'; // extension par défaut
    
    if (file.originalname && typeof file.originalname === 'string') {
      // Essayer d'extraire l'extension
      const lastDot = file.originalname.lastIndexOf('.');
      if (lastDot !== -1) {
        const extractedExt = file.originalname.substring(lastDot);
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'].includes(extractedExt.toLowerCase())) {
          ext = extractedExt.toLowerCase();
        }
      }
    }
    
    // Déterminer le nom de base
    let base = 'file';
    if (file.originalname && typeof file.originalname === 'string') {
      const lastDot = file.originalname.lastIndexOf('.');
      if (lastDot !== -1) {
        base = file.originalname.substring(0, lastDot);
      } else {
        base = file.originalname;
      }
    }
    
    // Nettoyer le nom de base
    base = base.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'application/pdf'
  ];

  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Type de fichier non supporté"), false);
};

// NOUVEAU : 2 champs
const uploadNonDesirableWithFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'idScanUrl', maxCount: 1 }
]);

module.exports = { uploadNonDesirableWithFile };