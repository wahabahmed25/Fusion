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

// saved_posts table:
// user_id, post_id, saved_at
app.post('/saved_posts', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { post_id}  = req.body;
    if(!post_id){
        console.error("post_id is not provided");
        return res.status(400).json({ error: "post_id is required" });

    }
    const checkSavedQuery = 'SELECT COUNT(*) AS save_count FROM saved_posts WHERE user_id = ? AND post_id = ?';
    const savePostQuery = 'INSERT INTO saved_posts (user_id, post_id, saved_at) VALUES (?, ?, NOW())';
    const unSavePostQuery = 'DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?';

    const values = [userId, post_id];

    database.query(checkSavedQuery, values, (checkError, checkResult) => {
        if(checkError){
            console.error("error saving post", checkError);
            return res.status(500).json({ error: "error saving post" });
        }
        const alreadySaved = checkResult[0].save_count > 0;
        if(alreadySaved){
            database.query(unSavePostQuery, values, (unSaveError) => {
                if(unSaveError){
                    console.error("error unsaving post", unSaveError);
                    return res.status(500).json({ error: "error unsaving post" });
                }
                return res.status(200).json({ message: 'Post unsaved successfully' });
            })
            
        } else{
            database.query(savePostQuery, values, (saveError) => {
                if(saveError){
                    console.error('Error saving post', saveError);
                    return res.status(500).json({ error: 'Error saving post' });
                }
                return res.status(200).json({ message: 'Post saved successfully' });
            })
        }
    })
})
// followers table: id, following_user_id, follower_user_id, created_at
// following:
app.post('/follow-user', authenticateToken, (req, res) => {
    const userId = req.user.id; // Current authenticated user
    const { targetUserId, action } = req.body; // Target user and action (follow/unfollow)

    if (!targetUserId || !["follow", "unfollow"].includes(action)) {
        return res.status(400).json({ error: "Invalid request" });
    }

    if (action === "follow") {
        const followQuery = `
            INSERT INTO followers (following_user_id, follower_user_id, created_at)
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE created_at = NOW();
        `;

        database.query(followQuery, [targetUserId, userId], (followErr) => {
            if (followErr) {
                console.error("Error following user:", followErr);
                return res.status(500).json({ error: "Error following user" });
            }

            console.log("User followed successfully");
            return res.status(200).json({ message: "User followed successfully" });
        });
    } else if (action === "unfollow") {
        const unFollowQuery = `
            DELETE FROM followers
            WHERE following_user_id = ? AND follower_user_id = ?;
        `;

        database.query(unFollowQuery, [targetUserId, userId], (unFollowErr) => {
            if (unFollowErr) {
                console.error("Error unfollowing user:", unFollowErr);
                return res.status(500).json({ error: "Error unfollowing user" });
            }

            console.log("User unfollowed successfully");
            return res.status(200).json({ message: "User unfollowed successfully" });
        });
    }
});

// Example endpoint to fetch counts
app.get('/follow-counts/:user_id', (req, res) => {
    const userId = req.params.user_id;

    const followerCountQuery = `
        SELECT COUNT(*) AS follower_count 
        FROM followers 
        WHERE following_user_id = ?;
    `;

    const followingCountQuery = `
        SELECT COUNT(*) AS following_count 
        FROM followers 
        WHERE follower_user_id = ?;
    `;

    database.query(followerCountQuery, [userId], (followerErr, followerResult) => {
        if (followerErr) {
            console.error("Error fetching follower count:", followerErr);
            return res.status(500).json({ error: "Error fetching follower count" });
        }

        database.query(followingCountQuery, [userId], (followingErr, followingResult) => {
            if (followingErr) {
                console.error("Error fetching following count:", followingErr);
                return res.status(500).json({ error: "Error fetching following count" });
            }

            return res.status(200).json({
                follower_count: followerResult[0].follower_count,
                following_count: followingResult[0].following_count,
            });
        });
    });
});

  

// app.get('/saved_posts/:post_id', authenticateToken, (req, res) => {
//     const userId = req.user.id;
//     const post_id = req.params.post_id;
  
//     const query = `
//         SELECT 
//             p.id AS post_id,
//             p.description,
//             p.media_url,
//             u.full_name,
//             u.username,
//             up.profile_pic
//         FROM 
//             saved_posts sp
//         INNER JOIN posts p ON sp.post_id = p.id
//         INNER JOIN users u ON p.user_id = u.id
//         INNER JOIN user_profiles up ON u.id = up.user_id
//         WHERE 
//             sp.user_id = ?;
//     `;
//     database.query(query, [userId, post_id], (err, result) => {
//       if (err) {
//         console.error('Error fetching saved state', err);
//         return res.status(500).json({ error: 'Error fetching saved state' });
//       }
//       const isSaved = result[0].isSaved > 0;
//       res.json({ isSaved });
//     });
// });
  

app.get('/saved_posts', authenticateToken, (req, res) => {
    const userId = req.user.id;
  
    // Query to fetch all saved posts for the authenticated user
    const query = `
        SELECT 
            p.id AS post_id,
            p.description,
            p.media_url,
            u.full_name,
            u.username,
            up.profile_pic
        FROM 
            saved_posts sp
        INNER JOIN posts p ON sp.post_id = p.id
        INNER JOIN users u ON p.user_id = u.id
        INNER JOIN user_profiles up ON u.id = up.user_id
        WHERE 
            sp.user_id = ?;
    `;

    database.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching saved posts', err);
            return res.status(500).json({ error: 'Error fetching saved posts' });
        }

        // If no saved posts, send an empty array
        if (result.length === 0) {
            return res.json([]);
        }

        // Return all saved posts
        const savedPosts = result.map(post => ({
            post_id: post.post_id,
            description: post.description,
            media_url: post.media_url,
            user: {
                full_name: post.full_name,
                username: post.username,
                profile_pic: post.profile_pic,
            },
        }));

        return res.json(savedPosts);
    });
});

