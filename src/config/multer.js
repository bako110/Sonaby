const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Utilitaire pour créer les répertoires dynamiquement
const createDirectoryPath = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const dirPath = path.join('uploads', year.toString(), month, day);
  
  // Créer le répertoire s'il n'existe pas
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  return dirPath;
};

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dirPath = createDirectoryPath();
      cb(null, dirPath);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    try {
      const uuid = uuidv4();
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const filename = `${uuid}_${baseName}${ext}`;
      cb(null, filename);
    } catch (error) {
      cb(error, null);
    }
  }
});

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  // Types MIME autorisés
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }
};

// Configuration multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5 // Maximum 5 fichiers pour upload multiple
  }
});

module.exports = {
  upload,
  createDirectoryPath
};
