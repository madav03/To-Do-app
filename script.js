// Simple To-Do List: add, complete, filter and delete tasks.

// Find the HTML elements that JavaScript needs to use.
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyMessage = document.querySelector("#empty-message");
const statusMessage = document.querySelector("#status-message");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter");

// Load previously saved tasks from this browser, or start with an empty list.
const STORAGE_KEY = "simple-todo-tasks-v1";
let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    // If saved browser data is damaged, do not crash the whole app.
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function showStatus(message) {
  statusMessage.textContent = message;
}

// Return only the tasks that match the selected filter.
function getVisibleTasks() {
  if (currentFilter === "active") return tasks.filter((task) => !task.completed);
  if (currentFilter === "completed") return tasks.filter((task) => task.completed);
  return tasks;
}

// Draw the visible tasks in the page. User text is inserted with textContent.
function renderTasks() {
  taskList.replaceChildren();
  const visibleTasks = getVisibleTasks();

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = task.completed ? "task-item completed" : "task-item";
    item.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.text} as completed`);

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  });

  taskCount.textContent = tasks.filter((task) => !task.completed).length;
  emptyMessage.hidden = visibleTasks.length > 0;
  if (tasks.length === 0) {
    emptyMessage.textContent = "No tasks yet. Add one above to get started.";
  } else if (visibleTasks.length === 0) {
    emptyMessage.textContent = "No tasks match this filter.";
  }
}

// Add a task when the form is submitted.
taskForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Stop a page reload.
  const text = taskInput.value.trim();
  if (!text) {
    showStatus("Please enter a task first.");
    return;
  }

  const newTask = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: text,
    completed: false
  };
  tasks.unshift(newTask); // Put the newest task at the top.
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
  showStatus("Task added.");
});

// Event delegation: one listener on the parent handles all checkboxes.
taskList.addEventListener("change", (event) => {
  if (!event.target.matches(".task-check")) return;
  const item = event.target.closest(".task-item");
  const task = tasks.find((entry) => entry.id === item.dataset.id);
  if (!task) return;
  task.completed = event.target.checked;
  saveTasks();
  renderTasks();
  showStatus(task.completed ? "Task completed." : "Task marked active.");
});

// One click listener also handles each Delete button.
taskList.addEventListener("click", (event) => {
  if (!event.target.matches(".delete-button")) return;
  const item = event.target.closest(".task-item");
  tasks = tasks.filter((task) => task.id !== item.dataset.id);
  saveTasks();
  renderTasks();
  showStatus("Task deleted.");
});

// Switch among All, Active and Completed filters.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    renderTasks();
  });
});

// Remove all completed tasks in one action.
clearCompletedButton.addEventListener("click", () => {
  const oldLength = tasks.length;
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
  showStatus(oldLength === tasks.length ? "There are no completed tasks to clear." : "Completed tasks cleared.");
});

// Display saved tasks immediately when the page opens.
renderTasks();
