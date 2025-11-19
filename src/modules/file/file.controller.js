const fileService = require('./file.service');
const { fileQuerySchema, fileIdSchema, fileSearchSchema } = require('./file.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');
const path = require('path');

class FileController {
  uploadSingle = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun fichier fourni' 
      });
    }

    try {
      const file = await fileService.createFile(req.file);
      res.status(201).json({
        success: true,
        message: 'Fichier uploadé avec succès',
        data: {
          id: file.id,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          createdAt: file.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  uploadMultiple = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun fichier fourni' 
      });
    }

    try {
      const files = await fileService.createMultipleFiles(req.files);
      res.status(201).json({
        success: true,
        message: `${files.length} fichier(s) uploadé(s) avec succès`,
        data: files.map(file => ({
          id: file.id,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          createdAt: file.createdAt
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getFileById = asyncHandler(async (req, res) => {
    const validated = fileIdSchema.parse(req.params);
    
    try {
      const file = await fileService.getFileById(validated.id);
      res.json({
        success: true,
        data: file
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getAllFiles = asyncHandler(async (req, res) => {
    const validated = fileQuerySchema.parse(req.query);
    
    try {
      const result = await fileService.getAllFiles(validated.page, validated.limit);
      res.json({
        success: true,
        data: result.files,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  deleteFile = asyncHandler(async (req, res) => {
    const validated = fileIdSchema.parse(req.params);
    
    try {
      const result = await fileService.deleteFile(validated.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  downloadFile = asyncHandler(async (req, res) => {
    const validated = fileIdSchema.parse(req.params);
    
    try {
      const file = await fileService.getFileById(validated.id);
      const fileStream = await fileService.getFileStream(file.path);
      
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Length', file.size);
      
      fileStream.pipe(res);
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  viewFile = asyncHandler(async (req, res) => {
    const validated = fileIdSchema.parse(req.params);
    
    try {
      const file = await fileService.getFileById(validated.id);
      const fileStream = await fileService.getFileStream(file.path);
      
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      
      fileStream.pipe(res);
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  searchFiles = asyncHandler(async (req, res) => {
    const validated = fileSearchSchema.parse(req.query);
    
    try {
      const files = await fileService.searchFiles(validated.query, validated.mimeType);
      res.json({
        success: true,
        data: files,
        count: files.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getFileStats = asyncHandler(async (req, res) => {
    try {
      const stats = await fileService.getFileStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
}

module.exports = new FileController();