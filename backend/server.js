const express = require('express');
const mysql = require('mysql2');
const http = require("http");
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const multer = require('multer');
const { error } = require('console');
const upload = multer({ dest: 'uploads/' })

const app = express();
const server = http.createServer(app);
const fs = require('fs');
const path = require('path');
app.use(express.json());
const { Server } = require("socket.io");

app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow Authorization header
    credentials: true
}));

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, "public"))); 
//socket.io\
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
});

//checks if someone connected to the server
io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    socket.on('join_room', (data) => {
        socket.join(data);
        console.log("user with id: ", socket.id, "joined the room.", data)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.io);
    })
})


app.use('/public', express.static("public"));




// server.listen(3001, () => {
//     console.log("server listening on port 8080")
// })
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
  
  app.get('/users/:user_id', (req, res) => {
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

app.get('/user_profiles', authenticateToken, (req, res) => {
    const userId = req.user.id; 
    const sql = `
        SELECT 
            users.id AS user_id, 
            users.username, 
            users.full_name, 
            user_profiles.user_id, 
            user_profiles.profile_pic, 
            user_profiles.bio
        FROM user_profiles
        INNER JOIN users ON user_profiles.user_id = users.id
        WHERE user_profiles.user_id = ?;

    `;

    database.query(sql, [userId], (err, data) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (data.length === 0) {
            return res.status(404).json({ message: "Profile not found" });
        }
        console.log("Fetched data:", data[0]); // Logging only the first result
        return res.json(data[0]); 
    });
});


app.get('/isFollowing/:user_id', authenticateToken, (req, res) => {
    const followeeUserId = req.params.user_id; // The user_id of the profile being checked
    const followerUserId = req.user.id; // The user_id of the currently authenticated user

    const sql = `
        SELECT EXISTS(
            SELECT 1 
            FROM followers 
            WHERE follower_user_id = ? AND following_user_id = ?
        ) AS is_following;
    `;

    // Pass followerUserId and followeeUserId as parameters
database.query(sql, [followerUserId, followeeUserId], (err, data) => {
    if (err) {
        console.error("Error checking follow status:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
    console.log("Follow status:", data[0]); // Log the result
    return res.json(data[0]); // Return the result
    });
});

app.get('/user_profiles/:user_id',authenticateToken,  (req, res) => {
    const userId = req.params.user_id;
    // const followerUserId = req.user.id;
    const sql = `
        SELECT 
            user_profiles.profile_pic, 
            user_profiles.bio,
            users.username, 
            users.full_name
        FROM 
            user_profiles
        JOIN 
            users 
        ON 
            user_profiles.user_id = users.id
        WHERE 
            user_profiles.user_id = ?;
    `;
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

app.get('/search-user', authenticateToken, (req, res) => {
    const searchQuery = req.query.query; // Get the search input from query params

    if (!searchQuery) {
        return res.status(400).json({ error: "Search query is required" });
    }

    const query = `
        SELECT users.id, users.full_name, users.username, user_profiles.profile_pic
        FROM users
        LEFT JOIN user_profiles ON users.id = user_profiles.user_id
        WHERE users.full_name LIKE ? OR users.username LIKE ?
    `;


    const searchPattern = `%${searchQuery}%`; // Search for partial matches

    database.query(query, [searchPattern, searchPattern], (err, results) => {
        if (err) {
            console.error("Error searching user", err);
            return res.status(500).json({ error: "Failed to search user" });
        }
        res.json(results); // Send back user list
    });
});

//personal dash board
app.get('/personal-posts', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 6; // Default to 10 posts per request
    const offset = (page - 1) * limit;

    // Query to fetch user posts with pagination
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
        LIMIT ? OFFSET ?
    `;

    database.query(userPostsQuery, [userId, limit, offset], (err, results) => {
        if (err) {
            console.error("Error fetching user posts: ", err);
            return res.status(500).json({ error: "Failed to fetch user posts" });
        }

        // Format the posts
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

        // Query to check if there are more posts available
        const totalPostsQuery = `SELECT COUNT(*) AS total FROM posts WHERE user_id = ?`;

        database.query(totalPostsQuery, [userId], (err, countResult) => {
            if (err) {
                console.error("Error counting total user posts: ", err);
                return res.status(500).json({ error: "Failed to fetch total post count" });
            }

            const totalPosts = countResult[0].total;
            const hasMore = offset + limit < totalPosts; // Check if more posts exist

            return res.status(200).json({ posts: formattedPosts, hasMore });
        });
    });
});



//public feed:

app.get('/user-posts', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 5; // Default to 10 posts per request
    const offset = (page - 1) * limit; // Calculate offset for pagination

    // Fetch limited posts using OFFSET and LIMIT
    const paginatedQuery = `
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
        LIMIT ? OFFSET ?
    `;

    database.query(paginatedQuery, [limit, offset], (err, results) => {
        if (err) {
            console.error("Error fetching posts: ", err);
            return res.status(500).json({ error: "Failed to fetch posts" });
        }

        // If there are no posts, indicate no more posts
        const hasMore = results.length === limit; 

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

        return res.status(200).json({
            posts: formattedPosts,
            hasMore, // Indicate if there are more posts to fetch
        });
    });
});


app.get('/posts-of-user/:user_id', authenticateToken, (req, res) => {
    const userId = req.params.user_id;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 6; // Default to 6 posts per request
    const offset = (page - 1) * limit; // Calculate offset for pagination

    const specificUserPostsQuery = `
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
    LIMIT ? OFFSET ?
    `;

    database.query(specificUserPostsQuery, [userId, limit, offset], (err, results) => {
        if (err) {
            console.error("Error fetching this user's posts: ", err);
            return res.status(500).json({ error: "Failed to fetch this user's posts" });
        }

        // Determine if there are more posts to fetch (if the number of results equals the limit)
        const hasMore = results.length === limit;

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

        return res.status(200).json({
            posts: formattedPosts,
            hasMore, // Indicate if there are more posts to fetch
        });
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

app.put('/change-profile', authenticateToken, upload.single('profile_pic'), (req, res) => {
    const userId = req.user.id;
    const { full_name, username, bio } = req.body;
    const profile_pic = req.file ? path.join('/uploads', req.file.filename) : null;

    // Update users table
    const userQuery = `UPDATE users SET full_name = ?, username = ? WHERE id = ?`;
    const userValues = [full_name, username, userId];

    database.query(userQuery, userValues, (userError) => {
        if (userError) {
            console.error("Error updating user info:", userError);
            return res.status(500).json({ error: "Failed to update user info" });
        }

        // Update user_profiles table
        const profileQuery = `UPDATE user_profiles SET bio = ?, profile_pic = COALESCE(?, profile_pic) WHERE user_id = ?`;
        const profileValues = [bio, profile_pic, userId];

        database.query(profileQuery, profileValues, (profileError) => {
            if (profileError) {
                console.error("Error updating profile:", profileError);
                return res.status(500).json({ error: "Failed to update profile" });
            }

            return res.status(200).json({ message: "Profile successfully updated", profile_pic });
        });
    });
});

app.put('/remove-profile-pic', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const deleteQuery = "UPDATE user_profiles SET profile_pic = '/default-profile.svg' WHERE user_id = ?";

    database.query(deleteQuery, [userId], (err, result) => {
        if(err){
            console.error("Error removing profile pic:", err);
            return res.status(500).json({ error: "Failed to remove profile pic" });
        }
    })
    console.log("Profile pic set to default successfully");
    return res.status(200).json({ message: "Profile pic successfully removed" });
})


app.put('/posts/:post_id', authenticateToken, upload.single("image"), (req, res) => {
    const userId = req.user.id;
    const post_id = req.params.post_id;
    const { description } = req.body;
    const media_url = req.file?.path; // Optional file upload
  
    // Check if the user owns the post
    const checkOwnerShipQuery = 'SELECT user_id FROM posts WHERE id = ?';
    database.query(checkOwnerShipQuery, [post_id], (err, result) => {
      if (err) {
        console.error('Error checking post ownership:', err);
        return res.status(500).json({ error: 'Error checking post ownership' });
      }
  
      if (result.length === 0 || result[0].user_id !== userId) {
        return res.status(403).json({ error: 'You do not have permission to edit this post' });
      }
  
      // Prepare the update query and values
      let updatePostsQuery;
      let values;
  
      if (media_url) {
        // Update both description and media_url
        updatePostsQuery = 'UPDATE posts SET description = ?, media_url = ? WHERE id = ?';
        values = [description, media_url, post_id];
      } else {
        // Update only the description
        updatePostsQuery = 'UPDATE posts SET description = ? WHERE id = ?';
        values = [description, post_id];
      }
  
      // Execute the update query
      database.query(updatePostsQuery, values, (updateErr) => {
        if (updateErr) {
          console.error("Error updating post:", updateErr);
          return res.status(500).json({ error: "Failed to update post" });
        }
  
        console.log("Successfully updated the post");
        return res.status(200).json({ message: "Post successfully updated" });
      });
    });
  });

//deleting posts

app.delete('/posts/:post_id', authenticateToken, (req, res) => {
  const userId = req.user.id; // Authenticated user ID
  const post_id = req.params.post_id; // Post ID from URL params

  // Check if the user owns the post
  const checkOwnerShipQuery = 'SELECT user_id, media_url FROM posts WHERE id = ?';
  database.query(checkOwnerShipQuery, [post_id], (err, result) => {
    if (err) {
      console.error('Error checking post ownership:', err);
      return res.status(500).json({ error: 'Error checking post ownership' });
    }

    // If the post doesn't exist or the user doesn't own it
    if (result.length === 0 || result[0].user_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this post' });
    }

    const media_url = result[0].media_url; // Get the media_url from the result

    // Delete associated likes
    const deleteLikeQuery = 'DELETE FROM likes WHERE post_id = ?';
    database.query(deleteLikeQuery, [post_id], (likeErr) => {
      if (likeErr) {
        console.error('Error deleting likes of post:', likeErr);
        return res.status(500).json({ error: 'Error deleting likes of post' });
      }

      // Delete associated comments
      const deleteCommentQuery = 'DELETE FROM comments WHERE post_id = ?';
      database.query(deleteCommentQuery, [post_id], (commentErr) => {
        if (commentErr) {
          console.error('Error deleting comments of post:', commentErr);
          return res.status(500).json({ error: 'Error deleting comments of post' });
        }

        // Delete the post
        const deletePostQuery = 'DELETE FROM posts WHERE id = ?';
        database.query(deletePostQuery, [post_id], (deleteErr) => {
          if (deleteErr) {
            console.error('Error deleting post:', deleteErr);
            return res.status(500).json({ error: 'Error deleting post' });
          }

          // Delete the associated media file
          if (media_url) {
            const filePath = path.join(__dirname, media_url); // Construct the full file path
            fs.unlink(filePath, (fileErr) => {
              if (fileErr) {
                console.error('Error deleting media file:', fileErr);
                return res.status(500).json({ error: 'Error deleting media file' });
              }

              console.log('Media file deleted successfully');
              console.log('Post deleted successfully');
              return res.status(200).json({ message: 'Post deleted successfully' });
            });
          } else {
            console.log('Post deleted successfully (no media file to delete)');
            return res.status(200).json({ message: 'Post deleted successfully' });
          }
        });
      });
    });
  });
});



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
                return res.status(200).json({ isSaved: false, message: 'Post unsaved successfully' });
            })
            
        } else{
            database.query(savePostQuery, values, (saveError) => {
                if(saveError){
                    console.error('Error saving post', saveError);
                    return res.status(500).json({ error: 'Error saving post' });
                }
                return res.status(200).json({ isSaved: true, message: 'Post saved successfully' });
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
  
// app.get('/saved_posts', authenticateToken, (req, res) => {
//     const userId = req.user.id;
//     const post_id = req.query.post_id; // Get post_id from query params
  
//     // If post_id is provided, check if the specific post is saved
//     if (post_id) {
//       const checkSavedQuery = `
//         SELECT COUNT(*) AS save_count 
//         FROM saved_posts 
//         WHERE user_id = ? AND post_id = ?
//       `;
//       const values = [userId, post_id];
  
//       database.query(checkSavedQuery, values, (err, result) => {
//         if (err) {
//           console.error('Error checking saved post:', err);
//           return res.status(500).json({ error: 'Error checking saved post' });
//         }
  
//         const isSaved = result[0].save_count > 0;
//         return res.json({ isSaved }); // Return { isSaved: true/false }
//       });
//     } 
//     // If no post_id, return all saved posts (existing logic)
//     else {
//       const query = `
//         SELECT 
//           p.id AS post_id,
//           p.description,
//           p.media_url,
//           u.full_name,
//           u.username,
//           up.profile_pic
//         FROM saved_posts sp
//         INNER JOIN posts p ON sp.post_id = p.id
//         INNER JOIN users u ON p.user_id = u.id
//         INNER JOIN user_profiles up ON u.id = up.user_id
//         WHERE sp.user_id = ?;
//       `;
  
//       database.query(query, [userId], (err, result) => {
//         if (err) {
//           console.error('Error fetching saved posts', err);
//           return res.status(500).json({ error: 'Error fetching saved posts' });
//         }
  
//         const savedPosts = result.map(post => ({
//           post_id: post.post_id,
//           description: post.description,
//           media_url: post.media_url,
//           user: {
//             full_name: post.full_name,
//             username: post.username,
//             profile_pic: post.profile_pic,
//           },
//         }));
  
//         return res.json(savedPosts);
//       });
//     }
//   });



  app.get('/saved_posts', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const post_id = req.query.post_id; 
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 6; // Default to 10 posts per request
    const offset = (page - 1) * limit; // Calculate offset for pagination

    // If post_id is provided, check if the specific post is saved
    if (post_id) {
        const checkSavedQuery = `
            SELECT COUNT(*) AS save_count 
            FROM saved_posts 
            WHERE user_id = ? AND post_id = ?
        `;
        const values = [userId, post_id];

        database.query(checkSavedQuery, values, (err, result) => {
            if (err) {
                console.error('Error checking saved post:', err);
                return res.status(500).json({ error: 'Error checking saved post' });
            }

            const isSaved = result[0].save_count > 0;
            return res.json({ isSaved }); // Return { isSaved: true/false }
        });
    } 
    // If no post_id, return paginated saved posts
    else {
        const query = `
            SELECT 
                p.id AS post_id,
                p.description,
                p.media_url,
                u.full_name,
                u.username,
                u.id,
                up.profile_pic
            FROM saved_posts sp
            INNER JOIN posts p ON sp.post_id = p.id
            INNER JOIN users u ON p.user_id = u.id
            INNER JOIN user_profiles up ON u.id = up.user_id
            WHERE sp.user_id = ?
            ORDER BY sp.saved_at DESC
            LIMIT ? OFFSET ?
        `;

        database.query(query, [userId, limit, offset], (err, result) => {
            if (err) {
                console.error('Error fetching saved posts', err);
                return res.status(500).json({ error: 'Error fetching saved posts' });
            }

            const savedPosts = result.map(post => ({
                post_id: post.post_id,
                description: post.description,
                media_url: post.media_url,
                user: {
                    id: post.id,
                    full_name: post.full_name,
                    username: post.username,
                    profile_pic: post.profile_pic,
                },
            }));

            // Check if there are more posts left to fetch
            const hasMoreQuery = `
                SELECT COUNT(*) AS total FROM saved_posts WHERE user_id = ?
            `;

            database.query(hasMoreQuery, [userId], (err, countResult) => {
                if (err) {
                    console.error('Error checking for more saved posts', err);
                    return res.status(500).json({ error: 'Error checking for more saved posts' });
                }

                const totalSavedPosts = countResult[0].total;
                const hasMore = offset + limit < totalSavedPosts;

                return res.json({ posts: savedPosts, hasMore} );
            });
        });
    }
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

        // Insert default profile for the new user with profile_pic set to '/default-profile.svg'
        const profileSql = `
            INSERT INTO user_profiles (user_id, profile_pic, cover_photo, bio, website_url) 
            VALUES (?, '/default-profile.svg', NULL, NULL, NULL)`;
        const profileValues = [userId];

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

server.listen(3001, () => {
    console.log("server listening on port 3001")
})