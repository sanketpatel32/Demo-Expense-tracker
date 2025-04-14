const express = require('express');
const path = require('path'); 
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authenticateUser = require('../middleware/authMiddleware'); // Import JWT Middleware

// Serve the Expense Page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'addExpense.html'));
});

// Expense Routes with Authentication
router.post('/add', authenticateUser, expenseController.addExpense);
router.get('/getAll', authenticateUser, expenseController.getAllExpense);
router.delete('/delete/:id', authenticateUser, expenseController.deleteExpense);
router.get('/leaderboard',expenseController.getLeaderboard)
router.get('/download',authenticateUser,expenseController.downloadExpense);

module.exports = router;
