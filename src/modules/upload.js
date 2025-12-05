// services/uploadService.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class UploadService {
  constructor() {
    this.baseUploadDir = 'public/uploads/';
    this.createDirectories();
  }

  createDirectories() {
    const dirs = [
      'non-desirables/attachments',
      'visitors/photos',
      'visitors/id-scans'
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(this.baseUploadDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async saveFileFromMemory(file, entityType, fileType) {
    if (!file || !file.buffer) return null;
    
    try {
      // Déterminer l'extension
      const originalname = file.originalname || '';
      let fileExtension = path.extname(originalname);
      
      if (!fileExtension) {
        const mimeToExt = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/gif': '.gif',
          'image/webp': '.webp',
          'application/pdf': '.pdf'
        };
        fileExtension = mimeToExt[file.mimetype] || '.bin';
      }

      const fileName = `${uuidv4()}${fileExtension}`;
      const uploadDir = path.join(this.baseUploadDir, entityType, fileType);
      const filePath = path.join(uploadDir, fileName);

      // Créer le dossier si nécessaire
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Sauvegarder le fichier
      fs.writeFileSync(filePath, file.buffer);

      // Retourner l'URL
      return `/uploads/${entityType}/${fileType}/${fileName}`;
      
    } catch (error) {
      console.error('Erreur sauvegarde fichier:', error);
      return null;
    }
  }

  deleteFile(fileUrl) {
    if (!fileUrl) return;
    
    try {
      const relativePath = fileUrl.replace('/uploads/', '');
      const fullPath = path.join(this.baseUploadDir, relativePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Erreur suppression fichier:', error);
    }
  }
}

module.exports = new UploadService();