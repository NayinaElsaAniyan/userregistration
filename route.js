const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the database connection from db.js

const app = express();

// Use CORS
app.use(cors());

// Middleware for JSON and URL-encoded form data
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Handle GET requests to fetch the department list
app.get('/department', (req, res) => {
    db.query('SELECT * FROM department', (err, results) => {
        if (err) {
            console.error('Error fetching departments: ' + err.stack);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        res.status(200).json({ success: true, departments: results });
    });
});

// Handle POST requests to add a new department
app.post('/department', (req, res) => {
    const { depid, depname, role, description } = req.body;
    console.log('enter backend');

    db.query('INSERT INTO department (depid, depname, role, description) VALUES (?, ?, ?, ?)', 
             [depid, depname, role, description], (err, result) => {
        if (err) {
            console.error('Error inserting department: ' + err.stack);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        res.status(200).json({ success: true, message: 'Department added successfully' });
    });
});

app.get('/department/:id', (req, res) => {
    const depId = req.params.id;
    db.query('SELECT * FROM department WHERE depid = ?', [depId], (err, result) => {
        if (err) {
            console.error('Error fetching department: ' + err.stack);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        if (result.length > 0) {
            res.status(200).json({ success: true, department: result[0] });
        } else {
            res.status(404).json({ success: false, message: 'Department not found' });
        }
    });
});

// Handle PUT requests to update an existing department
app.put('/department/:id', (req, res) => {
    const depId = req.params.id;
    const { depname, role, description } = req.body;

    db.query('UPDATE department SET depname = ?, role = ?, description = ? WHERE depid = ?', 
             [depname, role, description, depId], (err, result) => {
        if (err) {
            console.error('Error updating department: ' + err.stack);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        res.status(200).json({ success: true, message: 'Department updated successfully' });
    });
});

// Handle DELETE requests to delete a department
app.delete('/department/:id', (req, res) => {
    const depId = req.params.id;

    db.query('DELETE FROM department WHERE depid = ?', [depId], (err, result) => {
        if (err) {
            console.error('Error deleting department: ' + err.stack);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        res.status(200).json({ success: true, message: 'Department deleted successfully' });
    });
});


// Handle POST requests to the '/register' endpoint
app.post('/register', (req, res) => {
    const { name, username, password, confirm_password, email, phone, place, role } = req.body;

    // Fetch depid from the department table based on the role
    db.query('SELECT depid FROM department WHERE role = ?', [role], (err, results) => {
        if (err) {
            console.error('Error fetching department ID: ' + err.stack);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }

        if (results.length === 0) {
            // Handle case where no department is found for the given role
            res.status(400).json({ success: false, message: 'Invalid role provided.' });
            return;
        }

        const depid = results[0].depid; // Get the depid from the result

        // Now, proceed with the user registration, including the depid
        db.query('INSERT INTO users (name, username, password, confirm_password, email, phone, place, role, depid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [name, username, password, confirm_password, email, phone, place, role, depid], (err, result) => {
                if (err) {
                    console.error('Error inserting data into the database: ' + err.stack);
                    res.status(500).json({ success: false, message: 'Internal Server Error' });
                    return;
                }
                res.status(200).json({ success: true, message: 'Registration successful' });
            }
        );
    });
});


// Handle GET requests to fetch the user list
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error fetching users: ' + err.stack);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        res.status(200).json({ success: true, users: results });
    });
});

app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user: ' + err.stack);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, user: results[0] });
    });
});


// Handle PUT requests to update a user's details
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { name, username, password, email, phone, place } = req.body;

    db.query('UPDATE users SET name = ?, username = ?, password = ?, email = ?, phone = ?, place = ? WHERE id = ?', [name, username, password, email, phone, place, userId], (err, result) => {
        if (err) {
            console.error('Error updating user: ' + err.stack);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        res.status(200).json({ success: true, message: 'User updated successfully' });
    });
});

// Handle DELETE requests to delete a user
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;

    db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user: ' + err.stack);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    });
});

// Handle POST requests to the '/login' endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            console.error('Error fetching user: ' + err.stack);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }

        if (results.length > 0) {
            // Login successful
            res.status(200).json({ success: true, message: 'Login successful' });
        } else {
            // Invalid credentials
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    });
});


// Export the app for use in app.js
module.exports = app;
