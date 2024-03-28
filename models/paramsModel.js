import { DataTypes } from 'sequelize';
import {sequelize,User} from './usersModel.js'; 


const applicationparams = sequelize.define('applicationparams', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  establishmentname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tauxtva: {
    type: DataTypes.DECIMAL(10, 2), // tax rate is a decimal number with 2 decimal places
    allowNull: false,
  },
} ,{
  // tableName:'applicationparams',
  timestamps: false,

});



export default applicationparams;
