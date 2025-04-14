const express = require('express');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateUser = require('../middleware/authMiddleware'); // Import JWT Middleware

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..','views', 'login.html'));
});

router.post('/signup', userController.handleUserSignup);
router.post('/login', userController.handleUserLogin);
router.get('/isPremium', authenticateUser, userController.premiumUserCheck);

module.exports = router;