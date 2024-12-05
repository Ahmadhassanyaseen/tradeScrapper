const express = require('express');
const router = express.Router();
const { scrapeTransactions } = require('../scrapers');

// Route to render the dashboard
router.get('/', async (req, res) => {
    try {
        const transactions = await scrapeTransactions();
        res.render('dashboard', { transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.render('dashboard', { transactions: [] });
    }
});

module.exports = router; 