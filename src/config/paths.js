// config/paths.js
const path = require('path');

const BASE_UPLOAD_DIR = process.env.FLY_APP_NAME
  ? '/uploads'               // Production Fly.io
  : path.join(__dirname, '..', '..', 'uploads'); // Local (depuis src/config vers racine)

const PHOTO_DIR = 'non-desirables/photos';
const DOC_DIR = 'non-desirables/documents';
const VISITOR_PHOTO_DIR = 'visitors/photos';
const VISITOR_DOC_DIR = 'visitors/documents';

module.exports = { BASE_UPLOAD_DIR, PHOTO_DIR, DOC_DIR, VISITOR_PHOTO_DIR, VISITOR_DOC_DIR };
