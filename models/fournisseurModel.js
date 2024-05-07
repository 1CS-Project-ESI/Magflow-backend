import { DataTypes } from 'sequelize';
import {sequelize} from './usersModel.js'; 

const Fournisseur = sequelize.define('fournisseur', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    phone: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rc: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nif: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rib: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, { 
    tableName: 'fournisseur',
    timestamps: false
});



export {Fournisseur}
