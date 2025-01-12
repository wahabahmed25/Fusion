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

const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.* 
        FROM users u
        JOIN user_profiles up ON u.id = up.user_id
        WHERE up.user_id = ?;
      `;
      database.execute(query, [userId], (err, results) => {
        if (err) {
          return reject(err); // Reject with error if query fails
        }
        if (results.length > 0) {
          resolve(results[0]); // Return the first user (assuming user_id is unique)
        } else {
          reject('User not found');
        }
      });
    });
};
  


  app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
  
    getUserById(userId)
      .then((user) => {
        res.json(user); // Return the user data as JSON
      })
      .catch((err) => {
        console.error(err);
        res.status(404).json({ message: "User not found" });
      });
  });
  
  

app.get('/user_profiles', (req, res) => {
    const sql = "SELECT * FROM user_profiles";
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

    if (!fullName || !username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // SQL query to insert a new user
    const userSql = `INSERT INTO users (full_name, username, email, password, created_at) VALUES (?, ?, ?, ?, NOW())`;
    const userValues = [fullName, username, email, password];

    // Insert user into the database
    database.query(userSql, userValues, (userErr, userResult) => {
        if (userErr) {
            console.error("Error inserting user:", userErr);
            return res.status(500).json({ error: "Failed to register user." });
        }

        const userId = userResult.insertId; // Get the inserted user's ID

        // SQL query to insert a new profile
        const profileSql = `INSERT INTO user_profiles (user_id, profile_pic, cover_photo, bio, website_url) VALUES (?, NULL, NULL, NULL, NULL)`;
        const profileValues = [userId];

        // Insert default profile for the new user
        database.query(profileSql, profileValues, (profileErr, profileResult) => {
            if (profileErr) {
                console.error("Error inserting user profile:", profileErr);
                return res.status(500).json({ error: "Failed to create user profile." });
            }

            console.log("User and profile inserted successfully");
            return res.status(201).json({ message: "User registered successfully!" });
        });
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



app.get('/', (req, res) => {
    return res.json("from backend side");
});

app.listen(8081, () => {
    console.log("listening");
});
