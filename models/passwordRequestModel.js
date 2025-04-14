const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const ResetPassword = sequelize.define('resetPassword', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    customerID: { // Ensure this field exists
        type: Sequelize.INTEGER,
        allowNull: false
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
}, );

module.exports = ResetPassword;