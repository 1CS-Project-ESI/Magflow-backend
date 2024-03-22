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
  isactive: {
    type: DataTypes.BOOLEAN,
    defaultValue:true
  }
},{
  timestamps : false,
});



const Admin = sequelize.define('admin', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName:'admin',
  timestamps: false,
});



const Director = sequelize.define('director', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName:'director',
  timestamps: false,
});



const Magasinier = sequelize.define('magasinier', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName:'magasinier',
  timestamps: false,
});



const Consumer = sequelize.define('consumer', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName:'consumer',
  timestamps: false,
});

const AgentServiceAchat = sequelize.define('agentserviceachat', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName:'agentserviceachat',
  timestamps: false,
});


const StructureResponsable = sequelize.define('structureresponsable', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  matricule: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName:'structureresponsable',
  timestamps: false,
});

// sequelize.sync({ alter: true })
//   .then(() => {
//     console.log('Database synchronized');
//   })
//   .catch((error) => {
//     console.error('Error synchronizing database:', error)});

export  {User,Admin,Magasinier,Director,Consumer,AgentServiceAchat,StructureResponsable,sequelize};