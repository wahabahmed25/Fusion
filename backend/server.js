const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow Authorization header
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
            SELECT u.id AS user_id, u.username, u.full_name, up.profile_pic, up.bio, up.website_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = ?;
        `;
        database.query(query, [userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length > 0) {
                resolve(results[0]);
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
  
  


const authenticateToken = (req, res, next) => {
    //fetches the header(when present) formatted in Bearer <token>
    const authHeader = req.headers['authorization'];
    //extracts the token
    const token = authHeader && authHeader.split(' ')[1];
    //if no token return undef
    if (!token) return res.status(401).json({ message: 'Access token missing or invalid' });
    //varifies token, and if valid Express proceeds to next route handler
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user; // Add the user object to the request
        console.log("Decoded token payload:", user); // Log the decoded payload
        next(); //need, wihtout it request would hand and never reach its destination
    });

}

app.get('/user_profiles',authenticateToken,  (req, res) => {
    const userId = req.user.id
    const sql = "SELECT * FROM user_profiles WHERE user_id = ?";
    database.query(sql, [userId], (err, data) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.json(err);
        }
        if(data.length === 0){
            return res.status(404).json({ message: "Profile not found" });
        }
        console.log("Fetched data:", data);  // Log the data to see if it's being fetched
        return res.json(data[0]);
    });
});


// app.get('/user_profiles', (req, res) => {
//     const userId = req.user.id
//     const sql = "SELECT * FROM user_profiles WHERE user_id = ?";
//     database.query(sql, [userId], (err, data) => {
//         if (err) {
//             console.error("Error fetching data:", err);
//             return res.json(err);
//         }
//         if(data.length === 0){
//             return res.status(404).json({ message: "Profile not found" });
//         }
//         console.log("Fetched data:", data);  // Log the data to see if it's being fetched
//         return res.json(data[0]);
//     });
// });






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
            const user = result[0];
            //generate token
            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '2h' });

            return res.json({ success: true, token, message: "Login Successful" });
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
