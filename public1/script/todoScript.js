const addBtn = document.getElementById("addBtn");
const todoInput = document.getElementById("todoInput");
const priority = document.getElementById("priority");
const todoList = document.getElementById("todo-item");

addBtn.addEventListener("click", function (e) {
  e.preventDefault();

  const inp = todoInput.value;
  const pri = priority.value;
  const todoimg = document.querySelector("input[name='todoimg']").files[0];

  if (!inp || !pri) {
    alert("Please fill in the fields");
    return;
  }

  const done = "pending";
  const id = Date.now();
  const todo = new FormData();
  todo.append("id", id);
  todo.append("inp", inp);
  todo.append("pri", pri);
  todo.append("todoimg", todoimg);
  todo.append("done", done);

  fetch("/todo", {
    method: "POST",
    body: todo,
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        alert("Something went wrong");
      }
    })
    .then(function (data) {
      showTodoToUI(data);
      
    })
    .catch(function (error) {
      console.log(error.message);
    });


  todoInput.value = "";
  priority.value = "";
});

function showTodoToUI(todo) {
  const todoText = document.createElement("mangesh");
  todoText.innerText = "Todo: " + todo.inp;

  const todoPrio = document.createElement("bide");
  todoPrio.style.fontWeight = "bold";
  todoPrio.innerText = "Priority: " + todo.pri;

  const todoimg = document.createElement("img");
  todoimg.src = todo.todoimg;
  todoimg.style.width = "100px";
  todoimg.style.height = "100px";

  const doneCheckbox = document.createElement("input");
  doneCheckbox.type = "checkbox";
  doneCheckbox.id = "statusCheckbox-" + todo.id; 
  doneCheckbox.checked = todo.done === "done"; 

  const delBtn = document.createElement("button");
  delBtn.innerText = "X";
  delBtn.classList.add("del-btn");

  const editBtn = document.createElement("button");
  editBtn.innerText = "Edit";
  editBtn.classList.add("edit-btn");

  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo-item");

  todoDiv.appendChild(todoText);
  todoDiv.appendChild(document.createElement("br"));
  todoDiv.appendChild(todoPrio);
  todoDiv.appendChild(document.createElement("br"));
  todoDiv.appendChild(todoimg);
  todoDiv.appendChild(document.createElement("br"));
  todoDiv.appendChild(doneCheckbox);
  todoDiv.appendChild(delBtn);
  todoDiv.appendChild(editBtn);

  updateStatusText(doneCheckbox.checked, todoDiv);

  handleCheckboxChange(todo, todoText, todoPrio, doneCheckbox, todoDiv);
  handleDeleteClick(todo, todoDiv, delBtn);
  handleEditClick(todo, todoText, todoPrio, editBtn);

  if (todo.done === "done") {
    todoText.style.textDecoration = "line-through";
    todoPrio.style.textDecoration = "line-through";
  }

  todoList.appendChild(todoDiv);
}

function handleCheckboxChange(todo, todoText, todoPrio, doneCheckbox, todoDiv) {
  doneCheckbox.addEventListener("change", function () {
    if (doneCheckbox.checked) {
      todoText.style.textDecoration = "line-through";
      todoPrio.style.textDecoration = "line-through";
      todo.done = "done";
    } else {
      todoText.style.textDecoration = "none";
      todoPrio.style.textDecoration = "none";
      todo.done = "pending";
    }

    
    fetch("/todo", {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    }).then(function (response) {
      if (response.status === 200) {
        // Todo successfully updated on the server
        updateStatusText(doneCheckbox.checked, todoDiv);
      } else {
        alert("Something went wrong");
      }
    });
  });
}

// Todo deletion
function handleDeleteClick(todo, todoDiv, delBtn) {
  delBtn.addEventListener("click", function () {
    
    fetch("/todo", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    }).then(function (response) {
      if (response.status === 200) {
        // Todo successfully deleted on the server

        // Remove the todo from the UI
        todoDiv.remove();
      } else {
        alert("Something went wrong");
      }
    });
  });
}

function updateStatusText(checked, todoDiv) {

  const existingStatusLabel = todoDiv.querySelector(".status-label");
  if (existingStatusLabel) {
    existingStatusLabel.remove();
  }

  const statusLabel = document.createElement("label");
  statusLabel.classList.add("status-label");
  statusLabel.style.textDecoration = checked ? "line-through" : "none";
  statusLabel.innerText = checked ? "Completed" : "Pending";
  todoDiv.appendChild(statusLabel);
}

function handleEditClick(todo, todoText, todoPrio, editBtn) {
  editBtn.addEventListener("click", function () {
    const newTodoText = prompt("Enter new todo text", todo.inp);
    const newTodoPrio = prompt("Enter new todo priority", todo.pri);

    if (!newTodoText || !newTodoPrio) {
      alert("Please fill in the fields");
      return;
    }

    todo.inp = newTodoText;
    todo.pri = newTodoPrio;

    fetch("/todo", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    }).then(function (response) {
      if (response.status === 200) {
        // Todo successfully updated on the server
        todoText.innerText = "Todo: " + newTodoText;
        todoPrio.innerText = "Priority: " + newTodoPrio;
      } else {
        alert("Something went wrong");
      }
    });
  });
}



fetch("/tododata")
  .then(function (response) {
    if (response.status === 200) {
      return response.json();
    } else {
      alert("Something went wrong");
    }
  })
  .then(function (todos) {
    todos.forEach(function (todo) {
      showTodoToUI(todo);
    });
  })
  .catch(function (error) {
    console.log(error);
  });
