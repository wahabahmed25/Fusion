import { useState, useEffect } from "react";
import axios from "axios";
import PostCard from "./PostCard";
const PersonalPosts = () => {
  const [myPosts, setMyPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPersonalPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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
  }, [hasMorePosts]);

  const fetchPersonalPosts = async () => {
    if (loading && !hasMorePosts) return; // Prevent multiple requests
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing");
      console.error("error authorzing");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8081/personal-posts?page=${page}&limit=6`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const postData = response.data;
      // console.log("personal posts:", postData)
      // setMyPosts((prev) => {
      //   const newPosts = postData.filter(
      //     (post) => !prev.some((p) => p.post_id === post.post_id)
      //   );
      //   return [...prev, ...newPosts]; // Only add unique posts
      // });
      
      setMyPosts((prev) => page === 1 ? postData.posts : [...prev, ...postData.posts]);
      setHasMorePosts(postData.hasMore);
      console.log("fetched personal posts: ", response.data);
    } catch (error) {
      console.error(error);
      setError("error fetching personal posts");
    }
  };

  



  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}

      {/* Grid Container */}
      <div className="grid grid-cols-2 gap-4">
        {myPosts.map((post) => (
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

        {/* Show loading spinner only when there are more posts */}
        {loading && hasMorePosts && (
          <div className="flex justify-center mt-4">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-500 border-e-transparent"
              role="status"
            />
          </div>
        )}

        {/* Show message when no more posts are available */}
        {!hasMorePosts && myPosts.length > 0 && (
          <div className="text-center text-gray-400 mt-4 flex justify-center items-center">
            <h1>No more posts</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalPosts;
