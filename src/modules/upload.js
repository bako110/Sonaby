// services/uploadService.js
const fs = require('fs');
const path = require('path');

class UploadService {
  getPublicUrl(file) {
    if (!file) return null;

    // file.path = public/uploads/non-desirables/photos/xxx.jpg
    const normalized = file.path.replace('public', '').replace(/\\/g, '/');

    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }

  deleteFile(fileUrl) {
    if (!fileUrl) return;

    try {
      const localPath = path.join('public', fileUrl.replace('/uploads/', 'uploads/'));

      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (err) {
      console.error("Erreur suppression fichier:", err);
    }
  }
}

module.exports = new UploadService();
