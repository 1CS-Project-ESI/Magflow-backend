import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/dbConnection.js'; // Import your Sequelize instance

const Admin = sequelize.define('admin', {
  matricule: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
    // Disable timestamps
    timestamps: false
  });

export default Admin;