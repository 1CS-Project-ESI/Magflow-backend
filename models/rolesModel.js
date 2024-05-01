import { DataTypes } from 'sequelize';
import {sequelize,User} from './usersModel.js'; 

const Role = sequelize.define('roles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
},{
    timestamps :false
});

const UsersRoles = sequelize.define('usersroles', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        },
        allowNull: false
    },
    role_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'roles',
            key: 'id'
        },
        allowNull: false
    }
}, {
    tableName: 'usersroles',
    timestamps: false,
    uniqueKeys: {
        usersroles_unique: {
            fields: ['user_id', 'role_id']
        }
    }
});
  
export  {Role,UsersRoles};
