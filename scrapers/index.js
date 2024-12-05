const puppeteer = require('puppeteer');

async function scrapeTransactions() {
    try {
        console.log("Scraping transactions...");
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();
        
        await page.goto('https://solscan.io/txs', {
            waitUntil: 'networkidle0'
        });

        await page.waitForSelector('.data-table tbody tr');

        const transactions = await page.evaluate(() => {
            const rows = document.querySelectorAll('.data-table tbody tr');
            return Array.from(rows).map(row => {
                const signature = row.querySelector('td:nth-child(2) a')?.textContent?.trim();
                const time = row.querySelector('td:nth-child(4) div')?.textContent?.trim();
                const type = row.querySelector('td:nth-child(5) div div')?.textContent?.trim();
                
                // For demonstration, we'll set placeholder values for from/to/amount
                return {
                    time: time,
                    type: type,
                    from: signature?.substring(0, 8) + '...',  // First 8 chars of signature
                    to: signature?.substring(signature.length - 8) + '...',  // Last 8 chars
                    amount: (Math.random() * 10).toFixed(4),  // Random amount for demonstration
                    value: (Math.random() * 1000).toFixed(2)  // Random USD value for demonstration
                };
            });
        });
        console.log(transactions);
        await browser.close();
        return transactions;

    } catch (error) {
        console.error('Error scraping transactions:', error);
        return [];
    }
}

module.exports = { scrapeTransactions };
