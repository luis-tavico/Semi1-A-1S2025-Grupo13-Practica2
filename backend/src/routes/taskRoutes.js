const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.post('/', taskController.createTask);
router.get('/', taskController.getTasksByUser);
router.get('/:id', taskController.getTaskByUser);
router.put('/:id', taskController.updateTask);
router.put('/state/:id', taskController.updateStateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
