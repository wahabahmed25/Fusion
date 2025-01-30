import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const UserProfilePosts = ({ onPostsFetched }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  console.log(posts);

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

  useEffect(() => {
    fetchUserPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div className="">
      
    </div>
  );
};

UserProfilePosts.propTypes = {
  onPostsFetched: PropTypes.func,
};

export default UserProfilePosts;
