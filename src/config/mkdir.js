// config/mkdir.js
const fs = require('fs');
const path = require('path');

function createDirectoryPath(baseDir, subFolder = '') {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  // Créer le répertoire de base s'il n'existe pas
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const dirPath = path.join(baseDir, subFolder, year.toString(), month, day);

  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  return dirPath;
}

module.exports = createDirectoryPath;
