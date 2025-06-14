const fs = require('fs');
const path = require('path');
const File = require('../models/File');
const { s3 } = require('../config/aws');
const database = require('../config/database');

class FileController {
  static async uploadSingle(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileType = req.body.type || 'general';
      const isS3 = !!req.file.location;
      
      const file = File.fromMulterFile(req.file, fileType, isS3);
      
      if (req.user) {
        file.uploadedBy = req.user.id;
      }
      
      database.addFile(file);

      res.status(201).json({
        message: 'File uploaded successfully',
        file: file.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadMultiple(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const fileType = req.body.type || 'general';
      const isS3 = !!req.files[0].location;
      
      const uploadedFiles = req.files.map(file => {
        const fileObj = File.fromMulterFile(file, fileType, isS3);
        
        if (req.user) {
          fileObj.uploadedBy = req.user.id;
        }
        
        database.addFile(fileObj);
        return fileObj.toJSON();
      });

      res.status(201).json({
        message: `${uploadedFiles.length} files uploaded successfully`,
        files: uploadedFiles
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllFiles(req, res, next) {
    try {
      const { type, page = 1, limit = 10 } = req.query;
      
      const filters = {};
      if (type) filters.type = type;
      
      if (req.user && req.user.role !== 'admin') {
        filters.uploadedBy = req.user.id;
      }

      const result = database.paginateFiles(page, limit, filters);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getFileById(req, res, next) {
    try {
      const { id } = req.params;
      const file = database.getFileById(id);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (req.user && req.user.role !== 'admin' && file.uploadedBy !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ file });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFile(req, res, next) {
    try {
      const { id } = req.params;
      const file = database.getFileById(id);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (req.user && req.user.role !== 'admin' && file.uploadedBy !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (file.isS3) {
        const params = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: file.filename
        };
        await s3.deleteObject(params).promise();
      } else {
        const filePath = path.join(__dirname, '../../', file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      database.deleteFile(id);

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async updateFile(req, res, next) {
    try {
      const { id } = req.params;
      const { type } = req.body;
      
      const file = database.getFileById(id);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (req.user && req.user.role !== 'admin' && file.uploadedBy !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updates = {};
      if (type) updates.type = type;

      const updatedFile = database.updateFile(id, updates);

      res.json({
        message: 'File updated successfully',
        file: updatedFile
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req, res, next) {
    try {
      const stats = database.getFileStats();
      res.json({ stats });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FileController;