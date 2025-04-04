const express = require('express');
const fileController = require('../controllers/fileController');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();

// Configurar AWS S3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET,
        key: (req, file, cb) => {
            let folder = 'otros';
            if (file.mimetype.startsWith('image/')) folder = 'imagenes';
            else if (file.mimetype.includes('pdf') || file.mimetype.includes('text/')) folder = 'documentos';
            cb(null, `${folder}/${Date.now()}_${file.originalname}`);
        },
    }),
});

router.post('/upload', authMiddleware, fileController.uploadFile);
router.get('/', authMiddleware, fileController.getFilesByUser);
router.get('/:id', authMiddleware, fileController.getFileById);
router.delete('/:id', authMiddleware, fileController.deleteFile);

module.exports = router;