const express = require('express');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, taskController.createTask);
router.get('/', authMiddleware, taskController.getTasksByUser);
router.get('/:id', authMiddleware, taskController.getTaskById);
router.put('/:id', authMiddleware, taskController.updateTask);
router.put('/state/:id', authMiddleware, taskController.updateStateTask);
router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router;