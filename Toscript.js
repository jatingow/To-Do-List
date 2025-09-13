const input = document.getElementById("taskInput");
const tasklist = document.getElementById("taskList");

function addTask() {
    const taskText = input.value.trim();
    console.log(taskText);
    if (taskText === "") {
        alert("Please Enter a Task!")
        return;
    }
    let newTaskObject = {
        name: taskText,
        completed: false
    };
    console.log(newTaskObject);

    fetch('http://localhost:3000/tasks', {
        method: 'POST',
        body: JSON.stringify(newTaskObject),
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
    })
        .then(response => response.json())
        .then(data => {
            // createTaskItem(data);
            const li = createTaskItem(data);
            tasklist.appendChild(li);
            input.value = "";
            console.log(data)
        });
}

function createTaskItem(taskObject) {
    const li = document.createElement("li");
    li.textContent = taskObject.name;
    if (taskObject.completed === true) {
        li.classList.add("done");
    }
    const completeBtn = document.createElement("button");
    completeBtn.innerHTML = "&#10003;";
    completeBtn.onclick = () => {
        const updatedStatus = !taskObject.completed;
        fetch(`http://localhost:3000/tasks/${taskObject.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: updatedStatus })
        })
            .then(res => {
                taskObject.completed = updatedStatus;
                li.classList.toggle("done");
            })
    }
    completeBtn.style.marginRight = "15px";
    completeBtn.classList.add("complete-btn");
    li.prepend(completeBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "x";
    deleteBtn.onclick = () => {
        fetch(`http://localhost:3000/tasks/${taskObject.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        }).then(res => res.json())
            .then(data => {
                console.log(data);
                li.remove();
            });
    };
    deleteBtn.style.marginLeft = "25px";
    deleteBtn.classList.add("delete-btn");
    li.appendChild(deleteBtn);
    return li;
}

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

fetch('http://localhost:3000/tasks')
    .then(response => response.json())
    .then(data => {
        data.forEach(task => {

            const listItem = createTaskItem(task);
            tasklist.appendChild(listItem);
            console.log(data);
        });
    })




