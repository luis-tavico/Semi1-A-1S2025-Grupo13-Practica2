const express = require("express");
const userController = require('../controllers/userController');
const router = express.Router();
const multer = require('multer');
const path = require('path');

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

router.post("/register", upload.single('profile_picture'), userController.register);
router.post("/login", userController.login);

module.exports = router;