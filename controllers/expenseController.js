const sequelize = require("../utils/database");

const { uploadToS3 } = require('../services/aws');

const Expense = require('../models/expenseModel');
const User = require('../models/userModel');
const downloadTable = require('../models/downloadTable');

require('dotenv').config(); 

const addExpense = async (req, res) => {
    const { amount, description, category } = req.body;
    const userId = req.user.userId;
    const numericAmount = parseFloat(amount);

    const t = await sequelize.transaction(); // Start transaction

    try {
        // Create the expense
        const expense = await Expense.create({
            amount: numericAmount,
            description,
            category,
            userId
        }, { transaction: t });

        // Update user's totalExpense
        const user = await User.findByPk(userId, { transaction: t });
        user.totalExpense += numericAmount;
        await user.save({ transaction: t });

        await t.commit(); // Commit transaction
        res.status(201).json({ message: 'Expense added successfully', expense });

    } catch (error) {
        await t.rollback(); // Rollback on error
        console.error('Error adding expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllExpense = async (req, res) => {
    const userId = req.user.userId; // Extract userId from JWT

    try {
        const expenses = await Expense.findAll({ where: { userId } });
        res.status(200).json({ expenses });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const t = await sequelize.transaction();

    try {
        const expense = await Expense.findOne({ where: { id, userId }, transaction: t });
        if (!expense) {
            await t.rollback();
            return res.status(404).json({ error: 'Expense not found or unauthorized' });
        }

        const user = await User.findByPk(userId, { transaction: t });
        user.totalExpense -= expense.amount;

        await user.save({ transaction: t });              // Save user with updated totalExpense
        await expense.destroy({ transaction: t });        // Delete expense in transaction

        await t.commit();
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getLeaderboard = async (req, res) => {
    //   try {
    //     const leaderboardData = await sequelize.query(
    //       `
    //       SELECT users.name, SUM(expenses.amount) AS totalExpense
    //       FROM users
    //       JOIN expenses ON users.id = expenses.userId
    //       GROUP BY users.id
    //       ORDER BY totalExpense DESC;
    //       `,
    //       { type: sequelize.QueryTypes.SELECT }
    //     );

    //     res.status(200).json(leaderboardData);
    //   } catch (error) {
    //     console.error("Error fetching leaderboard data:", error.message);
    //     res.status(500).json({ message: "Error fetching leaderboard data" });
    //   }
    const allUser = await User.findAll({ attributes: ['name', 'totalExpense'], order: [['totalExpense', 'DESC']] }); // Fetch all users and their total expenses

    const leaderboardData = allUser.map(user => {
        return {
            name: user.name,
            totalExpense: user.totalExpense
        };
    });
    res.status(200).json(leaderboardData);
};

// function uploadToS3(data, filename) {
//     const s3 = new AWS.S3({
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     });

//     const params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: filename,
//         Body: data,
//         ContentType: 'text/plain',
//         ACL: 'public-read', // Make the file publicly readable
//     };

//     return new Promise((resolve, reject) => {
//         s3.upload(params, (err, data) => {
//             if (err) {
//                 console.error('Error uploading to S3:', err);
//                 reject(err);
//             } else {
//                 // console.log('File uploaded successfully:', data.Location);
//                 resolve(data.Location); // Return the file URL
//             }
//         });
//     });
// }


const downloadExpense = async (req, res) => {
console.log("Download Expense called")
const userId = req.user.userId; // Extract userId from JWT
try {
    const expenses = await Expense.findAll({ where: { userId } });
    const strigifiedExpenses = JSON.stringify(expenses); 
    const filename = `Expense${userId}/${new Date()}.txt`; // Set the filename for the downloaded file
    // const filename = `Expense${userId}/${new Date()}.txt`; // Set the filename for the downloaded file
    const fileURL = await uploadToS3(strigifiedExpenses, filename); // Upload the file to S3 and get the URL
    // console.log("File URL: ",fileURL)
    downloadExpenseTable = await downloadTable.create({
        url: fileURL,
        customerId: userId
    });
    res.status(200).json({ fileURL ,success :true}); // Send the file URL as a response

} catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
}

}

const getDownloadTable = async (req, res) => {
    const userId = req.user.userId; // Extract userId from JWT
    try {
        const downloadTableData = await downloadTable.findAll({ where: { customerId: userId } });
        res.status(200).json({ downloadTableData });
    } catch (error) {
        console.error('Error fetching download table:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { addExpense, getAllExpense, deleteExpense, getLeaderboard, downloadExpense,getDownloadTable };
