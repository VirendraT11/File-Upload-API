const express = require('express');
const router = express.Router();
const FileController = require('../controllers/fileController');
const { upload } = require('../config/multer');
const { s3Upload } = require('../config/aws');
const { validateFileUpload } = require('../middleware/validation');
const { authenticateToken, optionalAuth, authorize } = require('../middleware/auth');


const useS3 = process.env.USE_S3 === 'true';
const uploadMiddleware = useS3 ? s3Upload : upload;


router.post('/upload', 
  authenticateToken,
  validateFileUpload,
  uploadMiddleware.single('file'), 
  FileController.uploadSingle
);

router.post('/upload/multiple', 
  authenticateToken,
  validateFileUpload,
  uploadMiddleware.array('files', 5), 
  FileController.uploadMultiple
);

router.post('/upload/profile', 
  authenticateToken,
  uploadMiddleware.single('profilePicture'), 
  FileController.uploadSingle
);

router.post('/upload/documents', 
  authenticateToken,
  uploadMiddleware.array('documents', 10), 
  FileController.uploadMultiple
);

router.get('/', optionalAuth, FileController.getAllFiles);
router.get('/stats', authenticateToken, authorize(['admin']), FileController.getStats);
router.get('/:id', optionalAuth, FileController.getFileById);
router.put('/:id', authenticateToken, FileController.updateFile);
router.delete('/:id', authenticateToken, FileController.deleteFile);

module.exports = router;