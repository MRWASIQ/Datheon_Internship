
var taskList = document.getElementById("taskList");
var taskModal = document.getElementById("taskModal");
var taskForm = document.getElementById("taskForm");

var addTaskButton = document.getElementById("addTaskButton");
var closeModal = document.getElementById("closeModal");
var cancelButton = document.getElementById("cancelButton");

var taskTitle = document.getElementById("taskTitle");
var taskDescription = document.getElementById("taskDescription");
var taskCategory = document.getElementById("taskCategory");
var taskDueDate = document.getElementById("taskDueDate");

var searchInput = document.getElementById("searchInput");
var filterButtons = document.querySelectorAll(".filter-button");

var modalTitle = document.getElementById("modalTitle");
var saveButton = document.getElementById("saveButton");

var totalTasks = document.getElementById("totalTasks");
var activeTasks = document.getElementById("activeTasks");
var completedTasks = document.getElementById("completedTasks");
var taskCount = document.getElementById("taskCount");

var currentFilter = "all";
var editingTaskId = null;


// Load tasks from localStorage

var savedTasks = localStorage.getItem("taskFlowTasks");
var tasks = [];

try {
    tasks = savedTasks ? JSON.parse(savedTasks) : [];

    if (!Array.isArray(tasks)) {
        tasks = [];
    }
} catch (error) {
    tasks = [];
}


// Set today's date

var today = new Date();

document.getElementById("todayDate").textContent =
    today.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });


// Get local date in YYYY-MM-DD format

function getTodayDate() {

    var date = new Date();

    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


// Save tasks

function saveTasks() {

    localStorage.setItem("taskFlowTasks", JSON.stringify(tasks));

}


// Open modal

function openModal() {

    taskModal.classList.add("active");

}


// Close modal

function closeTaskModal() {

    taskModal.classList.remove("active");

    taskForm.reset();

    editingTaskId = null;

    modalTitle.textContent = "Create New Task";
    saveButton.textContent = "Save Task";

}


// Add new task button

addTaskButton.addEventListener("click", function () {

    taskForm.reset();

    editingTaskId = null;

    modalTitle.textContent = "Create New Task";
    saveButton.textContent = "Save Task";

    taskDueDate.min = getTodayDate();

    openModal();

});


// Close modal buttons

closeModal.addEventListener("click", closeTaskModal);

cancelButton.addEventListener("click", closeTaskModal);


// Close modal when clicking outside

taskModal.addEventListener("click", function (event) {

    if (event.target === taskModal) {
        closeTaskModal();
    }

});


// Create and Update Task

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    var title = taskTitle.value.trim();
    var description = taskDescription.value.trim();
    var category = taskCategory.value;
    var dueDate = taskDueDate.value;

    if (title === "" || dueDate === "") {
        alert("Please enter the task title and due date.");
        return;
    }

    if (dueDate < getTodayDate() && editingTaskId === null) {
        alert("Please select today or a future due date.");
        return;
    }

    if (editingTaskId !== null) {

        var taskToUpdate = tasks.find(function (task) {
            return task.id === editingTaskId;
        });

        if (taskToUpdate) {

            taskToUpdate.title = title;
            taskToUpdate.description = description;
            taskToUpdate.category = category;
            taskToUpdate.dueDate = dueDate;

        }

    } else {

        var newTask = {
            id: Date.now(),
            title: title,
            description: description,
            category: category,
            dueDate: dueDate,
            completed: false
        };

        tasks.unshift(newTask);

    }

    saveTasks();

    renderTasks();

    closeTaskModal();

});


// Edit Task

function editTask(id) {

    var task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    editingTaskId = id;

    taskTitle.value = task.title;
    taskDescription.value = task.description;
    taskCategory.value = task.category;
    taskDueDate.value = task.dueDate;

    taskDueDate.min = getTodayDate();

    modalTitle.textContent = "Edit Task";
    saveButton.textContent = "Update Task";

    openModal();

}


// Delete Task

function deleteTask(id) {

    var confirmDelete = confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    tasks = tasks.filter(function (task) {
        return task.id !== id;
    });

    saveTasks();

    renderTasks();

}


