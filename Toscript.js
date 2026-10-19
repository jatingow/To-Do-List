const STORAGE_KEY = "neo_tasks_list";

const input = document.getElementById("taskInput");
const tasklist = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalCountEl = document.getElementById("totalCount");
const pendingCountEl = document.getElementById("pendingCount");
const doneCountEl = document.getElementById("doneCount");
const progressBarEl = document.getElementById("progressBar");
const progressPercentEl = document.getElementById("progressPercent");

let currentFilter = "all";
let tasks = [];

// Load tasks from LocalStorage
function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Filter out any leftover sample/default tasks
      tasks = JSON.parse(stored).filter(
        t => t.id !== "task-1" && t.id !== "task-2" && t.id !== "task-3"
      );
    } else {
      tasks = [];
    }
    saveTasks();
  } catch (error) {
    console.error("Failed to load tasks from localStorage:", error);
    tasks = [];
  }
}

// Save tasks to LocalStorage
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save tasks to localStorage:", error);
  }
}

// Add a new task
function addTask() {
  const taskText = input.value.trim();

  if (taskText === "") {
    input.focus();
    input.style.borderColor = "var(--neo-pink)";
    input.placeholder = "⚠️ Please write something first!";
    setTimeout(() => {
      input.style.borderColor = "";
      input.placeholder = "Type a task and hit Enter...";
    }, 1800);
    return;
  }

  const newTask = {
    id: "task_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    name: taskText,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
  updateStats();

  input.value = "";
  input.focus();
}

// Toggle Task Completion Status
function toggleTask(taskId) {
  const taskIndex = tasks.findIndex(t => String(t.id) === String(taskId));
  if (taskIndex !== -1) {
    const wasCompleted = tasks[taskIndex].completed;
    tasks[taskIndex].completed = !wasCompleted;
    saveTasks();
    renderTasks();
    updateStats();

    // Trigger celebratory confetti if all tasks are completed
    const allDone = tasks.length > 0 && tasks.every(t => t.completed);
    if (!wasCompleted && allDone) {
      launchConfetti();
    }
  }
}

// Delete a single task
function deleteTask(taskId) {
  const li = document.getElementById(`item-${taskId}`);
  if (li) {
    li.style.transform = "scale(0.8) translateY(10px)";
    li.style.opacity = "0";
    setTimeout(() => {
      tasks = tasks.filter(t => String(t.id) !== String(taskId));
      saveTasks();
      renderTasks();
      updateStats();
    }, 150);
  } else {
    tasks = tasks.filter(t => String(t.id) !== String(taskId));
    saveTasks();
    renderTasks();
    updateStats();
  }
}

// Clear all completed tasks
function clearCompleted() {
  const hadCompleted = tasks.some(t => t.completed);
  if (!hadCompleted) return;

  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
  updateStats();
}

// Filter tasks (all / active / completed)
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderTasks();
}

// Create Task List Item DOM element
function createTaskItem(taskObject) {
  const li = document.createElement("li");
  li.className = `task-item ${taskObject.completed ? "done" : ""}`;
  li.id = `item-${taskObject.id}`;

  // Left Section (Checkbox + Text)
  const leftDiv = document.createElement("div");
  leftDiv.className = "task-left";

  const completeBtn = document.createElement("button");
  completeBtn.className = "complete-btn";
  completeBtn.setAttribute("aria-label", taskObject.completed ? "Mark incomplete" : "Mark complete");
  completeBtn.innerHTML = taskObject.completed ? "✓" : "";
  completeBtn.onclick = () => toggleTask(taskObject.id);

  const spanText = document.createElement("span");
  spanText.className = "task-text";
  spanText.textContent = taskObject.name;

  leftDiv.appendChild(completeBtn);
  leftDiv.appendChild(spanText);

  // Right Section (Delete Button)
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.setAttribute("aria-label", "Delete task");
  deleteBtn.innerHTML = "✕";
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteTask(taskObject.id);
  };

  li.appendChild(leftDiv);
  li.appendChild(deleteBtn);

  return li;
}

// Render the list of tasks based on active filter
function renderTasks() {
  tasklist.innerHTML = "";

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true; // "all"
  });

  if (filteredTasks.length === 0) {
    emptyState.classList.remove("hidden");
    if (tasks.length > 0 && currentFilter !== "all") {
      emptyState.querySelector(".empty-title").textContent = "No tasks found";
      emptyState.querySelector(".empty-subtitle").textContent =
        currentFilter === "active"
          ? "No active tasks! You're either resting or done."
          : "No completed tasks yet. Finish something!";
    } else {
      emptyState.querySelector(".empty-title").textContent = "All Caught Up!";
      emptyState.querySelector(".empty-subtitle").textContent =
        "No tasks in sight. Enjoy the calm or create a new mission.";
    }
  } else {
    emptyState.classList.add("hidden");
    filteredTasks.forEach(task => {
      tasklist.appendChild(createTaskItem(task));
    });
  }
}

// Update stats numbers and progress bar
function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pending = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  if (totalCountEl) totalCountEl.textContent = total;
  if (pendingCountEl) pendingCountEl.textContent = pending;
  if (doneCountEl) doneCountEl.textContent = done;
  if (progressBarEl) progressBarEl.style.width = `${percent}%`;
  if (progressPercentEl) progressPercentEl.textContent = `${percent}%`;

  const clearBtn = document.getElementById("clearCompletedBtn");
  if (clearBtn) {
    clearBtn.style.opacity = done > 0 ? "1" : "0.5";
    clearBtn.style.pointerEvents = done > 0 ? "auto" : "none";
  }
}

// Keyboard shortcuts
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

// ==========================================================================
// LIGHTWEIGHT NEO-BRUTALIST CONFETTI EFFECT
// ==========================================================================
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiCount = 60;
  const colors = ["#ffe600", "#ff5470", "#2ceaa3", "#a388ee", "#38bdf8", "#121212"];
  const pieces = [];

  for (let i = 0; i < confettiCount; i++) {
    pieces.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.4,
      size: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 1) * 12 - 4,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 15,
      opacity: 1
    });
  }

  let animationFrame;
  let duration = 90;

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (let p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.vRot;
      p.opacity -= 0.012;

      if (p.opacity > 0 && p.y < canvas.height + 20) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = "#121212";
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    }

    duration--;
    if (alive && duration > 0) {
      animationFrame = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  frame();
}

window.addEventListener("resize", () => {
  const canvas = document.getElementById("confettiCanvas");
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

// App Initialization
window.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  renderTasks();
  updateStats();
});
