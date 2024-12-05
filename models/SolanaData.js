const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    signature: String,
    fromWallet: String,
    toWallet: String,
    amount: Number,
    price: Number,
    totalValue: Number,
    type: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const SolanaDataSchema = new mongoose.Schema({
    binancePrice: Number,
    geckoPrice: Number,
    marketCap: Number,
    volume: Number,
    transactions: [TransactionSchema],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SolanaData', SolanaDataSchema); 