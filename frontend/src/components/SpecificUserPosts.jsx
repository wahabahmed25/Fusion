import { useState, useEffect } from "react";
import axios from "axios";
// import PropTypes from "prop-types";
import PostCard from "./PostCard";
import { useParams } from "react-router";
const SpecificUserPosts = () => {
  const { user_id } = useParams();
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
      const response = await axios.get(
        `http://localhost:8081/posts-of-user/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // "Content-Type": "application/json",
          },
        }
      );

      setUserPosts(response.data);
      console.log("users posts: ", response.data);
      //   setError("");
      //   if (onPostsFetched) {
      //     onPostsFetched(response.data); // Share data with parent
      //   }
    } catch (error) {
      console.error(error);
      setError("error getting specific user post");
    }
  };

  useEffect(() => {
    fetchSpecificUserPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id]);
  console.log("User Posts:", userPosts);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {error && <p className="text-red-500">{error}</p>}

      {userPosts.length > 0 ? (
        userPosts.map((post) => (
          <div
            key={post.post_id}
            className="transform transition-transform hover:scale-102"
          >
            <PostCard
              media_url={post.media_url}
              description={post.description}
              post_id={post.post_id}
              comment={post.comment || null}
              save={post.save || false}
              user={post.user}
            />
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center w-full col-span-full">
          No posts yet
        </p>
      )}
    </div>
  );
};
// SpecificUserPosts.propTypes = {
//   user_id: PropTypes.number.isRequired,
//   onPostsFetched: PropTypes.func.isRequired,

// };

export default SpecificUserPosts;
