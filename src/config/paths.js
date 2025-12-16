// config/paths.js
const path = require('path');

// 🔹 Chemin de base pour les uploads (mode local uniquement)
const BASE_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads'); // ./uploads à la racine du projet

// 🔹 Sous-dossiers pour les types de fichiers
const PHOTO_DIR = 'non-desirables/photos';
const DOC_DIR = 'non-desirables/documents';
const VISITOR_PHOTO_DIR = 'visitors/photos';
const VISITOR_DOC_DIR = 'visitors/documents';

module.exports = { BASE_UPLOAD_DIR, PHOTO_DIR, DOC_DIR, VISITOR_PHOTO_DIR, VISITOR_DOC_DIR };