// Complete or Activate Task

function toggleTask(id) {

    var task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    task.completed = !task.completed;

    saveTasks();

    renderTasks();

}


// Format date

function formatDate(dateValue) {

    var date = new Date(dateValue + "T00:00:00");

    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

}


// Create task card

function createTaskCard(task) {

    var card = document.createElement("div");

    card.className = "task-card";

    if (task.completed) {
        card.classList.add("completed");
    }


    // Checkbox

    var checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", function () {
        toggleTask(task.id);
    });


    // Task information

    var info = document.createElement("div");

    info.className = "task-info";

    var title = document.createElement("h3");

    title.textContent = task.title;

    var description = document.createElement("p");

    description.textContent = task.description || "No description provided.";


    // Task metadata

    var meta = document.createElement("div");

    meta.className = "task-meta";

    var category = document.createElement("span");

    category.className = "category-badge";
    category.textContent = task.category;

    var dueDate = document.createElement("span");

    dueDate.className = "due-date";

    dueDate.textContent = "Due: " + formatDate(task.dueDate);

    if (!task.completed && task.dueDate < getTodayDate()) {
        dueDate.classList.add("overdue");
        dueDate.textContent = "Overdue: " + formatDate(task.dueDate);
    }


    // Add metadata

    meta.appendChild(category);
    meta.appendChild(dueDate);

    info.appendChild(title);
    info.appendChild(description);
    info.appendChild(meta);


    // Action buttons

    var actions = document.createElement("div");

    actions.className = "task-actions";

    var editButton = document.createElement("button");

    editButton.className = "action-button";
    editButton.textContent = "✎";
    editButton.setAttribute("aria-label", "Edit task");

    editButton.addEventListener("click", function () {
        editTask(task.id);
    });


    var deleteButton = document.createElement("button");

    deleteButton.className = "action-button delete-button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");

    deleteButton.addEventListener("click", function () {
        deleteTask(task.id);
    });


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);


    // Complete card

    card.appendChild(checkbox);
    card.appendChild(info);
    card.appendChild(actions);

    return card;

}


// Render all tasks

function renderTasks() {

    taskList.innerHTML = "";

    var searchText = searchInput.value.toLowerCase().trim();

    var filteredTasks = tasks.filter(function (task) {

        var matchesFilter = true;

        if (currentFilter === "active") {
            matchesFilter = !task.completed;
        }

        if (currentFilter === "completed") {
            matchesFilter = task.completed;
        }

        var matchesSearch =
            task.title.toLowerCase().includes(searchText) ||
            task.description.toLowerCase().includes(searchText) ||
            task.category.toLowerCase().includes(searchText);

        return matchesFilter && matchesSearch;

    });


    // Display task cards

    if (filteredTasks.length === 0) {

        var emptyState = document.createElement("div");

        emptyState.className = "empty-state";

        var emptyIcon = document.createElement("span");
        emptyIcon.textContent = "📝";

        var emptyTitle = document.createElement("h3");
        emptyTitle.textContent = "No tasks found";

        var emptyText = document.createElement("p");
        emptyText.textContent = "Add a new task or change your search and filters.";

        emptyState.appendChild(emptyIcon);
        emptyState.appendChild(emptyTitle);
        emptyState.appendChild(emptyText);

        taskList.appendChild(emptyState);

    } else {

        filteredTasks.forEach(function (task) {

            var taskCard = createTaskCard(task);

            taskList.appendChild(taskCard);

        });

    }


    // Update statistics

    var total = tasks.length;

    var completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    var active = total - completed;

    totalTasks.textContent = total;
    activeTasks.textContent = active;
    completedTasks.textContent = completed;

    taskCount.textContent =
        "Showing " + filteredTasks.length + " of " + total + " tasks";

}


// Search tasks

searchInput.addEventListener("input", function () {

    renderTasks();

});


// Filter tasks

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        filterButtons.forEach(function (item) {
            item.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.getAttribute("data-filter");

        renderTasks();

    });

});


// Close modal with Escape key

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeTaskModal();
    }

});


// Initial display

renderTasks();
