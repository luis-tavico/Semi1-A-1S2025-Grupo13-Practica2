const File = require('../models/fileModel');

exports.uploadFile = async (req, res) => {
  try {
    const { file_name, file_type, file_url, user_id } = req.body;
    const file = await File.create({ file_name, file_type, file_url, user_id });
    res.status(201).json({ message: 'Archivo subido', file });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir archivo' });
  }
};

exports.getFilesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const files = await File.findAll({ where: { user_id: userId } });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener archivos' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    await File.destroy({ where: { id } });
    res.json({ message: 'Archivo eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar archivo' });
  }
};
