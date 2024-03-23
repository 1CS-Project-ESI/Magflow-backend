import { DataTypes } from 'sequelize';
import {sequelize,User} from './usersModel.js';  // Assuming you have your Sequelize instance defined


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
    type: DataTypes.DECIMAL(10, 2), // Assuming your tax rate is a decimal number with 2 decimal places
    allowNull: false,
  },
} ,{
  // tableName:'applicationparams',
  timestamps: false,

});



export default applicationparams;
