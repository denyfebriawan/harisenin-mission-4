// ===== Profile element references =====
const profileNameInput = document.getElementById('profileName');
const profilePositionInput = document.getElementById('profilePosition');

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

// Rendering, actions, and event wiring are added in the next parts.
