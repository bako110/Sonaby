const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

class FileService {
  async createFile(fileData) {
    try {
      const file = await prisma.file.create({
        data: {
          originalName: fileData.originalname,
          mimeType: fileData.mimetype,
          size: fileData.size,
          path: fileData.path
        }
      });
      return file;
    } catch (error) {
      throw new Error(`Erreur lors de la création du fichier: ${error.message}`);
    }
  }

  async createMultipleFiles(filesData) {
    try {
      const files = await prisma.file.createMany({
        data: filesData.map(file => ({
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path
        }))
      });

      // Récupérer les fichiers créés avec leurs IDs
      const createdFiles = await prisma.file.findMany({
        where: {
          path: {
            in: filesData.map(file => file.path)
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: filesData.length
      });

      return createdFiles;
    } catch (error) {
      throw new Error(`Erreur lors de la création des fichiers: ${error.message}`);
    }
  }

  async getFileById(id) {
    try {
      const file = await prisma.file.findUnique({
        where: { id }
      });
      
      if (!file) {
        throw new Error('Fichier non trouvé');
      }

      return file;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du fichier: ${error.message}`);
    }
  }

  async getAllFiles(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [files, total] = await Promise.all([
        prisma.file.findMany({
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.file.count()
      ]);

      return {
        files,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des fichiers: ${error.message}`);
    }
  }

  async deleteFile(id) {
    try {
      const file = await this.getFileById(id);
      
      // Supprimer le fichier physique
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Supprimer l'enregistrement en base
      await prisma.file.delete({
        where: { id }
      });

      return { message: 'Fichier supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du fichier: ${error.message}`);
    }
  }

  async getFileStats() {
    try {
      const stats = await prisma.file.aggregate({
        _count: {
          id: true
        },
        _sum: {
          size: true
        }
      });

      const mimeTypeStats = await prisma.file.groupBy({
        by: ['mimeType'],
        _count: {
          mimeType: true
        }
      });

      return {
        totalFiles: stats._count.id,
        totalSize: stats._sum.size || 0,
        mimeTypeDistribution: mimeTypeStats
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async searchFiles(query, mimeType = null) {
    try {
      const whereClause = {
        originalName: {
          contains: query,
          mode: 'insensitive'
        }
      };

      if (mimeType) {
        whereClause.mimeType = mimeType;
      }

      const files = await prisma.file.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        }
      });

      return files;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de fichiers: ${error.message}`);
    }
  }

  async checkFileExists(filePath) {
    return fs.existsSync(filePath);
  }

  async getFileStream(filePath) {
    try {
      if (!this.checkFileExists(filePath)) {
        throw new Error('Fichier physique non trouvé');
      }
      
      return fs.createReadStream(filePath);
    } catch (error) {
      throw new Error(`Erreur lors de la lecture du fichier: ${error.message}`);
    }
  }
}

module.exports = new FileService();