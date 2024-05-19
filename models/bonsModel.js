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
     bonlivraison_path: {
        type: DataTypes.STRING, // Adjust the data type based on your file path format
        allowNull: true, // Depending on your requirements
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
});



/////////////////////////////////////////////////

const BonCommandeInterne = sequelize.define('boncommandeinterne', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_consommateur: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'consumer', // Assuming your consumer table name is 'consumer'
            key: 'user_id'
        }
    },
    number: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    validation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    typecommande : {
        type : DataTypes.STRING(255),
        allowNull: false,        
    }
}, {
    tableName: 'boncommandeinterne',
    timestamps: false
});


const ProduitsCommandeInterne = sequelize.define('produitscommandeinterne', {
    id_produit: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'produit', // Assuming your product table name is 'produit'
            key: 'id'
        }
    },
    id_boncommandeinterne: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'boncommandeinterne', // Assuming your boncommandeinterne table name is 'boncommandeinterne'
            key: 'id'
        }
    },
    orderedquantity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    accordedquantity: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'produitscommandeinterne',
    timestamps: false
});

const BonSortie = sequelize.define('bonsortie', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_boncommandeinterne: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'boncommandeinterne',
            key: 'id'
        }
    },
    service: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'bonsortie',
    timestamps: false
});

const ProduitsServie = sequelize.define('produitsservie', {
    id_bonsortie: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'bonsortie',
            key: 'id'
        }
    },
    id_produit: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'produit',
            key: 'id'
        }
    },
    servedquantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    observation: {
        type: DataTypes.STRING,
        allowNull: true
    },
}, {
    tableName: 'produitsservie',
    timestamps: false
});

const BonDecharge = sequelize.define('bondecharge', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_boncommandeinterne: { // New column definition
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'boncommandeinterne',
            key: 'id'
        }
    },
    id_consommateur: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'consumer',
            key: 'id'
        }
    },    
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'not_received' // Set the default value to 'not_received'
    }
}, {
    tableName: 'bondecharge',
    timestamps: false
});

const ProduitsDecharges = sequelize.define('produitsdecharges', {
    id_bondecharge: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'bondecharge',
            key: 'id'
        }
    },
    id_produit: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'produit',
            key: 'id'
        }
    },
    observation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dechargedquantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    tableName: 'produitsdecharges',
    timestamps: false
});


BonCommandeInterne.hasMany(ProduitsCommandeInterne, {
    foreignKey: 'id_boncommandeinterne',
    sourceKey: 'id',
    as: 'produits'
  });
  
  ProduitsCommandeInterne.belongsTo(BonCommandeInterne, {
    foreignKey: 'id_boncommandeinterne',
    targetKey: 'id',
    as: 'boncommande'
  });

  BonReception.hasMany(ProduitsDelivres, {
    foreignKey: 'id_bonreception',
    sourceKey: 'id',
    as: 'deliveredProducts'
  });
  
  ProduitsDelivres.belongsTo(BonReception, {
    foreignKey: 'id_bonreception',
    targetKey: 'id',
    as: 'bonReception'
  });
  
  BonDecharge.hasMany(ProduitsDecharges, {
    foreignKey: 'id_bondecharge',
    sourceKey: 'id',
    as: 'dechargedProducts'
  });
  
  ProduitsDecharges.belongsTo(BonDecharge, {
    foreignKey: 'id_bondecharge',
    targetKey: 'id',
    as: 'bonDecharge'
  });

  ProduitsServie.belongsTo(BonSortie, {
    foreignKey: 'id_bonsortie',
    as: 'bonSortie' // Alias for the association
  });
  
  BonSortie.hasMany(ProduitsServie, {
    foreignKey: 'id_bonsortie',
    as: 'produitsServies' // Alias for the association
  });
  
export {BonReception, BonCommande, ProduitsCommandes , ProduitsDelivres , BonCommandeInterne , BonSortie,BonDecharge,ProduitsCommandeInterne,ProduitsServie,ProduitsDecharges}