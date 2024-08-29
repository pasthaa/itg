const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // change as per your MySQL setup
    password: '',  // change as per your MySQL setup
    database: 'itg'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});




// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
-