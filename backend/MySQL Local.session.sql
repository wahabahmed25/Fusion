
-- DROP TABLE IF EXISTS saved_posts;
-- DROP TABLE IF EXISTS friend_requests;
-- DROP TABLE IF EXISTS user_settings;
-- DROP TABLE IF EXISTS activity_log;
-- DROP TABLE IF EXISTS notifications;
-- DROP TABLE IF EXISTS post_tags;
-- DROP TABLE IF EXISTS tags;
-- DROP TABLE IF EXISTS messages;
-- DROP TABLE IF EXISTS user_profiles;
-- DROP TABLE IF EXISTS followers;
-- DROP TABLE IF EXISTS likes;
-- DROP TABLE IF EXISTS comments;
-- DROP TABLE IF EXISTS posts;
-- DROP TABLE IF EXISTS users;

CREATE DATABASE IF NOT EXISTS socialmedia_app;
SHOW DATABASES;
SHOW TABLES;

USE socialmedia_app;
SELECT DATABASE();

-- table to store users

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,     /* With every user, give unique id automatically */
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Posts
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    description TEXT,
    media_url VARCHAR(255),     /* file path/url for the img/vid associated with the post */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    /* timestamp for when the post was created */
    FOREIGN KEY (user_id) REFERENCES users(id)    /* reference to the user who created the post (from user table) */
);

-- allows users to share/repost content
ALTER TABLE posts ADD COLUMN shared_post_id INT NULL;
ALTER TABLE posts ADD FOREIGN KEY (shared_post_id) REFERENCES posts(id);

-- Comments
SELECT COUNT(*) AS comments_count FROM comments WHERE post_id = 1;

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    post_id INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- Likes
-- query to count the number of likes for a specific post
SELECT COUNT(*) AS likes_count FROM likes WHERE post_id = 1;

-- count the number of likes for a comment
SELECT COUNT(*) AS likes_count FROM likes WHERE comment_id = 1;

CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    post_id INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    UNIQUE (user_id, post_id)     /* ensures a user can only like a post once */
);

-- Followers
CREATE TABLE followers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_user_id INT NOT NULL,
    following_user_id INT NOT NULL,
    FOREIGN KEY (follower_user_id) REFERENCES users(id),
    FOREIGN KEY (following_user_id) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_user_id, following_user_id)     /* ensures follower-following isn't duplicated to prevent redundancy */
);

-- User profile
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    profile_pic VARCHAR(255),
    cover_photo VARCHAR(255),
    bio TEXT,
    website_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Messaging others
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_user_id INT NOT NULL,
    receiver_user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_user_id) REFERENCES users(id),
    FOREIGN KEY (receiver_user_id) REFERENCES users(id)
);

-- Tags
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id),
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,  /* E.g., "like", "comment", "follow" */
    source_id INT NOT NULL,                  /* ID of the post/comment/follower */
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    setting_name VARCHAR(100),
    setting_value VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- users can send friend requests
CREATE TABLE friend_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_user_id INT NOT NULL,
    receiver_user_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_user_id) REFERENCES users(id),
    FOREIGN KEY (receiver_user_id) REFERENCES users(id)
);

-- Save posts for later
CREATE TABLE saved_posts (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    PRIMARY KEY (user_id, post_id)
);
CREATE TABLE test_table (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    PRIMARY KEY (user_id, post_id)
);


CREATE INDEX idx_user_id ON posts(user_id);
CREATE INDEX idx_post_id ON comments(post_id);


SHOW VARIABLES LIKE 'datadir';


SHOW TABLES;

SELECT @@hostname, @@port, DATABASE();


START TRANSACTION;

INSERT INTO users (username, email, password, bio) VALUES
('john_doe', 'john@example.com', 'password123', 'Web developer who loves to code.'),
('jane_smith', 'jane@example.com', 'securepass456', 'Graphic designer and coffee enthusiast.'),
('alice_wonder', 'alice@wonderland.com', 'wonderland789', 'Adventurer exploring new opportunities.');

COMMIT;
SELECT * FROM users;

