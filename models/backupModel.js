import { DataTypes } from 'sequelize';
import {sequelize,User} from './usersModel.js'; 


const Backup = sequelize.define('backup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false, 
});
export default Backup ;