const express = require('express')
const app = express()
const port = 3000

let tasklist = [];

const cors = require('cors');
app.use(cors());
app.use(express.json());

let currentID = 1;

app.post('/tasks', (req, res) => {
    const taskName = req.body.name;

    const newTask = {
        id: currentID++,
        name: taskName,
        completed: false
    };
    tasklist.push(newTask);
    console.log("Added task:", newTask);
    console.log("Current tasklist:", tasklist);
    res.json(newTask);
})

app.patch('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = tasklist.findIndex(task => task.id === id);
    if (index !== -1) {
        tasklist[index].completed = req.body.completed;
        res.json(tasklist[index]);
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});

app.delete('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    tasklist = tasklist.filter(task => task.id !== id);
    res.json({ success: true });
});

app.get('/tasks', (req, res) => {
    res.json(tasklist);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
