// ----------------------
// app.js - fully working with delete, edit, and added confirmation modals
// ----------------------

const STORAGE_KEY = 'tri-nguyen-tasks';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// Utility functions
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Modal instances
let editModal = null;
let deleteModal = null;
let editConfirmModal = null;
let reactivateConfirmModal = null;
let deletedConfirmModal = null;

let currentEditId = null;
let currentDeleteId = null;
let currentReactivateId = null;
let currentDeleteIdDeletedPage = null;

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

// ----------------------
// THEME TOGGLE
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Initialize from localStorage
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (themeToggle) {
      themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
      themeToggle.classList.add('dark');
    }
  }

  // Toggle dark mode
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
});

// ----------------------
// INDEX PAGE
// ----------------------
if (document.getElementById('taskList')) {
  const taskInput = document.getElementById('taskInput');
  const taskBodyInput = document.getElementById('taskBody');
  const addBtn = document.getElementById('addTaskButton');
  const errorMsg = document.getElementById('error-message');
  const editTitle = document.getElementById('editTitle');
  const editBody = document.getElementById('editBody');
  const editPreview = document.getElementById('editPreview');

  // Add task
  addBtn.addEventListener('click', () => {
    const title = taskInput.value.trim();
    const body = taskBodyInput.value.trim();
    if (!title) { errorMsg.textContent = 'Task title required'; return; }
    const newTask = {
      id: generateId(),
      title,
      body,
      completed: false,
      deleted: false,
      history: [],
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    taskBodyInput.value = '';
    renderList();
  });

  // Render index tasks
  function renderList() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks.filter(t => !t.completed && !t.deleted).forEach(t => {
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
        renderList();
      });

      li.querySelector('.edit-btn').addEventListener('click', () => {
        currentEditId = t.id;
        editTitle.value = t.title;
        editBody.value = t.body;
        updateEditPreview(t);
        editModal.show();
      });

      li.querySelector('.delete-btn').addEventListener('click', () => {
        currentDeleteId = t.id;
        if (deleteModal) deleteModal.show();
      });

      list.appendChild(li);
    });
  }

  function updateEditPreview(task) {
    editPreview.innerHTML = `
      <div><strong>Title</strong>: <s>${task.title}</s> → ${editTitle.value}</div>
      <div><strong>Body</strong>: <s>${task.body || ''}</s> → ${editBody.value}</div>
    `;
  }

  editTitle.addEventListener('input', () => {
    const t = tasks.find(x => x.id === currentEditId);
    if (t) updateEditPreview(t);
  });
  editBody.addEventListener('input', () => {
    const t = tasks.find(x => x.id === currentEditId);
    if (t) updateEditPreview(t);
  });

  // Edit modal submit -> open confirmation modal
  document.getElementById('editForm').addEventListener('submit', e => {
    e.preventDefault();
    if (editConfirmModal) editConfirmModal.show();
  });

  // Confirm edit
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
        editConfirmModal.hide();
        editModal.hide();
        renderList();
      }
    });
  }

  // Delete confirmation
  const deleteConfirmBtn = document.getElementById('deleteConfirmBtnIndex');
  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener('click', () => {
      const t = tasks.find(x => x.id === currentDeleteId);
      if (t) {
        t.deleted = true;
        t.history.push({ timestamp: new Date().toISOString(), action: 'Deleted' });
        saveTasks();
        deleteModal.hide();
        renderList();
      }
    });
  }

  renderList();
}

// ----------------------
// COMPLETED PAGE
// ----------------------
if (document.getElementById('completedList')) {
  const list = document.getElementById('completedList');

  function renderCompleted() {
    list.innerHTML = '';
    tasks.filter(t => t.completed && !t.deleted).forEach(t => {
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
        if (reactivateConfirmModal) reactivateConfirmModal.show();
      });
      list.appendChild(li);
    });
  }

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
      }
    });
  }

  renderCompleted();
}

// ----------------------
// DELETED PAGE
// ----------------------
if (document.getElementById('deletedList')) {
  const list = document.getElementById('deletedList');
  let currentRecoverId = null;
  let recoverConfirmModal = new bootstrap.Modal(document.getElementById('recoverConfirmModal'));

  function renderDeleted() {
    list.innerHTML = '';
    tasks.filter(t => t.deleted).forEach(t => {
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
        if (deletedConfirmModal) deletedConfirmModal.show();
      });

      li.querySelector('.recover-btn').addEventListener('click', () => {
        currentRecoverId = t.id;
        recoverConfirmModal.show();
      });

      list.appendChild(li);
    });
  }

  const deletedConfirmBtn = document.getElementById('deletedConfirmBtn');
  if (deletedConfirmBtn) {
    deletedConfirmBtn.addEventListener('click', () => {
      tasks = tasks.filter(x => x.id !== currentDeleteIdDeletedPage);
      saveTasks();
      deletedConfirmModal.hide();
      renderDeleted();
    });
  }

  const recoverConfirmBtn = document.getElementById('recoverConfirmBtn');
  if (recoverConfirmBtn) {
    recoverConfirmBtn.addEventListener('click', () => {
      const t = tasks.find(x => x.id === currentRecoverId);
      if (t) {
        t.deleted = false;
        t.history.push({ timestamp: new Date().toISOString(), action: 'Recovered' });
        saveTasks();
        recoverConfirmModal.hide();
        renderDeleted();
      }
    });
  }

  renderDeleted();
}