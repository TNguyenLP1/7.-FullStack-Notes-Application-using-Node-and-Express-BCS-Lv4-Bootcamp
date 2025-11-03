// --------------------------- // DOM ELEMENTS // ---------------------------

// Selecting key DOM elements for tasks, modals, and controls
const taskInput = document.getElementById('taskInput');
const taskBody = document.getElementById('taskBody');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
const deletedList = document.getElementById('deletedList');
const completedList = document.getElementById('completedList');
const filterSelect = document.getElementById('filter');
const darkModeToggle = document.getElementById('themeToggle');

// Task title warning element for user input validation
let titleWarning = null;
if (taskInput) {
  titleWarning = document.createElement('div');
  titleWarning.style.color = 'red';
  titleWarning.style.marginTop = '4px';
  titleWarning.style.fontSize = '0.9rem';
  titleWarning.style.display = 'none'; // Hidden by default
  taskInput.parentNode.appendChild(titleWarning);
}

// --------------------------- // MODALS // ---------------------------

// Initializing modals for editing, deleting, restoring, and reactivating tasks using Bootstrap
const editModalEl = document.getElementById('editModal');
const editModal = editModalEl ? new bootstrap.Modal(editModalEl) : null;
const editForm = document.getElementById('editForm');
const editTitle = document.getElementById('editTitle');
const editBody = document.getElementById('editBody');
const editPreview = document.getElementById('editPreview');
const editConfirmBtn = document.getElementById('editConfirmBtn');

const deleteModalEl = document.getElementById('deleteModal');
const deleteModal = deleteModalEl ? new bootstrap.Modal(deleteModalEl) : null;
const deleteConfirmBtn = document.getElementById('deleteConfirmBtnIndex');

const deletedConfirmModalEl = document.getElementById('deletedConfirmModal');
const deletedConfirmModal = deletedConfirmModalEl ? new bootstrap.Modal(deletedConfirmModalEl) : null;
const deletedConfirmBtn = document.getElementById('deletedConfirmBtn');

const editConfirmModalEl = document.getElementById('editConfirmModal');
const editConfirmModal = editConfirmModalEl ? new bootstrap.Modal(editConfirmModalEl) : null;

const recoverConfirmModalEl = document.getElementById('recoverConfirmModal');
const recoverConfirmModal = recoverConfirmModalEl ? new bootstrap.Modal(recoverConfirmModalEl) : null;
const recoverConfirmBtn = document.getElementById('recoverConfirmBtn');

const reactivateConfirmModalEl = document.getElementById('reactivateConfirmModal');
const reactivateConfirmModal = reactivateConfirmModalEl ? new bootstrap.Modal(reactivateConfirmModalEl) : null;
const reactivateConfirmBtn = document.getElementById('reactivateConfirmBtn');

// --------------------------- // DARK MODE // ---------------------------

// Dark mode toggle, saves user preference in localStorage
if (darkModeToggle) {
  const darkModeKey = 'darkMode';
  if (localStorage.getItem(darkModeKey) === 'true') {
    document.body.classList.add('dark-mode'); // Load dark mode on page load
  }

  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode'); // Toggle dark mode on/off
    localStorage.setItem(darkModeKey, document.body.classList.contains('dark-mode'));
  });
}

// --------------------------- // FETCH TASKS // ---------------------------

// Function to fetch tasks from the server, filtered by status (all, active, completed, deleted)
async function fetchTasks(filter = 'all') {
  try {
    let url = '/api/notes';
    if (filter === 'active') url += '?status=active';
    if (filter === 'completed') url += '?status=completed';
    if (filter === 'deleted') url += '?deleted=true';

    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status); // Handle fetch errors
    return await res.json(); // Return JSON data (tasks)
  } catch (err) {
    console.error('Fetch tasks failed:', err);
    return []; // Return empty array on failure
  }
}

// --------------------------- // SERVER ACTIONS // ---------------------------

// Add a new task to the server
async function addTaskToServer(title, body) {
  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    });
    if (!res.ok) throw new Error(res.status);
    return await res.json(); // Return the created task
  } catch (err) {
    console.error('Add task failed', err);
    return null; // Return null on error
  }
}

