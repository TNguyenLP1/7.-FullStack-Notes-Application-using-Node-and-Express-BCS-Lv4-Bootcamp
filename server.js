const express = require('express');
// Web framework for creating HTTP servers & APIs
const fs = require('fs').promises;
// File system module (promise-based)
const path = require('path');
// For handling file paths
const cors = require('cors');
// Enables Cross-Origin Resource Sharing (CORS)
const { nanoid } = require('nanoid');
// Generates unique IDs for notes
// Import dependencies


const DATA_FILE = path.join(__dirname, 'data.json');
// JSON file to store all notes
const PUBLIC_DIR = path.join(__dirname, 'public');
// Folder for static frontend files
// File and folder setup

const app = express(); 
// Create an express app instance

app.use(cors());
// Allow cross-origin requests (e.g., from frontend)
app.use(express.json());
// Automatically parse JSON in incoming requests
app.use(express.static(PUBLIC_DIR));
// Serve static files from /public folder (like index.html)
// Setting up middleware

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
// Server starting code