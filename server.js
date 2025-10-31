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

async function loadData() {
try {
    const txt = await fs.readFile(DATA_FILE, 'utf8');
    // Read file as text
    return JSON.parse(txt);
    // Parse JSON into a JS object
    } 

catch (e) {
    // If file doesn't exist yet, create an initial structure
    const initial = { notes: [] };
    await saveData(initial);
    return initial;
  }
}
// Load all notes from data.json

async function saveData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}
// Save notes back to data.json
// Added helper functions

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
// Server starting code