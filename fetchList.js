fetch('https://apiendpoint.com/tasks')
    .then(response => response.json())
    .then(serverTasks => {
        serverTasks.forEach(task => {
            arr.push(task);
            const listItem = createTaskItem(task);
            tasklist.appendChild(listItem);
        });
    })
}

