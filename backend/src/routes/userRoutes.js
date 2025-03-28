const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

//router.post('/register', userController.register);
router.post('/register', userController.uploadProfilePicture, userController.register);
router.post('/login', userController.login);
router.get('/', userController.getAllUsers);

module.exports = router;
