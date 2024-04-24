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
    id_chapitre: {
        type: DataTypes.INTEGER,
        allowNull: true, // or false, depending on your requirements
        references: {
            model: 'chapitre', // Name of the referenced table
            key: 'id' // Primary key in the referenced table
        }
    }
}, { 
    tableName: 'fournisseur',
    timestamps: false
});



export {Fournisseur}
