const express = require('express');
const router = express.Router();
const {  processPayment, getPaymentStatus_ } = require('../controllers/paymentControllers');
const authenticateUser = require('../middleware/authMiddleware'); // Import JWT Middleware

// router.get('/', getPaymentPage);
router.post('/', authenticateUser,processPayment);
router.get('/:orderId',getPaymentStatus_);


module.exports = router;