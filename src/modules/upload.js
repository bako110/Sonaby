// services/uploadService.js
const path = require('path');
const { BASE_UPLOAD_DIR } = require('../config/paths');
const fs = require('fs');

class UploadService {
  getPublicUrl(file) {
    if (!file) return null;

    let relativePath = path.relative(BASE_UPLOAD_DIR, file.path);
    return `/${relativePath.replace(/\\/g, '/')}`; // Normaliser pour URL
  }

  deleteFile(fileUrl) {
    if (!fileUrl) return;

    const localPath = path.join(BASE_UPLOAD_DIR, fileUrl.replace(/^\//, ''));
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  }
}

module.exports = new UploadService();
