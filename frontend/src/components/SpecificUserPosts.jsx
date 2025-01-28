import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import PostCard from "./PostCard";
const SpecificUserPosts = ({ user_id }) => {
  const [error, setError] = useState("");
  const [userPosts, setUserPosts] = useState([]);

  const fetchSpecificUserPosts = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing");
      console.error("error authorizing");
      return;
    }
    try {
      const response = axios.get(
        `http://localhost:8081/posts-of-user/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserPosts(response.data);
      console.log(response.data);
      setError("");
    } catch (error) {
      console.error(error);
      setError("error getting specific user post");
    }
  };

  useEffect(() => {
    fetchSpecificUserPosts();
  });
  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}

      {userPosts.map((post) => (
        <div key={post.post_id} className="w-full">
          <PostCard
            media_url={post.media_url}
            description={post.description}
            post_id={post.post_id}
            comment={post.comment || null}
            save={post.save || false}
            user={post.user} // Pass user profile info to PostCard
          />
        </div>
      ))}
    </div>
  );
};
SpecificUserPosts.propTypes = {
  user_id: PropTypes.number.isRequired,
};
export default SpecificUserPosts;
