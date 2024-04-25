const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function createSchema() {
    try {
        await pool.query('CREATE DATABASE IF NOT EXISTS mydb');
        await pool.query('USE mydb');

        const schema = fs.readFileSync('database/schema.sql', 'utf8');
        await pool.query(schema);

        await pool.query('ALTER TABLE users MODIFY last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    } catch (err) {
        process.exit(1);
    }
}

createSchema();

app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const [existingUser] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'This email is already used' });
        }

        const [result] = await pool.execute('INSERT INTO users (name, email, password, user_status) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, 'active']);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to register user' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];

        if (user.user_status === 'blocked') {
            return res.status(403).json({ message: 'This user is blocked' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, 'secret_key', { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
        res.status(500).json({ message: 'Failed to login' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, name, email, last_login, user_status as status FROM users');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

app.delete('/api/users/', async (req, res) => {
    const { userIds } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            await Promise.all(userIds.map(async (userId) => {
                await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
            }));

            await connection.commit();
            connection.release();
            res.status(200).json({ message: 'Users deleted successfully' });
        } catch (error) {
            await connection.rollback();
            connection.release();
            res.status(500).json({ message: 'Failed to delete users' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete users' });
    }
});

app.put('/api/users/block', async (req, res) => {
    const { userIds } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            await Promise.all(userIds.map(async (userId) => {
                await connection.execute('UPDATE users SET user_status = "blocked" WHERE id = ?', [userId]);
            }));

            await connection.commit();
            connection.release();
            res.status(200).json({ message: 'Users blocked successfully' });
        } catch (error) {
            await connection.rollback();
            connection.release();
            res.status(500).json({ message: 'Failed to block users' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to block users' });
    }
});

app.put('/api/users/unblock', async (req, res) => {
    const { userIds } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            await Promise.all(userIds.map(async (userId) => {
                await connection.execute('UPDATE users SET user_status = "active" WHERE id = ?', [userId]);
            }));

            await connection.commit();
            connection.release();
            res.status(200).json({ message: 'Users unblocked successfully' });
        } catch (error) {
            await connection.rollback();
            connection.release();
            res.status(500).json({ message: 'Failed to unblock users' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to unblock users' });
    }
});

app.put('/api/users/:userId/lastlogin', async (req, res) => {
    const { userId } = req.params;

    try {
        await pool.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
        res.status(200).json({ message: 'Last login updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update last login' });
    }
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
