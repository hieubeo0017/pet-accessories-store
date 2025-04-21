const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const { mongoURI, connectDB } = require('./config/database');
const {API} = require("./routes");
connectDB();

// Routes
app.use('/api', API);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});