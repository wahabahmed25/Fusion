const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const database = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

database.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to the database.");
        
        // Log the database that is being used
        database.query('SELECT DATABASE()', (err, result) => {
            if (err) {
                console.error('Error fetching database name:', err);
            } else {
                console.log('Currently connected to database:', result[0]['DATABASE()']);
            }
        });
    }
});;

app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users";
    database.query(sql, (err, data) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.json(err);
        }
        console.log("Fetched data:", data);  // Log the data to see if it's being fetched
        return res.json(data);
    });
});

app.post('/signup', (req, res) => {
    const { fullName, username, email, password } = req.body;
    console.log(req.body);
    
    if (!fullName || !username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = `INSERT INTO users (full_name, username, email, password, created_at) VALUES (?, ?, ?, ?, NOW())`;
    const values = [fullName, username, email, password];

    database.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ error: "Failed to register user." });
        }
        console.log("User inserted successfully", result);
        return res.status(201).json({ message: "User registered successfully!" });
    });

});



//user login
app.post('/login', (req, res) => {
    console.log(req.body);
    const {username, password} = req.body;

    if(!username || ! password){
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    const values = [username, password];

    database.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error checking credentials:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
        if(result.length > 0){
            return res.json({ success: true, message: "Login Successful" });
        }
        else{
            return res.status(401).json({ success: false, message: "Invalid username or password" });

        }
       
    });


})


// app.get('/users', (req, res) => { 
//     const sql = "INSERT INTO users (username, email, password, bio) VALUES (?, ?, ?, ?)";
//     const values = ['new', 'new@example.com', 'password', 'New user'];
//     database.query(sql, values, (err, result) => {
//         if (err) return res.json(err);
//         return res.json("User added successfully");
//     });
// });
app.get('/', (req, res) => {
    return res.json("from backend side");
});

app.listen(8081, () => {
    console.log("listening");
});
