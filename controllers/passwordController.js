const { v4: uuidv4 } = require('uuid');
const Sib = require('sib-api-v3-sdk');
require('dotenv').config();
const path = require('path');
const resetPasswordModel = require('../models/passwordRequestModel');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

// Sender Info (must be verified in Brevo)
const sender = {
    email: 'ssddpatel323@gmail.com',
    name: 'Siddharth Patel'
};

const resetPasswordLink = async (req, res) => {
    const { id } = req.params;

    try {
        const resetRequest = await resetPasswordModel.findOne({ where: { id } });

        if (!resetRequest || !resetRequest.isActive) {
            return res.status(400).json({ error: 'Invalid or expired password reset link' });
        }

        // If valid, serve the HTML page
        return res.sendFile(path.join(__dirname, '..', 'views', 'updatePassword.html'));
    } catch (error) {
        console.error('❌ Error handling reset link:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
// Send Email Controller
const resetPassword = async (req, res) => {
    const { email: toEmail } = req.body;
    const uniqueId = uuidv4(); // Generate a unique ID for the reset request
    // Log incoming data for debugging
    console.log("📨 Incoming body:", req.body);
    const user = await userModel.findOne({ where: { email: toEmail } });
    if (user) {
        resetPasswordModel.create({
            id: uniqueId,
            customerID: user.id,
            isActive: true
        }).then(() => {
            console.log("✅ Password reset request created for user:", user.email);
        }).catch(err => {
            console.error("❌ Error creating password reset request:", err);
        });
    }

    const subject = "Password Reset Request";
    const textContent = "To reset your password, please click the link below:\n\n";
    const htmlContent = `<p>To reset your password, please click the link below:</p>
    <br>
    <h1>
    <a href="${process.env.FRONTEND_URL}/password/resetpassword/${uniqueId}">Reset Password</a>
    </h1>
    `;

    if (!toEmail || !subject || !textContent || !htmlContent) {
        return res.status(400).json({ error: 'Missing required email fields' });
    }

    try {
        const response = await tranEmailApi.sendTransacEmail({
            sender,
            to: [{ email: toEmail }],
            subject,
            textContent,
            htmlContent
        });

        console.log('✅ Email sent:', response.messageId || response);
        res.status(200).json({ message: 'Email sent successfully', data: response });
    } catch (error) {
        console.error('❌ Email send failed:', error.response?.body || error.message);
        res.status(500).json({ error: 'Failed to send email', details: error.response?.body });
    }
};

const updatePassword = async (req, res) => {
    const { password } = req.body;
    const userToken = req.params.id; // Get user ID from JWT token
    try{
        const user = await resetPasswordModel.findOne({ where: { id: userToken } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid Link' });
        }
        if (!user.isActive) {
            return res.status(400).json({ error: 'Link expired' });
        }

        // Hash the new password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
        // Update the user's password in the database
        await userModel.update({ password: hashedPassword }, { where: { id: user.customerID } });
        // Deactivate the reset request
        await resetPasswordModel.update({ isActive: false }, { where: { id: userToken } });
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error('❌ Error updating password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = {
    resetPassword,
    resetPasswordLink,
    updatePassword
};
