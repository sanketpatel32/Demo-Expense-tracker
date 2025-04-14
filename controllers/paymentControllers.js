const path = require("path");
const {
  createOrder,
  getPaymentStatus,
} = require("../services/cashfreeService");
const Payment = require("../models/paymentModel");
const userModel = require("../models/userModel");
const expenseModel = require("../models/expenseModel");
// const TemplateGenerator = require("../Template/htmltemp");



exports.processPayment = async (req, res) => {
  const userId = req.user.userId;

  console.log("User ID:", userId); // Log the user ID for debugging
  const orderId = "ORDER-" + Date.now();
  const orderAmount = 2000;
  const orderCurrency = "INR";
  const customerID = "1";
  const customerPhone = "9999999999";

  try {

    //* Create an order in Cashfree and get the payment session ID
    const paymentSessionId = await createOrder(
      orderId,
      orderAmount,
      orderCurrency,
      customerID,
      customerPhone,
    );

    //* Save payment details to the database
    try {
      await Payment.create({
          orderId,
          paymentSessionId,
          orderAmount,
          orderCurrency,
          paymentStatus: "Pending",
          customerID : userId
      });
  } catch (error) {
      console.error("Error saving payment:", error.message);
  }

    res.json({ paymentSessionId, orderId });
  } catch (error) {
    console.error("Error processing payment:", error.message);
    res.status(500).json({ message: "Error processing payment" });
  }
};

exports.getPaymentStatus_ = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const orderStatus = await getPaymentStatus(orderId);

    // Update payment status in the database
    
    const order = await Payment.findOne({ where: { orderId } });
    console.log("Order:", order); // Log the order for debugging
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Update the order's status

    order.paymentStatus = orderStatus;

    await order.save();
    if(orderStatus === "Success") {
      // Update the user's balance or perform any other necessary actions here
      const user = await userModel.findOne({ where: { id: order.customerID } });
      if (user) {
        user.premiumUser = true; 
        await user.save();
      }
    }
    // const htmlTemp = TemplateGenerator(order.orderId, orderStatus, order.orderAmount)
    const htmlResponse = `
    <html>
      <head>
        <title>Payment Status</title>
      </head>
      <body>
        <h1>Payment Status</h1>
        <p>Order ID: ${order.orderId}</p>
        <p>Status: ${order.paymentStatus}</p>
        <p>Amount: ${order.orderAmount}</p>
                  <a href="/">Go to Expense Page</a> 
      </body>
    </html>
  `;
    res.send(htmlResponse); // Send the HTML response

  } catch (error) {
    console.error("Error fetching payment status:", error.message);
    res.status(500).json({ message: "Error fetching payment status" });
  }
};  


