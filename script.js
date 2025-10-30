// Get DOM elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskCount = document.getElementById('taskCount');
const clearCompleted = document.getElementById('clearCompleted');
const emptyState = document.getElementById('emptyState');

// Initialize tasks array from localStorage or empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initialize the app
init();

function init() {
    renderTasks();
    updateTaskCount();
    
    // Event listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    clearCompleted.addEventListener('click', clearCompletedTasks);
}

// Add new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        // Add a shake animation to the input if empty
        taskInput.classList.add('shake');
        setTimeout(() => taskInput.classList.remove('shake'), 500);
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };
    
    tasks.unshift(task); // Add to beginning of array
    saveTasks();
    renderTasks();
    updateTaskCount();
    
    taskInput.value = '';
    taskInput.focus();
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateTaskCount();
}

// Toggle task completion
function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
    updateTaskCount();
}

// Edit task
function editTask(id, newText) {
    if (newText.trim() === '') return;
    
    tasks = tasks.map(task => 
        task.id === id ? { ...task, text: newText.trim() } : task
    );
    saveTasks();
    renderTasks();
}

// Clear completed tasks
function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateTaskCount();
}

// Render tasks to DOM
function renderTasks() {
    // Filter tasks based on current filter
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Show/hide empty state
    if (filteredTasks.length === 0) {
        emptyState.classList.add('show');
        taskList.style.display = 'none';
    } else {
        emptyState.classList.remove('show');
        taskList.style.display = 'block';
    }
    
    // Clear current list
    taskList.innerHTML = '';
    
    // Render each task
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
            <span class="task-text" data-id="${task.id}">${task.text}</span>
            <button class="delete-btn" data-id="${task.id}">×</button>
        `;
        
        taskList.appendChild(li);
    });
    
    // Add event listeners to new elements
    addTaskEventListeners();
}

// Add event listeners to task elements
function addTaskEventListeners() {
    // Checkbox click
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            toggleTask(id);
        });
    });
    
    // Delete button click
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteTask(id);
        });
    });
    
    // Double-click to edit
    document.querySelectorAll('.task-text').forEach(text => {
        text.addEventListener('dblclick', (e) => {
            const id = parseInt(e.target.dataset.id);
            const currentText = e.target.textContent;
            
            e.target.contentEditable = true;
            e.target.classList.add('editing');
            e.target.focus();
            
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(e.target);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Save on blur or enter
            const saveEdit = () => {
                e.target.contentEditable = false;
                e.target.classList.remove('editing');
                const newText = e.target.textContent;
                
                if (newText.trim() === '') {
                    e.target.textContent = currentText;
                } else {
                    editTask(id, newText);
                }
            };
            
            e.target.addEventListener('blur', saveEdit, { once: true });
            e.target.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            });
        });
    });
}

// Update task count
function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}