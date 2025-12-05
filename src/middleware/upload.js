// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers si nécessaire
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

// Configuration pour fichiers (photos + PDF)
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'public/uploads/non-desirables/';
    
    // Séparer les photos des documents
    if (file.mimetype.startsWith('image/')) {
      folder += 'photos/';
    } else {
      folder += 'documents/';
    }
    
    cb(null, folder);
  },
  
  filename: function (req, file, cb) {
    // Garder l'extension originale
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const uniqueName = `${name}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accepter images et PDF
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/jpg',
    'image/webp',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non supporté: ${file.mimetype}. Types autorisés: JPEG, PNG, JPG, WEBP, PDF`), false);
  }
};

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Middleware pour FormData avec fichier optionnel
const uploadNonDesirableWithFile = upload.single('photo'); // Champ 'photo' dans FormData

module.exports = { uploadNonDesirableWithFile };