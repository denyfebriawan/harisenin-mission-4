// ===== Profile element references =====
const profileNameInput = document.getElementById('profileName');
const profilePositionInput = document.getElementById('profilePosition');

// ===== List element references =====
const todoList = document.getElementById('todoList');
const overdueList = document.getElementById('overdueList');
const doneList = document.getElementById('doneList');
const taskCardTemplate = document.getElementById('taskCardTemplate');

// ===== Form & button element references =====
const taskForm = document.getElementById('taskForm');
const taskTextInput = document.getElementById('taskText');
const taskPriorityInput = document.getElementById('taskPriority');
const taskDueDateInput = document.getElementById('taskDueDate');
const deleteAllBtn = document.getElementById('deleteAllBtn');

// ===== State =====
// Load any previously saved tasks from localStorage. localStorage only stores
// strings, so we JSON.parse the saved string back into a real array of objects.
// If nothing was saved yet, `tasks` starts as an empty array.
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// ===== Profile: load saved values, and save on every keystroke =====
profileNameInput.value = localStorage.getItem('profileName') || '';
profilePositionInput.value = localStorage.getItem('profilePosition') || '';

profileNameInput.addEventListener('input', () => {
  localStorage.setItem('profileName', profileNameInput.value);
});

profilePositionInput.addEventListener('input', () => {
  localStorage.setItem('profilePosition', profilePositionInput.value);
});

// ===== Helpers =====

// Persist the current `tasks` array to localStorage as a JSON string.
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Format an ISO date string into something readable, e.g. "Sun, 27 Sep 2026, 14:30".
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// A task counts as overdue when it is not done AND its due date has already passed.
function isOverdue(task) {
  return !task.done && new Date(task.dueDate) < new Date();
}

// Maps a priority string to the Tailwind classes for its badge color.
function priorityBadgeClasses(priority) {
  switch (priority) {
    case 'high':
      return 'bg-rose-100 text-rose-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    case 'low':
    default:
      return 'bg-emerald-100 text-emerald-700';
  }
}

// ===== Rendering =====

// Builds one task card (cloned from the <template> in index.html) and wires up
// its checkbox / delete button to that specific task's id.
function createTaskCard(task) {
  const fragment = taskCardTemplate.content.cloneNode(true);
  const card = fragment.querySelector('.task-card');

  const checkbox = fragment.querySelector('.task-checkbox');
  const textEl = fragment.querySelector('.task-text');
  const badgeEl = fragment.querySelector('.priority-badge');
  const createdEl = fragment.querySelector('.created-at');
  const dueEl = fragment.querySelector('.due-at');
  const deleteBtn = fragment.querySelector('.delete-btn');

  checkbox.checked = task.done;
  textEl.textContent = task.text;
  badgeEl.textContent = task.priority;
  badgeEl.className = `priority-badge px-2 py-0.5 rounded-full font-medium ${priorityBadgeClasses(task.priority)}`;
  createdEl.textContent = `Created: ${formatDate(task.createdAt)}`;
  dueEl.textContent = `Due: ${formatDate(task.dueDate)}`;

  if (task.done) {
    card.classList.add('is-done');
    textEl.classList.add('is-done');
  }
  if (isOverdue(task)) {
    dueEl.classList.add('is-late');
  }

  // Toggle done/undone when the checkbox is clicked.
  checkbox.addEventListener('change', () => toggleDone(task.id));

  // Remove this single task when its delete button is clicked.
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  return fragment;
}

// Clears a list container and either shows an empty-state message, or fills it
// with task cards built from `items`.
function renderList(container, items, emptyMessage) {
  container.innerHTML = '';

  if (items.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'text-sm text-slate-400 italic';
    msg.textContent = emptyMessage;
    container.appendChild(msg);
    return;
  }

  items.forEach((task) => {
    container.appendChild(createTaskCard(task));
  });
}

// Sorts `tasks` into the three buckets (overdue / to do / done) and re-renders
// all three lists. Called after every change to `tasks`.
function render() {
  const overdueTasks = tasks.filter((t) => isOverdue(t));
  const doneTasks = tasks.filter((t) => t.done);
  const todoTasks = tasks.filter((t) => !t.done && !isOverdue(t));

  renderList(overdueList, overdueTasks, 'No overdue tasks.');
  renderList(todoList, todoTasks, 'Nothing to do yet.');
  renderList(doneList, doneTasks, 'No finished tasks yet.');
}

// ===== Actions that change state =====

function addTask(text, priority, dueDate) {
  const newTask = {
    id: crypto.randomUUID(),
    text,
    priority,
    dueDate,
    createdAt: new Date().toISOString(),
    done: false,
  };

  tasks.push(newTask);
  saveTasks();
  render();
}

function toggleDone(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function deleteAllTasks() {
  if (tasks.length === 0) return;
  const confirmed = confirm('Delete ALL tasks? This cannot be undone.');
  if (!confirmed) return;
  tasks = [];
  saveTasks();
  render();
}

// ===== Event listeners for the form and buttons =====

taskForm.addEventListener('submit', (event) => {
  // Stop the browser from doing its default full-page reload on form submit.
  event.preventDefault();

  const text = taskTextInput.value.trim();
  const priority = taskPriorityInput.value;
  const dueDate = taskDueDateInput.value;

  if (!text || !dueDate) return;

  addTask(text, priority, dueDate);

  // Reset the form so it's ready for the next task.
  taskForm.reset();
  taskPriorityInput.value = 'medium';
});

deleteAllBtn.addEventListener('click', deleteAllTasks);

// ===== Keep the overdue status live =====
// A task can "become" overdue purely because time passed, even with no user
// action. Re-render every 30 seconds so it moves from To Do to Overdue on its own.
setInterval(render, 30000);

// ===== Initial render on page load =====
render();
