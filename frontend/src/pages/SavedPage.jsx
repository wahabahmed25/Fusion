import { useState, useEffect } from "react";
// import PropTypes from "prop-types";
import PostCard from "../components/PostCard";
// import { useParams } from "react-router-dom";
import backIcon from "../icons/backArrow-icon.svg"
import { Link } from "react-router";
const Saved = () => {
  // const { post_id } = useParams();
  const [savedPosts, setSavedPosts] = useState([]);
  const [error, setError] = useState("");

  const fetchSavedPosts = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing");
      console.error("error authorizing");
      return;
    } 
    try {
      const response = await fetch(`http://localhost:8081/saved_posts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        console.error("error fetching saved posts");
        setError("error fetching saved posts");
      }
      const savedData = await response.json();
      setSavedPosts(savedData);
      console.log(savedPosts);
      console.log("saved data:", savedData);
    } catch (error) {
      console.error("somethign went wrong (savedPage.jsx)", error);
      setError("something went wrong (savedPage.jsx)");
    }
  };

  useEffect(() => {
    fetchSavedPosts();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="min-h-screen bg-gray-800 py-8 px-4">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <Link to="/home">
        <img 
          src={backIcon}
          alt="back"
          className="w-7 h-7 ml-14 invert"
        
        />
        
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
                <PostCard
                  post_id={post.post_id}
                  media_url={post.media_url}
                  description={post.description}
                  user={post.user}
                  comment={post.comment || null}
                  save={post.save || false}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600 text-lg animate-pulse">
            No saved posts yet.
          </p>
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
