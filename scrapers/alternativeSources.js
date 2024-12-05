const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeFromSolanaPools() {
    try {
        const { data } = await axios.get('https://dex.raydium.io/markets', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const transactions = [];

        // Adjust selectors based on actual HTML structure
        $('.swap-transaction').each((i, element) => {
            const transaction = {
                fromWallet: $(element).find('.from-wallet').text().trim(),
                toWallet: $(element).find('.to-wallet').text().trim(),
                amount: parseFloat($(element).find('.amount').text().trim()),
                type: 'swap',
                timestamp: new Date()
            };

            transactions.push(transaction);
        });

        return transactions;
    } catch (error) {
        console.error('Error scraping from Solana pools:', error);
        return [];
    }
}

async function scrapeFromSerum() {
    try {
        const { data } = await axios.get('https://dex.projectserum.com', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const transactions = [];

        // Adjust selectors based on actual HTML structure
        $('.trade-history-row').each((i, element) => {
            const transaction = {
                price: parseFloat($(element).find('.price').text().trim()),
                amount: parseFloat($(element).find('.size').text().trim()),
                type: $(element).find('.side').text().trim().toLowerCase(),
                timestamp: new Date($(element).find('.time').attr('data-timestamp'))
            };

            transactions.push(transaction);
        });

        return transactions;
    } catch (error) {
        console.error('Error scraping from Serum:', error);
        return [];
    }
}

module.exports = {
    scrapeFromSolanaPools,
    scrapeFromSerum
}; 