//like count
//id user_id post_id
app.post('/likes', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { post_id } = req.body;

    if (!post_id) {
        return res.status(400).json({ error: "post_id is required" });
    
    }

    // Queries
    const checkLikeQuery = 'SELECT COUNT(*) AS like_count FROM likes WHERE user_id = ? AND post_id = ?';
    const likeQuery = 'INSERT INTO likes (user_id, post_id) VALUES (?, ?)';
    const unlikeQuery = 'DELETE FROM likes WHERE user_id = ? AND post_id = ?';
    const likeCountQuery = 'SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?';

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
                    return res.status(500).json({ error: 'Failed to unlike post' });
                }

                // Fetch the updated like count
                database.query(likeCountQuery, [post_id], (err, results) => {
                    if (err) {
                        console.error('Error fetching like count:', err);
                        return res.status(500).json({ error: 'Failed to fetch like count' });
                    }

                    const likeCount = results[0].like_count;
                    return res.status(200).json({ message: 'Post unliked', likeCount });
                });
            });
        } else {
            // Like the post
            database.query(likeQuery, likeValues, (err) => {
                if (err) {
                    console.error('Error liking post:', err);
                    return res.status(500).json({ error: 'Failed to like post' });
                }

                // Fetch the updated like count
                database.query(likeCountQuery, [post_id], (err, results) => {
                    if (err) {
                        console.error('Error fetching like count:', err);
                        return res.status(500).json({ error: 'Failed to fetch like count' });
                    }

                    const likeCount = results[0].like_count;
                    return res.status(201).json({ message: 'Post liked', likeCount });
                });
            });
        }
    });
});


// get like count
app.get('/likes/:post_id', authenticateToken, (req, res) => {
    const userId = req.user.id; // Get user ID from token
    const post_id = req.params.post_id;

    const getLikesCountQuery = 'SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?';
    const isLikedQuery = 'SELECT COUNT(*) AS isLiked FROM likes WHERE user_id = ? AND post_id = ?';

    database.query(getLikesCountQuery, [post_id], (err, result) => {
        if (err) {
            console.error('Error fetching likes count:', err);
            return res.status(500).json({ error: 'Failed to fetch likes count' });
        }

        const likeCount = result[0].like_count;

        database.query(isLikedQuery, [userId, post_id], (err, result) => {
            if (err) {
                console.error('Error checking if post is liked:', err);
                return res.status(500).json({ error: 'Failed to check liked state' });
            }

            const isLiked = result[0].isLiked > 0;
            res.status(200).json({ post_id, likeCount, isLiked });
        });
    });
});

// user_id, description, media_url, created_at

//comments

app.get('/comments/:post_id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const post_id = req.params.post_id;
    const commentCountQuery = 'SELECT COUNT(*) AS comment_count FROM comments WHERE post_id = ?'
    const getCommentsQuery = `
        SELECT 
            comments.id, 
            comments.user_id, 
            comments.comment, 
            comments.created_at, 
            user_profiles.profile_pic, 
            users.full_name
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        JOIN user_profiles ON users.id = user_profiles.user_id
        WHERE comments.post_id = ? 
        ORDER BY comments.created_at DESC`;
    database.query(commentCountQuery, [post_id], (err, countResult) => {
        if (err) {
            console.error('Error getting comment count', err);
            return res.status(500).json({ error: 'error checking comment count' });
        }
        const commentCount = countResult[0].comment_count;

        database.query(getCommentsQuery, [post_id], (err, commentsResult) => {
            if(err){
                console.error('Error getting comments', err);
                return res.status(500).json({ error: 'error getting comments' });
            }
            res.status(200).json({ post_id, commentCount, comments: commentsResult });
        })
    })
})

//insert comments into database
app.post('/comments', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { comment, post_id } = req.body;
    if(!comment){
        return res.status(400).json({ error: "commenting field is required" });
    }
    if (!post_id) {
        return res.status(400).json({ error: "Post ID is required" });
    }
    const insertCommentQuery = `INSERT INTO comments (user_id, comment, post_id, created_at) VALUES (?, ?, ?, NOW())`;
    const commentValues = [userId, comment, post_id];
    database.query(insertCommentQuery, commentValues, (err, result ) => {
        if(err){
            console.error("Error inserting comment:", err);
            return res.status(500).json({ error: "Failed to insert comment into table" });
        }
        return res.status(201).json({
            message: "Comment inserted successfully!",
            commentId: result.insertId, // Include the ID of the inserted comment
        });

    })
})

// fetch suggested users;
app.get('/suggested-users', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT 
            user_profiles.profile_pic, 
            users.id AS user_id, 
            users.full_name, 
            users.username,
            EXISTS(
                SELECT 1 
                FROM followers 
                WHERE followers.follower_user_id = ? AND followers.following_user_id = users.id
            ) AS is_following
        FROM 
            user_profiles
        JOIN 
            users ON user_profiles.user_id = users.id
        WHERE 
            users.id != ?
        ORDER BY 
            RAND()
        LIMIT 8;
    `;

    database.query(query, [userId, userId], (err, results) => {
        if (err) {
            console.error("Error fetching suggested users", err);
            return res.status(500).json({ error: "Error fetching suggested users" });
        }
        console.log("Fetched suggested users successfully");
        return res.status(200).json(results); // Return the fetched profiles
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