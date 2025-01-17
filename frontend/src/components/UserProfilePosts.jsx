import { useState, useEffect } from "react";

const UserProfilePosts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchUserPosts = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("error authorizing user");
        setError("Authorization error. Please log in.");
        return;
      }
      try {
        const response = await fetch("http://localhost:8081/user-posts", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error("error fetching posts");
          setError("Failed to fetch posts.");
          return;
        } 
        const postsData = await response.json();
        setPosts(postsData)
        
            
      } catch (error) {
        console.error("error occured",error);
        setError("Something went wrong. Please try again later.");

      }
    };
    fetchUserPosts();
  }, []);


  if (error) return <p>{error}</p>; // Show an error message

  return (
    <div className="post-container">
      {posts.map((post) => (
        <div key={post.post_id} className="post">
          {/* User Profile Section */}
          <div className="user-profile">
            <img
              src={post.user.profile_pic}
              alt={`${post.user.username}'s profile`}
              className="profile-pic"
            />
            <div>
              <p className="username">@{post.user.username}</p>
              <p className="name">{post.user.name}</p>
            </div>
          </div>

          {/* Post Content */}
          <div className="post-content">
            <p className="description">{post.description}</p>
            {post.media_url && (
              <img
                src={post.media_url}
                alt="Post media"
                className="post-media"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserProfilePosts;
