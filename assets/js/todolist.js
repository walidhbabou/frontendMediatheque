document.addEventListener('DOMContentLoaded', function() {
    const todoList = document.getElementById('todo-list');
    const addTodoBtn = document.getElementById('add-todo');
    const todoModal = new bootstrap.Modal(document.getElementById('todoModal'));
    const todoForm = document.getElementById('todo-form');
    const saveTodoBtn = document.getElementById('save-todo');
    const searchTodoInput = document.getElementById('search-todo');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentEditId = null;

    function loadTodos() {
        const searchQuery = searchTodoInput.value.toLowerCase();
        const filteredTodos = todos.filter(todo => 
            todo.title.toLowerCase().includes(searchQuery) ||
            todo.description.toLowerCase().includes(searchQuery)
        );

        todoList.innerHTML = '';
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `list-group-item d-flex justify-content-between align-items-center ${todo.completed ? 'bg-light' : ''}`;
            
            const priorityClass = {
                low: 'text-success',
                medium: 'text-warning',
                high: 'text-danger'
            }[todo.priority];

            li.innerHTML = `
                <div class="d-flex align-items-center w-100">
                    <input type="checkbox" class="form-check-input me-2" 
                        ${todo.completed ? 'checked' : ''}>
                    <div class="ms-2 me-auto">
                        <div class="fw-bold ${todo.completed ? 'text-decoration-line-through' : ''}">${todo.title}</div>
                        <small class="text-muted">${todo.description}</small>
                        <div>
                            <span class="badge ${priorityClass}">
                                ${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                            </span>
                            <small class="text-muted ms-2">Échéance: ${formatDate(todo.dueDate)}</small>
                        </div>
                    </div>
                    <div class="btn-group ms-2">
                        <button class="btn btn-sm btn-warning edit-todo">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-todo">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            const checkbox = li.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => toggleTodo(todo.id));

            const editBtn = li.querySelector('.edit-todo');
            editBtn.addEventListener('click', () => editTodo(todo.id));

            const deleteBtn = li.querySelector('.delete-todo');
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            todoList.appendChild(li);
        });
    }

    // Les autres fonctions (saveTodo, deleteTodo, editTodo, etc.) restent identiques
    // ... (copier le reste du code JavaScript précédent)

    // Initialisation
    loadTodos();
}); 