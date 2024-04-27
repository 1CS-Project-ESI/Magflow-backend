import { DataTypes } from 'sequelize';
import {sequelize} from './usersModel.js'; 
import { Produit } from './productsModel.js';

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
    id_fournisseur: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'fournisseur',
            key: 'id'
        }
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    orderdate: {
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


const BonReception = sequelize.define('bonreception', {
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
     id_boncommande: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'BonCommande', 
            key: 'id'
        }
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    deliverydate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'bonreception',
    timestamps: false,
});

const ProduitsCommandes = sequelize.define('produitscommandes', {
    id_produit: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'produit',
            key: 'id'
        }
    },
    id_boncommande: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'boncommande',
            key: 'id'
        }
    },
    ordered_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'produitscommandes',
    timestamps: false
});

const ProduitsDelivres = sequelize.define('produitsdelivres', {
    id_produit: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'produit',
            key: 'id'
        }
    },
    id_bonreception: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        references: {
            model: 'bonreception', 
            key: 'id'
        }
    },
    receivedquantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'produitsdelivres',
    timestamps: false
})

export {BonReception, BonCommande, ProduitsCommandes , ProduitsDelivres}