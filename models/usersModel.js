import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
  database: 'magflow',
  username: 'magflow_owner',
  password: '5Eq8jApoIJid',
  host: 'ep-long-leaf-a5xlkcbr-pooler.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Adjust this option as needed based on your SSL certificate configuration
    },
  },
});


const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstname: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  // Add any other fields as needed
},{
  timestamps : false,
});



const Admin = sequelize.define('admin', {
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
});

Admin.belongsTo(User);

const Director = sequelize.define('director', {
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
});

Director.belongsTo(User);

const Magasinier = sequelize.define('magasinier', {
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
});

Magasinier.belongsTo(User);

const Consumer = sequelize.define('consumer', {
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
});

Consumer.belongsTo(User);

const AgentServiceAchat = sequelize.define('agentserviceachat', {
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
});

AgentServiceAchat.belongsTo(User);


const StructureResponsable = sequelize.define('structureresponsable', {
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
});

StructureResponsable.belongsTo(User);

export default {User,Admin,Magasinier,Director,Consumer,AgentServiceAchat,StructureResponsable,sequelize};