const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./userModel');

const File = sequelize.define('File', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  file_name: { type: DataTypes.STRING(255), allowNull: false },
  file_type: { type: DataTypes.STRING(100), allowNull: false },
  file_url: { type: DataTypes.TEXT, allowNull: false },
  upload_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  user_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'files',
  timestamps: false
});

File.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

module.exports = File;