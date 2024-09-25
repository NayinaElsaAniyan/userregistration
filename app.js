const app = require('./route'); // Import the Express app from route.js
const db = require('./db'); // Import the database connection from db.js

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
