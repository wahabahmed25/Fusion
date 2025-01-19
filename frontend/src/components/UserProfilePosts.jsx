import { useState, useEffect } from "react";

import PropTypes from "prop-types";

const UserProfilePosts = ({ onPostsFetched }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
    console.log(posts);
  useEffect(() => {
    const fetchUserPosts = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Error authorizing user");
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
          console.error("Error fetching posts");
          setError("Failed to fetch posts.");
          return;
        }
        const postsData = await response.json();
        setPosts(postsData);
        if (onPostsFetched) {
          onPostsFetched(postsData); // Share data with parent
        }
      } catch (error) {
        console.error("Error occurred", error);
        setError("Something went wrong. Please try again later.");
      }
    };
    fetchUserPosts();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div className="post-container">
      {/* {posts.map((post) => (
        <div key={post.post_id} className="post">
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
      ))} */}
    </div>
  );
};

UserProfilePosts.propTypes = {
    onPostsFetched: PropTypes.func.isRequired
}

export default UserProfilePosts;
