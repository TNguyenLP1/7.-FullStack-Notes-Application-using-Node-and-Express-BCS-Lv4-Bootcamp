const STORAGE_KEY = 'tri-nguyen-tasks'; 
// Local storage key to save tasks
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); 
// Load tasks from local storage or default to an empty array

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
// Function to save tasks to localStorage

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
// Function to generate a unique ID for each task
// Utility functions

let editModal = null;
let deleteModal = null;
let editConfirmModal = null;
let reactivateConfirmModal = null;
let deletedConfirmModal = null;

let currentEditId = null;
let currentDeleteId = null;
let currentReactivateId = null;
let currentDeleteIdDeletedPage = null;
// Modal instances

document.addEventListener('DOMContentLoaded', () => {
  const em = document.getElementById('editModal');
  if (em) editModal = new bootstrap.Modal(em);

  const dm = document.getElementById('deleteModal');
  if (dm) deleteModal = new bootstrap.Modal(dm);

  const ecm = document.getElementById('editConfirmModal');
  if (ecm) editConfirmModal = new bootstrap.Modal(ecm);

  const rcm = document.getElementById('reactivateConfirmModal');
  if (rcm) reactivateConfirmModal = new bootstrap.Modal(rcm);

  const dcm = document.getElementById('deletedConfirmModal');
  if (dcm) deletedConfirmModal = new bootstrap.Modal(dcm);
});
// Initialize modal instances on DOM content loaded

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (themeToggle) {
      themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
      themeToggle.classList.add('dark');
    }
  }
  // Initialize from localStorage if a theme is already set

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const icon = themeToggle.querySelector('i');
      if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        icon.classList.replace('fa-moon', 'fa-sun');
        themeToggle.classList.remove('dark');
      } else {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        icon.classList.replace('fa-sun', 'fa-moon');
        themeToggle.classList.add('dark');
      }
    });
  }
  // Toggle dark mode when the theme toggle button is clicked

});
// Theme toggle
// Functionality to toggle between light and dark themes

if (document.getElementById('taskList')) {
  const taskInput = document.getElementById('taskInput');
  const taskBodyInput = document.getElementById('taskBody');
  const addBtn = document.getElementById('addTaskButton');
  const errorMsg = document.getElementById('error-message');
  const editTitle = document.getElementById('editTitle');
  const editBody = document.getElementById('editBody');
  const editPreview = document.getElementById('editPreview');

  addBtn.addEventListener('click', () => {
    const title = taskInput.value.trim();
    const body = taskBodyInput.value.trim();
    if (!title) { 
      errorMsg.textContent = 'Task title required'; 
      return; 
    }
    const newTask = {
      id: generateId(),
      title,
      body,
      completed: false,
      deleted: false,
      history: [],
      createdAt: new Date().toISOString() // Timestamp when task is created
    };
    tasks.push(newTask); // Add new task to the list
    saveTasks(); // Save updated tasks list to localStorage
    taskInput.value = ''; // Clear input fields
    taskBodyInput.value = '';
    renderList(); 
    // Re-render the list of tasks
  });
  // Add new task

  function renderList() {
    const list = document.getElementById('taskList');
    list.innerHTML = ''; 
    // Clear the task list before rendering
    tasks.filter(t => !t.completed && !t.deleted).forEach(t => { 
      // Filter out completed and deleted tasks
      const li = document.createElement('li');
      li.className = 'task-item list-group-item d-flex justify-content-between align-items-start';
      li.innerHTML = `
        <div>
          <strong>${t.title}</strong><br>
          <div>${t.body || ''}</div>
          <small>Created: ${new Date(t.createdAt).toLocaleString()}</small>
        </div>
        <div class="task-actions">
          <button class="btn btn-success btn-sm complete-btn">Complete</button>
          <button class="btn btn-primary btn-sm edit-btn">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn">Delete</button>
        </div>
      `;

      li.querySelector('.complete-btn').addEventListener('click', () => {
        t.completed = true;
        t.history.push({ timestamp: new Date().toISOString(), action: 'Completed' });
        saveTasks();
        renderList(); // Re-render task list
      });
      // Event listener for marking task as completed

      li.querySelector('.edit-btn').addEventListener('click', () => {
        currentEditId = t.id;
        editTitle.value = t.title;
        editBody.value = t.body;
        updateEditPreview(t); // Show preview of changes
        editModal.show(); // Show the edit modal
      });
      // Event listener for editing the task

      li.querySelector('.delete-btn').addEventListener('click', () => {
        currentDeleteId = t.id;
        if (deleteModal) deleteModal.show(); // Show the delete confirmation modal
      });
      // Event listener for deleting the task

      list.appendChild(li); 
      // Append task to the list
    });
  }
  // Function to render the task list on the index page

  function updateEditPreview(task) {
    editPreview.innerHTML = `
      <div><strong>Title</strong>: <s>${task.title}</s> → ${editTitle.value}</div>
      <div><strong>Body</strong>: <s>${task.body || ''}</s> → ${editBody.value}</div>
    `;
  }
  // Function to update the preview for editing the task

  editTitle.addEventListener('input', () => {
    const t = tasks.find(x => x.id === currentEditId);
    if (t) updateEditPreview(t);
  });
  editBody.addEventListener('input', () => {
    const t = tasks.find(x => x.id === currentEditId);
    if (t) updateEditPreview(t);
  });
  // Update preview when title or body input changes

  document.getElementById('editForm').addEventListener('submit', e => {
    e.preventDefault();
    if (editConfirmModal) editConfirmModal.show(); // Show confirmation modal for editing
  });
  // Handle the submit action for editing a task

  const editConfirmBtn = document.getElementById('editConfirmBtn');
  if (editConfirmBtn) {
    editConfirmBtn.addEventListener('click', () => {
      const t = tasks.find(x => x.id === currentEditId);
      if (t) {
        t.history.push({
          timestamp: new Date().toISOString(),
          action: 'Edited',
          from: { title: t.title, body: t.body },
          to: { title: editTitle.value, body: editBody.value }
        });
        t.title = editTitle.value;
        t.body = editBody.value;
        saveTasks();
        editConfirmModal.hide(); // Close the confirmation modal
        editModal.hide(); // Close the edit modal
        renderList(); // Re-render task list
      }
    });
  }
  // Confirm the edit action and save changes

  const deleteConfirmBtn = document.getElementById('deleteConfirmBtnIndex');
  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener('click', () => {
      const t = tasks.find(x => x.id === currentDeleteId);
      if (t) {
        t.deleted = true;
        t.history.push({ timestamp: new Date().toISOString(), action: 'Deleted' });
        saveTasks();
        deleteModal.hide(); // Close delete modal
        renderList(); // Re-render task list
      }
    });
  }
  // Handle task deletion confirmation

  renderList(); 
  // Initial render of task list
}
// Index.htm - Main task list management

