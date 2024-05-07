import { DataTypes } from 'sequelize';
import {sequelize} from './usersModel.js'; 

const Chapitre = sequelize.define('chapitre', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    code: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique:true
    },
    id_agentserviceachat: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'agentserviceachat', 
        key: 'user_id'
      }
    }
  },{
    timestamps : false ,
    tableName : 'chapitre'
  });

  const Article = sequelize.define('article', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chapter_id: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'Chapitre', 
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    tva: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    }
    
  },{
    timestamps : false ,
    tableName : 'article'
  });
  const Produit = sequelize.define('produit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    caracteristics: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0

    },
    seuil: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0 
    }
}, {
    timestamps: false,
    tableName: 'produit'
});



  const ProduitsArticle = sequelize.define('produitsarticle', {
    id_produit: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'produit',
            key: 'id'
        }
    },
    id_article: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'article',
            key: 'id'
        }
    }
}, {
    tableName: 'produitsarticle',
    timestamps: false
}); 

  export {Chapitre ,Article, Produit,ProduitsArticle};