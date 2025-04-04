const File = require('../models/fileModel');
const User = require('../models/userModel');
const path = require('path');

exports.uploadFile = async (req, res) => {
    try {
        const { file_name, file_type, file_url } = req.body;
        const user_id = req.user.id;

        if (!file_name || !file_url) {
            return res.status(400).json({ message: 'Datos incompletos' });
        }

        const newFile = await File.create({
            file_name,
            file_type,
            file_url,
            user_id,
        });

        res.status(201).json(newFile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFileById = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findByPk(id);

        if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado.' });
        }

        res.json(file);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFilesByUser = async (req, res) => {
    try {
        const files = await File.findAll({ where: { user_id: req.user.id } });
        const user = await User.findOne({ where: { id: req.user.id } });
        res.json({ files, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRows = await File.destroy({ where: { id: id } });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Archivo no encontrado.' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};