if (document.getElementById('completedList')) {
  const list = document.getElementById('completedList');

  function renderCompleted() {
    list.innerHTML = ''; // Clear the list
    tasks.filter(t => t.completed && !t.deleted).forEach(t => { 
      // Filter completed tasks
      const li = document.createElement('li');
      li.className = 'task-item list-group-item d-flex justify-content-between align-items-start';
      li.innerHTML = `
        <div>
          <strong>${t.title}</strong><br>
          <div>${t.body || ''}</div>
          <small>Completed: ${t.history.filter(h => h.action === 'Completed').pop()?.timestamp || ''}</small>
        </div>
        <div class="task-actions">
          <button class="btn btn-primary btn-sm mark-active-btn">Mark Active</button>
        </div>
      `;

      li.querySelector('.mark-active-btn').addEventListener('click', () => {
        currentReactivateId = t.id;
        if (reactivateConfirmModal) reactivateConfirmModal.show(); // Show reactivate modal
      });
      // Event listener for marking task as active again (reopen it)

      list.appendChild(li); 
      // Append completed task to the list
    });
  }
  // Render completed tasks

  const reactivateConfirmBtn = document.getElementById('reactivateConfirmBtn');
  if (reactivateConfirmBtn) {
    reactivateConfirmBtn.addEventListener('click', () => {
      const t = tasks.find(x => x.id === currentReactivateId);
      if (t) {
        t.completed = false;
        t.history.push({ timestamp: new Date().toISOString(), action: 'Marked Active' });
        saveTasks();
        if (reactivateConfirmModal) reactivateConfirmModal.hide();
        renderCompleted(); 
        // Re-render the completed tasks list
      }
    });
  }
  // Handle reactivating a completed task

  renderCompleted(); 
  // Initial render of completed tasks
}
// Completed.htm - Completed tasks that are marked as complete

if (document.getElementById('deletedList')) {
  const list = document.getElementById('deletedList');
  let currentRecoverId = null;
  let recoverConfirmModal = new bootstrap.Modal(document.getElementById('recoverConfirmModal'));

  function renderDeleted() {
    list.innerHTML = ''; // Clear the deleted list
    tasks.filter(t => t.deleted).forEach(t => { // Filter deleted tasks
      const li = document.createElement('li');
      li.className = 'task-item list-group-item d-flex justify-content-between align-items-start';
      li.innerHTML = `
        <div>
          <strong>${t.title}</strong><br>
          <div>${t.body || ''}</div>
          <small>Deleted: ${t.history.filter(h => h.action === 'Deleted').pop()?.timestamp || ''}</small>
        </div>
        <div class="task-actions">
          <button class="btn btn-purple btn-sm recover-btn">Recover</button>
          <button class="btn btn-red btn-sm perm-delete-btn">Delete Permanently</button>
        </div>
      `;

      li.querySelector('.perm-delete-btn').addEventListener('click', () => {
        currentDeleteIdDeletedPage = t.id;
        if (deletedConfirmModal) deletedConfirmModal.show(); // Show permanent delete modal
      });
      // Event listener for permanently deleting the task
  
      li.querySelector('.recover-btn').addEventListener('click', () => {
        currentRecoverId = t.id;
        recoverConfirmModal.show(); // Show recovery confirmation modal
      });
      // Event listener for recovering the task

      list.appendChild(li); 
      // Append deleted task to the list
    });
  }
  // Render deleted tasks

  const deletedConfirmBtn = document.getElementById('deletedConfirmBtn');
  if (deletedConfirmBtn) {
    deletedConfirmBtn.addEventListener('click', () => {
      tasks = tasks.filter(x => x.id !== currentDeleteIdDeletedPage); // Permanently delete task
      saveTasks();
      deletedConfirmModal.hide(); // Close permanent delete modal
      renderDeleted(); 
      // Re-render deleted task list
    });
  }
  // Handle permanent deletion of tasks

  const recoverConfirmBtn = document.getElementById('recoverConfirmBtn');
  if (recoverConfirmBtn) {
    recoverConfirmBtn.addEventListener('click', () => {
      const t = tasks.find(x => x.id === currentRecoverId);
      if (t) {
        t.deleted = false;
        t.history.push({ timestamp: new Date().toISOString(), action: 'Recovered' });
        saveTasks();
        recoverConfirmModal.hide(); // Close recovery modal
        renderDeleted(); 
        // Re-render deleted tasks list
      }
    });
  }
  // Handle recovery of deleted tasks

  renderDeleted(); 
  // Initial render of deleted tasks
}
// Deleted.htm - Deleted tasks that are deleted