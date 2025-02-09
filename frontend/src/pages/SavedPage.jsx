import { useState, useEffect } from "react";
// import PropTypes from "prop-types";
import PostCard from "../components/PostCard";
// import { useParams } from "react-router-dom";
import backIcon from "../icons/backArrow-icon.svg";
import { Link } from "react-router-dom";
const Saved = () => {
  // const { post_id } = useParams();
  const [page, setPage] = useState(1);
  const [savedPosts, setSavedPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  useEffect(() => {
    fetchSavedPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleScroll = () => {
    // console.log('height: ', document.documentElement.scrollHeight);
    // console.log("top: ", document.documentElement.scrollTop);
    // console.log("window: ",window.innerHeight);
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
        document.documentElement.scrollHeight &&
      hasMorePosts
    ) {
      setPage((prev) => prev + 1);
      setLoading(true);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSavedPosts = async (page) => {
    if (!hasMorePosts) return;
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing");
      console.error("error authorizing");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8081/saved_posts?page=${page}&limit=6`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.error("error fetching saved posts");
        setError("error fetching saved posts");
      }
      const savedData = await response.json();
      // setPosts((prev) =>
      //   page === 1 ? postsData.posts : [...prev, ...postsData.posts]
      // );
      setSavedPosts((prev) =>
        page === 1 ? savedData.posts : [...prev, ...savedData.posts]
      );
      setHasMorePosts(savedData.hasMore);
      console.log("saved sata respinse: ", savedPosts);
      console.log("saved data:", savedData);
    } catch (error) {
      console.error("somethign went wrong (savedPage.jsx)", error);
      setError("something went wrong (savedPage.jsx)");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <Link to="/home">
        <img src={backIcon} alt="back" className="w-7 h-7 ml-14 invert" />
      </Link>

      <h1 className="text-3xl font-extrabold text-white text-center mb-6 animate-fade-in">
        Your Saved Posts
      </h1>
      <div className="grid gap-6 max-w-4xl mx-auto">
        {savedPosts.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {savedPosts.map((post) => (
              <li
                key={post.post_id}
                className="rounded-lg transform hover:scale-105 transition duration-300 ease-in-out animate-fade-in-up"
              >
                <Link to = {`/userProfilePage/${post.user.id}`}>
                  <PostCard
                    post_id={post.post_id}
                    media_url={post.media_url}
                    description={post.description}
                    user={post.user}
                    comment={post.comment || null}
                    save={post.save || false}
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600 text-lg animate-pulse">
            No saved posts yet.
          </p>
        )}

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
        {!hasMorePosts && savedPosts.length > 0 && (
          <div className="text-center text-gray-400 mt-4">
            <h1>No more Saved posts</h1>
          </div>
        )}
      </div>
    </div>
  );
};

{
  /* <ul>
          {media.map((post) => (
            <li key = {post.post_id}>
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
            
          ))} */
}
// </ul>
// Saved.propTypes = {
//   post_id: PropTypes.number.isRequired,
// }

export default Saved;
