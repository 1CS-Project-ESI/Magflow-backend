import { DataTypes } from 'sequelize';
import {sequelize,User} from './usersModel'; // Import your Sequelize instance

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
});

const UserRoles = sequelize.define('usersroles', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });
  
  User.belongsToMany(Role, { through: UserRoles });
  Role.belongsToMany(User, { through: UserRoles });

export default {Role,UserRoles};
