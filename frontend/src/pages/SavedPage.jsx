import { useState, useEffect } from "react";
// import PropTypes from "prop-types";
import PostCard from "../components/PostCard";
// import { useParams } from "react-router-dom";

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
  }, []);
  return (
    <div className="">
      {error && <p className="text-red-500">{error}</p>}
      <h1 className="text-2xl font-bold mb-4">Saved Posts</h1>
      <div className="grid gap-6">
        <div>
          <ul className="">
            {savedPosts.map((post) => (
              console.log("rendering posts: ", post),
              <li key={post.post_id}>
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
        </div>
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
