const express = require('express');
const fileController = require('../controllers/fileController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/upload', authMiddleware, fileController.uploadFile);
router.get('/', authMiddleware, fileController.getFilesByUser);
router.get('/:id', authMiddleware, fileController.getFileById);
router.delete('/:id', authMiddleware, fileController.deleteFile);

module.exports = router;