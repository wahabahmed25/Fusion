import { useState, useEffect } from "react";
import axios from "axios";
// import PropTypes from "prop-types";
import PostCard from "./PostCard";
import { useParams } from "react-router";
const SpecificUserPosts = () => {
  const { user_id } = useParams();
  const [error, setError] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSpecificUserPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id, page]);

  const handleScroll = () => {
    // console.log('height: ', document.documentElement.scrollHeight);
    // console.log("top: ", document.documentElement.scrollTop);
    // console.log("window: ",window.innerHeight);
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
      document.documentElement.scrollHeight
    ) {
      setPage((prev) => prev + 1);
      setLoading(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchSpecificUserPosts = async () => {
    if(loading && !hasMorePosts) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing");
      console.error("error authorizing");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8081/posts-of-user/${user_id}?page=${page}&limit=6`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // "Content-Type": "application/json",
          },
        }
      );

      const postData = response.data;
      setUserPosts((prev) => page === 1 ? postData.posts : [...prev, ...postData.posts]);
      setHasMorePosts(postData.hasMore);
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

{loading && hasMorePosts && (
          <div className="flex justify-center mt-4">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-500 border-e-transparent"
              role="status"
            />
          </div>
        )}

        {/* Show message when no more posts are available */}
        {!hasMorePosts && userPosts.length > 0 && (
          <div className="text-center text-gray-400 mt-4 flex justify-center items-center">
            <h1>No more posts</h1>
          </div>
        )}
    </div>
  );
};
// SpecificUserPosts.propTypes = {
//   user_id: PropTypes.number.isRequired,
//   onPostsFetched: PropTypes.func.isRequired,

// };

export default SpecificUserPosts;
