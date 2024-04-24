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
      allowNull: false,
      unique:true
    },
    id_agentserviceachat: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'agentserviceachat', // Name of the referenced table
        key: 'user_id' // Primary key in the referenced table
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
      type: DataTypes.INTEGER, // This is the foreign key attribute
      allowNull: false,
      references: {
        model: 'Chapitre', // This is the target model
        key: 'id' // This is the target key attribute
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
      type: DataTypes.DECIMAL(10, 2), // Define the price field with appropriate precision and scale
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
  },{
    timestamps : false ,
    tableName : 'produit'
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