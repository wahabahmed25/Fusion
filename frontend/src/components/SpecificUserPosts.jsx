import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import PostCard from "./PostCard";
const SpecificUserPosts = ({ user_id, onPostsFetched }) => {
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
        const response = await axios.get(`http://localhost:8081/user_profiles`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        const userId = response.data.user_id
      const userResponse = axios.get(
        `http://localhost:8081/posts-of-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

      );
      setUserPosts(userResponse.data);
      console.log(response.data);      console.log(response.data);
      console.log(userResponse.data);

      setError("");
      if (onPostsFetched) {
        onPostsFetched(response.data); // Share data with parent
      }
    } catch (error) {
      console.error(error);
      setError("error getting specific user post");
    }
  };

  useEffect(() => {
    fetchSpecificUserPosts();
  }, [user_id]);
  console.log("User Posts:", userPosts);
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
            user={post.user || { user_id: -1, username: "Unknown", profile_pic: "no pfp" }} // Pass user profile info to PostCard
          />
        </div>
      ))}
    </div>
  );
};
SpecificUserPosts.propTypes = {
  user_id: PropTypes.number.isRequired,
  onPostsFetched: PropTypes.func.isRequired,

};


export default SpecificUserPosts;
