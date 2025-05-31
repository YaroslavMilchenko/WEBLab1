document.addEventListener("DOMContentLoaded", function () {
    const todoList = document.querySelector("#todo .tasks-list");
    const inProgressList = document.querySelector("#in-progress .tasks-list");
    const doneList = document.querySelector("#done .tasks-list");
    let tasks = []; // Изначально пустой массив
    let editingTaskId = null;
    let isEditing = false;
  
    // Toggle mobile menu
    function toggleMenu() {
      const mobileMenu = document.getElementById("mobile-menu");
      mobileMenu.classList.toggle("show");
      document.querySelector(".burger").classList.toggle("open");
    }
  
    window.toggleMenu = toggleMenu;
  
    // Render tasks
    function renderTasks() {
      todoList.innerHTML = "";
      inProgressList.innerHTML = "";
      doneList.innerHTML = "";
  
      tasks.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.classList.add("task-card");
        taskCard.setAttribute("data-id", task.id);
        taskCard.innerHTML = `
          <h3>${task.name}</h3>
          <p>${task.date}</p>
          <select class="status-select" onchange="changeTaskStatus(${task.id}, this.value)">
            <option value="todo" ${task.status === "todo" ? "selected" : ""}>ToDo</option>
            <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>In Progress</option>
            <option value="done" ${task.status === "done" ? "selected" : ""}>Done</option>
          </select>
        `;
        taskCard.addEventListener("click", (e) => {
          // Предотвращаем открытие модального окна, если кликнули на выпадающий список
          if (e.target.tagName !== "SELECT") {
            openViewTaskModal(task.id);
          }
        });
  
        if (task.status === "todo") {
          todoList.appendChild(taskCard);
        } else if (task.status === "in-progress") {
          inProgressList.appendChild(taskCard);
        } else if (task.status === "done") {
          doneList.appendChild(taskCard);
        }
      });
    }
  
    // Change task status
    window.changeTaskStatus = function(taskId, newStatus) {
      const task = tasks.find(t => t.id == taskId);
      if (task) {
        task.status = newStatus;
        renderTasks();
      }
    };
  
    // Open Add Task Modal
    function openAddTaskModal() {
      document.getElementById("add-task-modal").style.display = "block";
    }
  
    window.openAddTaskModal = openAddTaskModal;
  
    // Close Add Task Modal
    function closeAddTaskModal() {
      document.getElementById("add-task-modal").style.display = "none";
    }
  
    window.closeAddTaskModal = closeAddTaskModal;
  
    // Open View/Edit Task Modal
    function openViewTaskModal(taskId) {
      const task = tasks.find(t => t.id == taskId);
      if (task) {
        editingTaskId = taskId;
        document.getElementById("view-task-name").textContent = task.name;
        document.getElementById("view-task-date").textContent = task.date;
        document.getElementById("view-task-description").textContent = task.description;
        document.getElementById("view-task-modal").style.display = "block";
        isEditing = false;
      }
    }
  
    window.openViewTaskModal = openViewTaskModal;
  
    // Edit Task
    function editTask() {
      const task = tasks.find(t => t.id == editingTaskId);
      if (task) {
        isEditing = true;
        document.getElementById("view-task-name").innerHTML = `<input type="text" id="edit-task-name" value="${task.name}">`;
        document.getElementById("view-task-date").innerHTML = `<input type="date" id="edit-task-date" value="${task.date.split('.').reverse().join('-')}">`;
        document.getElementById("view-task-description").innerHTML = `<textarea id="edit-task-description">${task.description}</textarea>`;
      }
    }
  
    window.editTask = editTask;
  
    // Save Task Changes
    function saveTaskChanges() {
      if (isEditing) {
        const task = tasks.find(t => t.id == editingTaskId);
        if (task) {
          task.name = document.getElementById("edit-task-name").value;
          task.date = formatDate(document.getElementById("edit-task-date").value);
          task.description = document.getElementById("edit-task-description").value;
          renderTasks();
        }
      }
      closeViewTaskModal();
    }
  
    window.saveTaskChanges = saveTaskChanges;
  
    // Close View Task Modal
    function closeViewTaskModal() {
      document.getElementById("view-task-modal").style.display = "none";
      editingTaskId = null;
      isEditing = false;
    }
  
    window.closeViewTaskModal = closeViewTaskModal;
  
    // Add Task
    document.getElementById("task-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const status = document.getElementById("task-status").value;
      const name = document.getElementById("task-name").value;
      const date = document.getElementById("task-date").value;
      const description = document.getElementById("task-description").value;
  
      if (name === "" || date === "") {
        alert("Please fill all required fields!");
        return;
      }
  
      const formattedDate = formatDate(date);
      const newTask = {
        id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        name,
        date: formattedDate,
        description,
        status
      };
  
      tasks.push(newTask);
      renderTasks();
      closeAddTaskModal();
    });
  
    // Delete Task
    function deleteTask() {
      if (confirm("Are you sure you want to delete this task?")) {
        tasks = tasks.filter(t => t.id !== editingTaskId);
        closeViewTaskModal();
        renderTasks();
      }
    }
  
    window.deleteTask = deleteTask;
  
    // Format Date
    function formatDate(dateStr) {
      const [year, month, day] = dateStr.split("-");
      return `${day}.${month}.${year}`;
    }
  
    // Notification handling (only for marking as read)
    const messages = document.querySelectorAll(".message");
    const notificationIndicator = document.querySelector(".notification-indicator");
  
    messages.forEach((message) => {
      message.addEventListener("click", () => {
        if (message.classList.contains("unread")) {
          message.classList.remove("unread");
          message.classList.add("read");
          notificationIndicator.classList.remove("active");
        }
      });
    });
  
    if (document.querySelector(".unread")) {
      notificationIndicator.classList.add("active");
    }
  
    // Initial render
    renderTasks();
  });