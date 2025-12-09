// middleware/upload.js
const multer = require('multer');
const path = require('path');
const { BASE_UPLOAD_DIR, PHOTO_DIR, DOC_DIR, VISITOR_PHOTO_DIR, VISITOR_DOC_DIR } = require('../config/paths');
const createDirectoryPath = require('../config/mkdir');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Déterminer le sous-répertoire en fonction du fieldname
      let subFolder;
      if (file.fieldname === 'photoUrl') {
        subFolder = VISITOR_PHOTO_DIR;
      } else if (file.fieldname === 'idScanUrl') {
        subFolder = VISITOR_DOC_DIR;
      } else if (file.fieldname === 'photo') {
        subFolder = PHOTO_DIR;
      } else {
        subFolder = DOC_DIR;
      }
      
      const dirPath = createDirectoryPath(BASE_UPLOAD_DIR, subFolder);
      cb(null, dirPath);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'
  ];
  cb(allowed.includes(file.mimetype) ? null : new Error('Type non supporté'), allowed.includes(file.mimetype));
};

const uploadNonDesirable = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } })
  .fields([
    { name: 'photo', maxCount: 1 },
    { name: 'idScanUrl', maxCount: 1 }
  ]);

const uploadVisitor = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } })
  .fields([
    { name: 'photoUrl', maxCount: 1 },
    { name: 'idScanUrl', maxCount: 1 }
  ]);

module.exports = { uploadNonDesirable, uploadVisitor };
