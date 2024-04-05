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
    }
}, { 
    tableName: 'fournisseur',
    timestamps: false
});

const TransactionFournisseur = sequelize.define('TransactionFournisseur', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_fournisseur: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Fournisseur',
            key: 'id'
        }
    },
    id_boncommande: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'BonCommande',
            key: 'id'
        }
    },
    id_bonreception: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'BonReception',
            key: 'id'
        }
    }
}, { 
    tableName: 'transactionfournisseur',
    timestamps: false
});

export {Fournisseur, TransactionFournisseur}
