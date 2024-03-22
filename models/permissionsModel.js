import { DataTypes } from 'sequelize';
import sequelize from './usersModel'; 
import Role from './rolesModel';


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
});

const RolePermissions = sequelize.define('rolepermissions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });

Role.belongsToMany(Permission, { through: RolePermissions });
Permission.belongsToMany(Role, { through: RolePermissions });  

export default {Permission,RolePermissions};
