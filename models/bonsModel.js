import { DataTypes } from 'sequelize';
import {sequelize} from './usersModel.js'; 

const BonCommande = sequelize.define('BonCommande', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_agentServiceAchat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'AgentServiceAchat',
            key: 'user_id'
        }
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    deliveryDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    orderSpecifications: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    total_HT: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    tva: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total_TTC: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        references: {
            model: 'Produit',
            key: 'id'
        }
    },
    id_bonCommande: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'BonCommande',
            key: 'id'
        }
    },
    id_bonReception: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'BonReception',
            key: 'id'
        }
    },
    orderedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    receivedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'produitsdelivres',
    timestamps: false,
});

export {BonReception, BonCommande, ProduitsDelivres}