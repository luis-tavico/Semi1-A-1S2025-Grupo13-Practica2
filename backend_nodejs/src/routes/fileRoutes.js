const express = require('express');
const fileController = require('../controllers/fileController');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');

// Configuración de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); 
    },
});

const upload = multer({ storage: storage });
//

router.post('/upload', authMiddleware, upload.single('file'), fileController.uploadFile);
router.get('/', authMiddleware, fileController.getFilesByUser);
router.get('/:id', authMiddleware, fileController.getFileById);
router.delete('/:id', authMiddleware, fileController.deleteFile);

module.exports = router;