// Update a task on the server
async function updateTaskOnServer(task) {
  try {
    const res = await fetch(`/api/notes/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: task.title, body: task.body }),
    });
    if (!res.ok) throw new Error(res.status);
    return await res.json(); // Return updated task
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Toggle the "completed" status of a task on the server
async function toggleComplete(task, completed) {
  try {
    const res = await fetch(`/api/notes/${task.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) throw new Error(res.status);
    return await res.json(); // Return the updated task
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Delete a task from the server (soft delete)
async function deleteTask(task) {
  try {
    const res = await fetch(`/api/notes/${task.id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(res.status);
    return await res.json(); // Return the deleted task
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Restore a deleted task from the server
async function restoreTask(task) {
  try {
    const res = await fetch(`/api/notes/${task.id}/restore`, { method: 'POST' });
    if (!res.ok) throw new Error(res.status);
    return await res.json(); // Return restored task
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Permanently delete a task from the server
async function permanentDeleteTask(task) {
  try {
    const res = await fetch(`/api/notes/${task.id}/permanent`, { method: 'DELETE' });
    if (!res.ok) throw new Error(res.status);
    return await res.json(); // Return the permanently deleted task
  } catch (err) {
    console.error(err);
    return null;
  }
}

// --------------------------- // CREATE BUTTON // ---------------------------

// Helper function to create buttons with specific text, color class, and event handler
function createButton(text, colorClass, handler) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.className = `btn ${colorClass} mx-1`;
  btn.style.color = 'white';
  btn.addEventListener('mouseenter', () => btn.style.filter = 'brightness(85%)'); // Button hover effect
  btn.addEventListener('mouseleave', () => btn.style.filter = 'brightness(100%)');
  btn.addEventListener('click', handler); // Button click event handler
  return btn;
}

// --------------------------- // RENDER TASKS // ---------------------------

// Render tasks into the correct container (active, deleted, or completed)
function renderTasks(tasks, containerType = 'active') {
  let container;
  if (containerType === 'active') container = taskList;
  if (containerType === 'deleted') container = deletedList;
  if (containerType === 'completed') container = completedList;
  if (!container) return; // Exit if container is not found
  container.innerHTML = ''; // Clear existing tasks

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start mb-1';
    const content = document.createElement('div');
    content.innerHTML = `<strong>${task.title}</strong><br>${task.body || ''}`;
    li.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'd-flex';

    // ---------------------------// ACTIVE TASKS //---------------------------
    if (containerType === 'active') {
      actions.appendChild(createButton(task.completed ? 'Undo' : 'Complete', 'btn-success', async () => {
        await toggleComplete(task, !task.completed);
        loadTasks(); // Reload tasks after completion status change
      }));

      actions.appendChild(createButton('Edit', 'btn-primary', () => openEditModal(task)));
      actions.appendChild(createButton('Delete', 'btn-danger', () => {
        if (!deleteModal) return;
        deleteConfirmBtn.onclick = async () => {
          await deleteTask(task);
          deleteModal.hide();
          loadTasks(); // Reload tasks after deletion
        };
        deleteModal.show();
      }));
    }

    // ---------------------------// DELETED TASKS //---------------------------
    if (containerType === 'deleted') {
      actions.appendChild(createButton('Restore', 'btn-purple', () => {
        if (!recoverConfirmModal) return;
        recoverConfirmBtn.onclick = async () => {
          await restoreTask(task);
          recoverConfirmModal.hide();
                    loadTasks(); // Reload tasks after restoring
        };
        recoverConfirmModal.show();
      }));

      actions.appendChild(createButton('Permanent', 'btn-danger', () => {
        if (!deletedConfirmModal) return;
        deletedConfirmBtn.onclick = async () => {
          await permanentDeleteTask(task);
          deletedConfirmModal.hide();
          loadTasks(); // Reload tasks after permanent deletion
        };
        deletedConfirmModal.show();
      }));
    }

    // ---------------------------// COMPLETED TASKS //---------------------------
    if (containerType === 'completed') {
      actions.appendChild(createButton('Mark Active', 'btn-success', () => {
        if (!reactivateConfirmModal) return;
        reactivateConfirmBtn.onclick = async () => {
          await toggleComplete(task, false); // Reactivate the task (mark as active)
          reactivateConfirmModal.hide();
          loadTasks(); // Reload tasks after reactivation
        };
        reactivateConfirmModal.show();
      }));
    }

    li.appendChild(actions); // Append the actions (buttons) to the task list item
    container.appendChild(li); // Add the list item to the appropriate container (active, deleted, or completed)
  });
}

// --------------------------- // LOAD TASKS // ---------------------------

// Function to load tasks for different categories (active, deleted, completed)
async function loadTasks() {
  if (taskList) {
    const activeTasks = await fetchTasks('active');
    renderTasks(activeTasks, 'active'); // Render active tasks
  }

  if (deletedList) {
    const deletedTasks = await fetchTasks('deleted');
    renderTasks(deletedTasks, 'deleted'); // Render deleted tasks
  }

  if (completedList) {
    const completedTasks = await fetchTasks('completed');
    renderTasks(completedTasks, 'completed'); // Render completed tasks
  }
}

// --------------------------- // ADD TASK // ---------------------------

// Add a new task when the "Add Task" button is clicked
if (addTaskButton) {
  addTaskButton.addEventListener('click', async () => {
    const title = taskInput.value.trim(); // Get the task title
    const body = taskBody.value.trim(); // Get the task body (optional)

    // Check if the title is empty and display a warning if it is
    if (!title) {
      if (titleWarning) titleWarning.textContent = 'Task title is required!';
      titleWarning.style.display = 'block'; // Show the warning
      return;
    } else if (titleWarning) {
      titleWarning.style.display = 'none'; // Hide the warning if the title is valid
    }

    // Add the task to the server and reload tasks
    const newTask = await addTaskToServer(title, body);
    if (newTask) {
      taskInput.value = ''; // Clear input fields after task is added
      taskBody.value = '';
      loadTasks(); // Reload tasks to show the new one
    }
  });
}

// --------------------------- // EDIT MODAL // ---------------------------

// Function to open the edit modal and allow task modification
function openEditModal(task) {
  if (!editModal) return;
  editTitle.value = task.title; // Pre-fill the title input
  editBody.value = task.body; // Pre-fill the body input

  // Function to update the preview of changes in the modal
  const updatePreview = () => {
    editPreview.innerHTML = `<div><s>${task.title}</s> → ${editTitle.value}</div>
                             <div><s>${task.body}</s> → ${editBody.value}</div>`;
  };

  // Update the preview on input change
  editTitle.oninput = updatePreview;
  editBody.oninput = updatePreview;

  updatePreview(); // Initial preview

  editModal.show(); // Show the edit modal

  // Handle the form submission for updating the task
async function performUpdate() {
  // Disable the confirm button while we wait to avoid double-clicks
  if (editConfirmBtn) editConfirmBtn.disabled = true;
  task.title = editTitle.value;
  task.body = editBody.value;
  await updateTaskOnServer(task);
  if (editModal) editModal.hide();
  loadTasks();
  if (editConfirmBtn) editConfirmBtn.disabled = false;
}

// When the form is submitted, show the confirmation modal instead of immediately updating:
editForm.onsubmit = (e) => {
  e.preventDefault();

  // If confirmation modal not present (fallback), perform update immediately
  if (!editConfirmModal || !editConfirmBtn) {
    performUpdate();
    return;
  }

  // Set a one-shot onclick handler: overwrite previous handler to avoid multiple handlers
  editConfirmBtn.onclick = async () => {
    await performUpdate();
    editConfirmModal.hide();
    // clear the onclick to avoid keeping references (optional)
    editConfirmBtn.onclick = null;
  };

  // Show the confirmation modal
  editConfirmModal.show();
}
};

// --------------------------- // INITIAL LOAD // ---------------------------

// Initial load of tasks for all categories (active, deleted, completed)
loadTasks();