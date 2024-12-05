async function fetchTransactions() {
    try {
        const response = await fetch('/api/transactions');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const transactions = await response.json();
        updateTransactionsTable(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

function updateTransactionsTable(transactions) {
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = ''; // Clear existing transactions

    transactions.forEach(tx => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tx.time || 'N/A'}</td>
            <td><span class="transaction-type">${tx.type || 'Unknown'}</span></td>
            <td>${tx.from || 'N/A'}</td>
            <td>${tx.to || 'N/A'}</td>
            <td>${tx.amount || '0'} SOL</td>
            <td>$${tx.value || '0'}</td>
        `;
        tbody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchTransactions();
    setInterval(fetchTransactions, 30000); // Refresh every 30 seconds
}); 