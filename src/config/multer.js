const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Chemin de base : local ou Fly.io
const BASE_UPLOAD_DIR = process.env.FLY_APP_NAME
  ? '/uploads' // En production Fly.io
  : path.join(__dirname, '..', '..', 'uploads'); // En local

// Fonction pour créer un dossier avec date
const createDirectoryPath = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const dirPath = path.join(BASE_UPLOAD_DIR, year.toString(), month, day);

  // Créer si n'existe pas
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return dirPath;
};

// Multer storage
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
    const uuid = uuidv4();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    cb(null, `${uuid}_${baseName}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }
};

// Multer final
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }
});

module.exports = { upload, createDirectoryPath };
