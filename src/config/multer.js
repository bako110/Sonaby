const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 🔹 1. Chemin de base LOCAL uniquement
const BASE_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// 🔹 2. Vérifier/créer le dossier racine
if (!fs.existsSync(BASE_UPLOAD_DIR)) {
  fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

// 🔹 3. Fonction pour créer une structure /uploads/YYYY/MM/DD
const createDirectoryPath = (subFolder = '') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const dirPath = path.join(BASE_UPLOAD_DIR, subFolder, year.toString(), month, day);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return dirPath;
};

// 🔹 4. Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // tu peux passer un subFolder dynamique via file.fieldname si besoin
      const dirPath = createDirectoryPath(file.fieldname);
      cb(null, dirPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uuid = uuidv4();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${uuid}_${base}${ext}`);
  }
});

// 🔹 5. Filtre des fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  cb(allowed.includes(file.mimetype) ? null : new Error(`Type de fichier interdit: ${file.mimetype}`), allowed.includes(file.mimetype));
};

// 🔹 6. Config finale Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 Mo max
    files: 5
  }
});

module.exports = { upload, createDirectoryPath };
