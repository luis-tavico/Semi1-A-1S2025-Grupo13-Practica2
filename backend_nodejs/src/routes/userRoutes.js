const express = require("express");
const userController = require('../controllers/userController');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require("@aws-sdk/client-s3");
require('dotenv').config();

// Configurar AWS S3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Configurar Multer con S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `profile_pictures/${Date.now()}_${file.originalname}`);
        },
    }),
});

router.post("/register", upload.single('profile_picture'), userController.register);
router.post("/login", userController.login);

module.exports = router;