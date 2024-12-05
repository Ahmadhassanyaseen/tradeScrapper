// server.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const SolanaData = require("./models/SolanaData");
const scraper = require("./scrapers");
const http = require("http");
const socketIo = require("socket.io");
const cron = require("node-cron");
const { scrapeTransactions } = require("./scrapers");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://xeno:admin@nextjs.06tbj5n.mongodb.net/solana_tracker"
);

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", async (req, res) => {
  try {
    const solanaData = await SolanaData.find()
      .sort({ timestamp: -1 })
      .limit(24); // Last 24 records
    res.render("dashboard", {
      title: "Solana Tracker Dashboard",
      data: solanaData,
      transactions: latestTransactions,
    });
  } catch (error) {
    res.render("error", { error });
  }
});

// API endpoints for AJAX updates
app.get("/api/solana/latest", async (req, res) => {
  try {
    const latestData = await SolanaData.findOne().sort({ timestamp: -1 });
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    const solanaData = await SolanaData.find({
      timestamp: { $gte: oneHourAgo },
    }).sort({ timestamp: 1 });
    res.json(solanaData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await scrapeTransactions();
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Store the latest transactions
let latestTransactions = [];

// Function to perform scraping and update
async function updateTransactions() {
  try {
    console.log("Scraping new transactions...");
    const newTransactions = await scraper.scrapeTransactions();
    if (newTransactions && newTransactions.length > 0) {
      latestTransactions = newTransactions;
      io.emit("transactionsUpdate", latestTransactions);
      console.log("Transactions updated and broadcast to clients");
    }
  } catch (error) {
    console.error("Error updating transactions:", error);
  }
}

// Schedule transaction updates every minute
cron.schedule("* * * * *", updateTransactions);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected");

  // Send current transactions to newly connected clients
  socket.emit("transactionsUpdate", latestTransactions);

  // Handle initial transaction request
  socket.on("requestTransactions", () => {
    socket.emit("transactionsUpdate", latestTransactions);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startDataCollection();
});

// Start data collection
function startDataCollection() {
  setInterval(async () => {
    // await scraper.collectData();
    console.log("Collecting data...");
    await scraper.scrapeTransactions();
  }, 10000); // Update every minute
}
