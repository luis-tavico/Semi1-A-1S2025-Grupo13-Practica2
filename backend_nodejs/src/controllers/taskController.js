const Task = require('../models/taskModel');
const User = require('../models/userModel');

exports.createTask = async (req, res) => {
    try {
        const { title, description, creation_date } = req.body;
        const newTask = await Task.create({ title, description, creation_date, user_id: req.user.id });
        res.json({ message: 'Tarea creada exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTasksByUser = async (req, res) => {
    try {
        const tasks = await Task.findAll({ where: { user_id: req.user.id } });
        const user = await User.findOne({ where: { id: req.user.id } });
        res.json({ tasks, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findOne({ where: { id: taskId } });

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { title, description, creation_date} = req.body;

        const task = await Task.findOne({ where: { id: taskId } });

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        await Task.update({ title, description, creation_date}, { where: { id: taskId } });

        const updatedTask = await Task.findOne({ where: { id: taskId } });
        res.json({ message: 'Tarea actualizada exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { completed } = req.body;

        const task = await Task.findOne({ where: { id: taskId } });

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        await Task.update({ completed }, { where: { id: taskId } });

        const updatedTask = await Task.findOne({ where: { id: taskId } });
        res.json({ message: 'Tarea actualizada exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        const task = await Task.findOne({ where: { id: taskId, user_id: req.user.id } });

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        await Task.destroy({ where: { id: taskId, user_id: req.user.id } });
        res.json({ message: 'Tarea eliminada exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};