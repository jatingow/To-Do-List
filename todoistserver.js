const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


const pool = new Pool({
    connectionString: "postgresql://postgres:Spender6-Wham0-Froth0-Lushness7@db.yjtkmdvbloinsgmyxiyt.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

// GET: Fetch all tasks from Supabase
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// POST: Add a new task to Supabase
app.post('/tasks', async (req, res) => {
    const taskName = req.body.name;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (name, completed) VALUES ($1, $2) RETURNING *',
            [taskName, false]
        );
        console.log("Added task to DB:", result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH: Update completion status in Supabase
app.patch('/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const completed = req.body.completed;
    try {
        const result = await pool.query(
            'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
            [completed, id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE: Remove task from Supabase
app.delete('/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});