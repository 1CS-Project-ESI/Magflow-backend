import { DataTypes } from 'sequelize';
import { sequelize } from './usersModel.js';

const Structure = sequelize.define('structure', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },{
      timestamps :false,
      tableName : "structure"
  });

// Export the Structure model
export {Structure};