const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskCount = document.getElementById('taskCount');
const clearCompleted = document.getElementById('clearCompleted');
const emptyState = document.getElementById('emptyState');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

init();

function init() {
    renderTasks();
    updateTaskCount();
    
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

function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        taskInput.classList.add('shake');
        setTimeout(() => taskInput.classList.remove('shake'), 500);
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };
    
    tasks.unshift(task);
    saveTasks();
    renderTasks();
    updateTaskCount();
    
    taskInput.value = '';
    taskInput.focus();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateTaskCount();
}

function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
    updateTaskCount();
}

function editTask(id, newText) {
    if (newText.trim() === '') return;
    
    tasks = tasks.map(task => 
        task.id === id ? { ...task, text: newText.trim() } : task
    );
    saveTasks();
    renderTasks();
}

function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateTaskCount();
}

function renderTasks() {
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    if (filteredTasks.length === 0) {
        emptyState.classList.add('show');
        taskList.style.display = 'none';
    } else {
        emptyState.classList.remove('show');
        taskList.style.display = 'block';
    }
    
    taskList.innerHTML = '';
    
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
    
    addTaskEventListeners();
}

function addTaskEventListeners() {
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            toggleTask(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteTask(id);
        });
    });
    
    document.querySelectorAll('.task-text').forEach(text => {
        text.addEventListener('dblclick', (e) => {
            const id = parseInt(e.target.dataset.id);
            const currentText = e.target.textContent;
            
            e.target.contentEditable = true;
            e.target.classList.add('editing');
            e.target.focus();
            
            const range = document.createRange();
            range.selectNodeContents(e.target);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
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

function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
