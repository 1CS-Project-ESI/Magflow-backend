// src/config/database.ts

import { Sequelize } from 'sequelize';
import { pool } from '../config/dbConnection'; // Import the pool object from dbconnection.ts

const sequelize = new Sequelize({
  dialect: 'postgres',
  dialectModule: pool,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
