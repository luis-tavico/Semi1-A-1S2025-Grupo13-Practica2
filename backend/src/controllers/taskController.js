const Task = require('../models/taskModel');
const jwt = require('jsonwebtoken');

exports.createTask = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { title, description, creation_date } = req.body;
    const task = await Task.create({ title, description, creation_date, user_id: userId });
    res.status(201).json({ message: 'Tarea creada', task });
  } catch (error) {
    console.error('Error al crear la tarea:', error);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
};

exports.getTaskByUser = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ where: { id: id } });
    
    const formattedTask = {
      ...task.toJSON(),
      creation_date: task.creation_date.toISOString().split('T')[0],
    };
    res.json(formattedTask);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({ error: 'Error al obtener tarea' });
  }
};

exports.getTasksByUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const tasks = await Task.findAll({ where: { user_id: userId } });
    res.json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, creation_date } = req.body;
    await Task.update({ title, description, creation_date }, { where: { id } });
    res.json({ message: 'Tarea actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
};

exports.updateStateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    await Task.update({ completed }, { where: { id } });
    res.json({ message: 'Tarea actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await Task.destroy({ where: { id } });
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
};
