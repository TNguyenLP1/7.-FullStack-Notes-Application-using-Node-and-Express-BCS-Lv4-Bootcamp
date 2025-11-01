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
// Added functions to load and save data

app.get('/api/notes', async (req, res) => {
  const q = req.query;
  // Get query parameters
  const data = await loadData();
  // Load all notes from data file
  let notes = data.notes.slice();
  // Make a copy of the notes array

  if (q.deleted === 'true')  notes = notes.filter(n => n.deleted === true);
  if (q.deleted === 'false') notes = notes.filter(n => !n.deleted);
  // Filtering based on deleted parameter

  if (q.status === 'completed') notes = notes.filter(n => n.completed === true && !n.deleted);
  if (q.status === 'active')    notes = notes.filter(n => !n.completed && !n.deleted);
  // Filtering based on status parameter

  res.json(notes);
  // Send filtered notes to the client

});
// Add list notes — supports query filtering (deleted, completed, etc.)

app.get('/api/notes/:id', async (req, res) => {
  const data = await loadData();
  // Load all notes from data file
  const note = data.notes.find(n => n.id === req.params.id);
  // Find notes by ID
  if (!note) return res.status(404).json({ error: 'Not found' });
  // Added function to return 404 if notes not found
  res.json(note);
  // Added function to return found notes

});
// Get a single note by ID

app.post('/api/notes', async (req, res) => {
  const { title, body } = req.body;
  // Extract title and body from request
  if (!title || !title.trim()) return res.status(400).json({ error: 'title required' });
  // Validation clause to ensure title is provided

  const data = await loadData();
  // Added function to load existing notes

  const note = {
    id: nanoid(),
    // Added Unique ID
    title: title.trim(),
    body: body || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completed: false,
    deleted: false,
    history: []
    // Keeps track of edit history

  };
  // Added parameter to build new note

  data.notes.unshift(note);
  // Add new note to the top of the list
  await saveData(data);
  // Help to retrieve and save data
  res.status(201).json(note);
  // Respond with the newly created note

});
// Added function to create new note

app.put('/api/notes/:id', async (req, res) => {
  const { title, body } = req.body;
  // Extract title and body from request

  const data = await loadData();
  // Load existing notes from data file
  const idx = data.notes.findIndex(n => n.id === req.params.id);
  // Find index for notes to be updated
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  // Added function to return 404 if notes not found

  const note = data.notes[idx];
  // Get existing notes to be updated

  const before = { title: note.title, body: note.body };
  // Storing previous content for history
  const after  = { title: (title ?? note.title), body: (body ?? note.body) };
  // Setting new content, and defaulting old content if not provided

  if (before.title !== after.title || before.body !== after.body) {
    note.history = note.history || [];
    // Ensure history array exists for history

    note.history.push({
      timestamp: new Date().toISOString(),
      // Time stape for when data is added
      from: before,
      // From previous content
      to: after
      // To new content

    });
    // Add decision point for - if content has changed, record it in history

    note.title = after.title;
    note.body = after.body;
    note.updatedAt = new Date().toISOString();
  }
  // Update the note with new content and time stamp

  data.notes[idx] = note;
  // Update the note in the data array
  await saveData(data);
  // Save updated notes back to data file
  res.json(note);
  // Respond with updated note

});
// Added update a note, and record change history functionality

app.post('/api/notes/:id/complete', async (req, res) => {
  const data = await loadData();
  // Load existing notes from data file
  const note = data.notes.find(n => n.id === req.params.id);
  // Find notes by ID
  if (!note) return res.status(404).json({ error: 'Not found' });
  // Added function to return 404 if notes not found

  note.completed = !!req.body.completed;
  // Set completed status based on request body
  note.updatedAt = new Date().toISOString();
  // Updated timestamp
  await saveData(data);
  // Help to retrieve and save data
  res.json(note);
  // Added function to return found notes

});
// Added function to mark note as completed/uncompleted

app.delete('/api/notes/:id', async (req, res) => {
  const data = await loadData();
  // Load existing notes from data file
  const note = data.notes.find(n => n.id === req.params.id);
  // Find notes by ID
  if (!note) return res.status(404).json({ error: 'Not found' });
  // Added function to return 404 if notes not found

  note.deleted = true;
  // Mark note as deleted
  note.deletedAt = new Date().toISOString();
  // Added deletion time stamp
  note.updatedAt = new Date().toISOString();
  // Updated timestamp as needed
  await saveData(data);
  // Help to retrieve and save data
  res.json({ ok: true });
  // Added function to return found notes

});
// Add soft deletion for note mark as deleted but keep it in file, and allow for restoration

app.post('/api/notes/:id/restore', async (req, res) => {
  const data = await loadData();
  // Load existing notes from data file
  const note = data.notes.find(n => n.id === req.params.id);
  // Find notes by ID
  if (!note) return res.status(404).json({ error: 'Not found' });
  // Added function to return 404 if notes are not found

  note.deleted = false;
  // Mark note as not deleted
  note.deletedAt = null;
  // Added function to clear deletion time stamp
  note.updatedAt = new Date().toISOString();
  // Updated time stamp as needed
  await saveData(data);
  // Help to retrieve and save data
  res.json(note);
  // Added function to return found notes
  
});
// Add restoration function for the above soft delete

app.delete('/api/notes/:id/permanent', async (req, res) => {
  const data = await loadData();
  // Load existing notes from data file
  data.notes = data.notes.filter(n => n.id !== req.params.id);
  // Remove note from array
  await saveData(data);
  // Help to retrieve and save data
  res.json({ ok: true });
  // Added function to return found notes
  
});
// Added hard delete (remove permanently)

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.htm'));
});
// Add Fallback route for client-side routers

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
// Server starting code on port 3000 as required