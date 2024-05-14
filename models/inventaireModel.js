import { DataTypes } from 'sequelize';
import { sequelize } from './usersModel.js';

const Inventaire = sequelize.define('inventaire', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    validation: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'inventaire',
    timestamps: false
});

const EtatStock = sequelize.define(
  'etatStock',
  {
    id_produit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Produit',
        key: 'id',
      },
    },
    id_inventaire: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Inventaire',
        key: 'id',
      },
    },
    physicalquantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    observation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'etatstock',
    timestamps: false,
  }
);

export { Inventaire, EtatStock };
