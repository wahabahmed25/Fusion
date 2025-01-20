const express = require('express');
const mysql = require('mysql2');
const http = require("http");
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require("socket.io");
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow Authorization header
    credentials: true
}));

app.use('/uploads', express.static('uploads'));

//socket.io
io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("message", (data) => {
        console.log(data);
        io.emit("message", data); //broadcasts message to all clients
    })
    socket.on("disconnect", () => {
        console.log("user disconnected");
    })
})





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

  
//fetch multiple users by id
const getUserProfiles = (userIds) => {
    return new Promise((resolve, reject) => {
        // Use "IN" in SQL to fetch profiles for multiple user IDs
        const query = `
            SELECT u.id AS user_id, u.username, u.full_name, up.profile_pic, up.bio, up.website_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = (?);
        `;

        // Passing the array of user IDs directly to the query
        database.query(query, [userIds], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length > 0) {
                resolve(results);  // Resolving all user profiles
            } else {
                reject('No users found');
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


//personal dash board
app.get('/personal-posts', authenticateToken, (req, res) => {
    const userId = req.user.id;
    //joins posts with user profile and user info
    const userPostsQuery = `
        SELECT 
            posts.id AS post_id, 
            posts.media_url, 
            posts.description, 
            posts.created_at, 
            users.id AS user_id, 
            users.username, 
            users.full_name, 
            user_profiles.profile_pic 
        FROM 
            posts
        INNER JOIN 
            users ON posts.user_id = users.id
        INNER JOIN 
            user_profiles ON posts.user_id = user_profiles.user_id
        WHERE 
            posts.user_id = ? 
        ORDER BY 
            posts.created_at DESC
    `;

    database.query(userPostsQuery, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user posts: ", err);
            return res.status(500).json({ error: "Failed to fetch user posts" });
        }

        const formattedPosts = results.map(post => ({
            post_id: post.post_id,
            media_url: post.media_url,
            description: post.description,
            created_at: post.created_at,
            user: {
                id: post.user_id,
                username: post.username,
                name: post.full_name,
                profile_pic: post.profile_pic,
            },
        }));

        return res.status(200).json(formattedPosts);
    });
});



//public feed:

app.get('/user-posts', authenticateToken, (req, res) => {
    // Updated query: Remove the WHERE clause to fetch posts from all users
    const allPostsQuery = `
        SELECT 
            posts.id AS post_id, 
            posts.media_url, 
            posts.description, 
            posts.created_at, 
            users.id AS user_id, 
            users.username, 
            users.full_name, 
            user_profiles.profile_pic 
        FROM 
            posts
        INNER JOIN 
            users ON posts.user_id = users.id
        INNER JOIN 
            user_profiles ON posts.user_id = user_profiles.user_id
        ORDER BY 
            posts.created_at DESC
    `;

    database.query(allPostsQuery, (err, results) => {
        if (err) {
            console.error("Error fetching posts: ", err);
            return res.status(500).json({ error: "Failed to fetch posts" });
        }

        const formattedPosts = results.map(post => ({
            post_id: post.post_id,
            media_url: post.media_url,
            description: post.description,
            created_at: post.created_at,
            user: {
                id: post.user_id,
                username: post.username,
                name: post.full_name,
                profile_pic: post.profile_pic,
            },
        }));

        return res.status(200).json(formattedPosts);
    });
});


app.post("/user_profiles", async (req, res) => {
    const userId = req.user.id;
    console.log("Received user_ids:", userId);  // Log user IDs to see if they are correct
    try {
      if (!userId || !Array.isArray(userId) || userId.length === 0) {
        return res.status(400).json({ error: "No user IDs provided." });
      }
  
      const profiles = await getUserProfiles(userId); // Fetch user profiles based on the IDs
      console.log("User profiles fetched:", profiles); // Log the fetched profiles
      res.status(200).json(profiles);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      res.status(500).json({ error: "Failed to fetch user profiles." });
    }
  });
  

app.post('/posts', authenticateToken, upload.single("image"), (req, res) => {
    const userId = req.user.id;
    console.log("Received user_ids:", userId);  // Log user IDs to see if they are correct

    // const userId = 11;
    const {description} = req.body;
    const media_url = req.file?.path;
    if(!description || !media_url){
        return res.status(400).json({ error: "All fields are required" });
    }  

    const mediaSql = `INSERT INTO posts (user_id, description, media_url, created_at) VALUES (?, ?, ?, NOW())`;
    const mediaValues = [userId, description, media_url];

    database.query(mediaSql, mediaValues, (err, result) => {
        if(err){
            console.error("error inserting post to media: ", err);
            return res.status(500).json({ error: "Failed to create post" });

        }
        console.log("successfuly inserted into posts table: ");
        return res.status(201).json({ message: "Post sucessfully made" });

    })
})

//like count
//id user_id post_id
app.post('/likes', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { post_id } = req.body;
    if (!post_id || typeof post_id !== 'number') {
        console.error("post_id is missing:", post_id);
        return res.status(400).json({ error: "post_id is required" });
    }
    console.log('User ID:', userId);
    console.log('Post ID:', post_id);
    console.log('Incrementing like count for Post ID:', post_id);
    console.log('Decrementing like count for Post ID:', post_id);

    //queries to handle liking
    const checkLikeQuery = 'SELECT COUNT(*) AS like_count FROM likes WHERE user_id = ? AND post_id = ?';
    const likeQuery = 'INSERT INTO likes (user_id, post_id) VALUES(?, ?)';
    const unlikeQuery = 'DELETE FROM likes WHERE user_id = ? AND post_id = ?';
    const incrementLikeCount = 'UPDATE posts SET like_count = like_count + 1 WHERE id = ?';
    const decrementLikeCount = 'UPDATE posts SET like_count = like_count - 1 WHERE id = ?';

    const likeValues = [userId, post_id];

   
    // Check if the user already liked the post
    database.query(checkLikeQuery, likeValues, (err, results) => {
        if (err) {
            console.error('Error checking likes:', err);
            return res.status(500).json({ error: 'Failed to check likes' });
        }

        const alreadyLiked = results[0].like_count > 0;

        if (alreadyLiked) {
            // Unlike the post
            database.query(unlikeQuery, likeValues, (err) => {
                if (err) {
                    console.error('Error unliking post:', err);
                    return res.status(500).json({ error: 'Failed to unlike the post' });
                }

                // Decrement like count
                database.query(decrementLikeCount, [post_id], (err) => {
                    if (err) {
                        console.error('Error decrementing like count:', err);
                        return res.status(500).json({ error: 'Failed to update like count' });
                    }
                    return res.status(200).json({ message: 'Post unliked' });
                });
            });
        } else {
            // Like the post
            database.query(likeQuery, likeValues, (err) => {
                if (err) {
                    console.error('Error liking post:', err);
                    return res.status(500).json({ error: 'Failed to like the post' });
                }

                // Increment like count
                database.query(incrementLikeCount, [post_id], (err) => {
                    if (err) {
                        console.error('Error incrementing like count:', err);
                        return res.status(500).json({ error: 'Failed to update like count' });
                    }
                    return res.status(201).json({ message: 'Post liked' });
                });
                
            });
        }
    });
});

//get like count
// app.get('/likes', authenticateToken, (req, res) => {
//     const getLikeQuery = 'SELECT post_id, COUNT(*) AS like_count FROM likes GROUP BY post_id';
// })

// user_id, description, media_url, created_at


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


app.all('*', (req, res) => {
    console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});



app.get('/', (req, res) => {
    return res.json("from backend side");
});

app.listen(8081, () => {
    console.log("listening");
});

server.listen(8080, () => {
    console.log("server listening on port 8080")
})