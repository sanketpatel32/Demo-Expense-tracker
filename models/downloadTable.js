const sequelize = require('../utils/database');
const Sequelize = require('sequelize');
// const User = require('./userModel'); // Import the user model

const downloadTable = sequelize.define('downloadTable', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    url:{
        type: Sequelize.STRING,
        allowNull: false
    },
    customerId : {
        type: Sequelize.INTEGER,
        allowNull: false
    },
});

module.exports = downloadTable;