const Sequelize = require('sequelize');
require('dotenv').config();

const DB_NAME = process.env.MODE === 'production' ? process.env.DB_NAME : 'expense';
const DB_USER = process.env.MODE === 'production' ? process.env.DB_USER : 'root';
const DB_PASSWORD = process.env.MODE === 'production' ? process.env.DB_PASSWORD : 'root';
const DB_HOST = process.env.MODE === 'production' ? process.env.DB_HOST : 'localhost';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  dialect: 'mysql',
  host: DB_HOST,
  port: process.env.DB_PORT || 3306,
});

module.exports = sequelize;
