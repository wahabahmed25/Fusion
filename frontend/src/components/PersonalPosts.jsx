import { useState, useEffect } from "react";
import axios from "axios";
import PostCard from "./PostCard";
const PersonalPosts = () => {
  const [myPosts, setMyPosts] = useState([]);
  const [error, setError] = useState("");

  const fetchPersonalPosts = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing");
      console.error("error authorzing");
      return;
    }
    try {
      const response = await axios.get("http://localhost:8081/personal-posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMyPosts(response.data);
      console.log("fetched personal posts: ", response.data);
    } catch (error) {
      console.error(error);
      setError("error fetching personal posts");
    }
  };

  useEffect(() => {
    fetchPersonalPosts();
  }, []);

  return (
    <div className="grid ">
      {error && <p className="text-red-500">{error}</p>}

      
      <ul>
        {myPosts.map((post) => (
          <li key={post.post_id}>
            
            <PostCard
            
              media_url={post.media_url}
              description={post.description}
              post_id={post.post_id}
              // like = {post.like}
              comment={post.comment || null}
              save={post.save || false}
              user={post.user} // Pass user profile info to PostCard
            />
            
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonalPosts;
