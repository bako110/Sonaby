// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');

// // 🔹 1. Chemin de base : LOCAL ou PRODUCTION (Fly.io)
// const BASE_UPLOAD_DIR = process.env.FLY_APP_NAME
//   ? process.env.UPLOAD_DIR                           // Fly.io → dossier persistant
//   : path.join(__dirname, '..', '..', 'uploads'); // Local → ./uploads/

// // 🔹 2. Vérifier/créer le dossier racine
// if (!fs.existsSync(BASE_UPLOAD_DIR)) {
//   fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
// }

// // 🔹 3. Fonction pour créer une structure /uploads/2025/01/27/
// const createDirectoryPath = () => {
//   const now = new Date();

//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const day = String(now.getDate()).padStart(2, '0');

//   const dirPath = path.join(BASE_UPLOAD_DIR, year.toString(), month, day);

//   if (!fs.existsSync(dirPath)) {
//     fs.mkdirSync(dirPath, { recursive: true });
//   }

//   return dirPath;
// };

// // 🔹 4. Multer Storage (destination + filename)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     try {
//       const dirPath = createDirectoryPath();
//       cb(null, dirPath);
//     } catch (error) {
//       cb(error);
//     }
//   },

//   filename: (req, file, cb) => {
//     const uuid = uuidv4();
//     const ext = path.extname(file.originalname);
//     const base = path.basename(file.originalname, ext);

//     cb(null, `${uuid}_${base}${ext}`);
//   }
// });

// // 🔹 5. Sécurité : filtres des types autorisés
// const fileFilter = (req, file, cb) => {
//   const allowed = [
//     'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
//     'application/pdf',
//     'text/plain',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//   ];

//   if (allowed.includes(file.mimetype)) cb(null, true);
//   else cb(new Error(`Type de fichier interdit: ${file.mimetype}`), false);
// };

// // 🔹 6. Config finale multer
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10 Mo max
//     files: 5
//   }
// });

// module.exports = { upload, createDirectoryPath };
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 🔹 1. Chemin de base (SÛR)
const BASE_UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  (process.env.FLY_APP_NAME
    ? '/uploads'
    : path.join(__dirname, '..', '..', 'uploads'));

// 🔹 2. Vérifier/créer le dossier racine
if (!fs.existsSync(BASE_UPLOAD_DIR)) {
  fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

// 🔹 3. Fonction pour créer une structure /uploads/YYYY/MM/DD
const createDirectoryPath = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const dirPath = path.join(BASE_UPLOAD_DIR, year.toString(), month, day);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return dirPath;
};

// 🔹 4. Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dirPath = createDirectoryPath();
      cb(null, dirPath);
    } catch (error) {
      cb(error);
    }
  },

  filename: (req, file, cb) => {
    const uuid = uuidv4();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);

    cb(null, `${uuid}_${base}${ext}`);
  }
});

// 🔹 5. Sécurité fichiers
const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`Type de fichier interdit: ${file.mimetype}`), false);
};

// 🔹 6. Config finale
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  }
});

module.exports = { upload, createDirectoryPath };
