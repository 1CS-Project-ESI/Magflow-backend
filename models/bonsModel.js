import { DataTypes } from 'sequelize';
import {sequelize} from './usersModel.js'; 

const BonCommande = sequelize.define('BonCommande', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_agentserviceachat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'agentServiceachat',
            key: 'user_id'
        }
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    orderdate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    deliverydate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    orderspecifications: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    total_ht: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    tva: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    total_ttc: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'boncommande',
    timestamps: false,
});

const BonReception = sequelize.define('BonReception', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_magasinier: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Magasinier', 
            key: 'user_id'
        }
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    deliveryDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'bonreception',
    timestamps: false,
});

const ProduitsDelivres = sequelize.define('ProduitDelivres', {
    id_produit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'Produit',
            key: 'id'
        }
    },
    id_boncommande: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'BonCommande',
            key: 'id'
        }
    },
    id_bonreception: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'BonReception',
            key: 'id'
        }
    },
    orderedquantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    receivedquantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'produitsdelivres',
    timestamps: false,
});

export {BonReception, BonCommande, ProduitsDelivres}