let lastUpdateTime = 0;
console.log("Transactions script loaded");
function formatWalletAddress(address) {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function createTransactionRow(transaction) {
    const row = document.createElement('tr');
    
    // Add data-timestamp for sorting
    row.setAttribute('data-timestamp', new Date(transaction.timestamp).getTime());
    
    row.innerHTML = `
        <td>${formatTimestamp(transaction.timestamp)}</td>
        <td>
            <span class="transaction-type type-${transaction.type.toLowerCase()}">
                ${transaction.type || 'Unknown'}
            </span>
        </td>
        <td class="wallet-address" title="${transaction.fromWallet}">
            ${formatWalletAddress(transaction.fromWallet)}
            <button class="copy-button" data-wallet="${transaction.fromWallet}">
                <i class="fas fa-copy"></i>
            </button>
        </td>
        <td class="wallet-address" title="${transaction.toWallet}">
            ${formatWalletAddress(transaction.toWallet)}
            <button class="copy-button" data-wallet="${transaction.toWallet}">
                <i class="fas fa-copy"></i>
            </button>
        </td>
        <td>${transaction.amount ? transaction.amount.toFixed(4) : '0.0000'} SOL</td>
        <td>$${transaction.totalValue ? transaction.totalValue.toFixed(2) : '0.00'}</td>
    `;
    return row;
}

// Initialize Socket.io connection
// const socket = io();

// Function to fetch transactions using AJAX
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

// Function to update the transactions table
function updateTransactionsTable(transactions) {
    const tbody = document.getElementById('transactions-body');
    if (!tbody) return;

    // Clear existing transactions
    tbody.innerHTML = '';

    // Add new transactions
    transactions.forEach(tx => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-100';
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

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch
    fetchTransactions();

    // Set up periodic refresh (every 30 seconds)
    setInterval(fetchTransactions, 30000);

    // Add refresh button functionality if needed
    const refreshButton = document.getElementById('refresh-transactions');
    if (refreshButton) {
        refreshButton.addEventListener('click', fetchTransactions);
    }
}); 
