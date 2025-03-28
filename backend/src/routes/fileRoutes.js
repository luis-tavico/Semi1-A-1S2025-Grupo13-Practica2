const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.post('/', fileController.uploadFile);
router.get('/:userId', fileController.getFilesByUser);
router.delete('/:id', fileController.deleteFile);

module.exports = router;
