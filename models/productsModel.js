import { DataTypes } from 'sequelize';
import {sequelize} from './usersModel.js'; 

const Chapter = sequelize.define('chapter', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },{
    timestamps : false ,
    tableName : 'chapter'
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
        model: 'Chapter', // This is the target model
        key: 'id' // This is the target key attribute
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },{
    timestamps : false ,
    tableName : 'article'
  });

  const Product = sequelize.define('product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    article_id: {
      type: DataTypes.INTEGER, // This is the foreign key attribute
      allowNull: false,
      references: {
        model: 'Article', // This is the target model
        key: 'id' // This is the target key attribute
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), // Define the price field with appropriate precision and scale
        allowNull: false,
      }
  },{
    timestamps : false ,
    tableName : 'product'
  });


  export {Chapter ,Article, Product};