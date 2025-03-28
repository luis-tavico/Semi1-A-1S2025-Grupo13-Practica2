const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./userModel');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  creation_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'tasks',
  timestamps: false
});

Task.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

module.exports = Task;
