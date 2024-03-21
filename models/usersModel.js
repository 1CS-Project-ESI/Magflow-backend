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
    autoIncrement: true
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isactive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true 
  }
}, {
    // Disable timestamps
    timestamps: false
  });

// // Create the table if it doesn't exist
// User.sync({ force: false }).then(() => {
//   console.log('User table created');
// }).catch(error => {
//   console.error('Error creating User table:', error);
// });

export default User;