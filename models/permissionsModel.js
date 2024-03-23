import { DataTypes } from 'sequelize';
import {sequelize} from './usersModel.js'; 
import {Role} from './rolesModel.js';


const Permission = sequelize.define('permissions', {
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
  timestamps:false,
});

const RolePermissions = sequelize.define('rolepermissions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'permissions',
      key: 'id'
    }
  }
}, {
  tableName: 'rolepermissions',
  timestamps: false
});
// Define associations if needed
// RolePermission.belongsTo(Role, { foreignKey: 'role_id' });
// RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' });
export {Permission,RolePermissions};
