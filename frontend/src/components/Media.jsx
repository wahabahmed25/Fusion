import { useState, useRef } from "react";
import UserProfilePosts from "./UserProfilePosts";
import PostCard from "./PostCard";
import SearchBar from "./SearchBar";
const Media = () => {
  const observerRef = useRef(null);
  const [media, setMedia] = useState([]);
  // const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handlePostsFetched = (posts, isLoading) => {
    setLoading(isLoading);
    setMedia((prev) => {
      const newPosts = posts.filter(
        (post) => !prev.some((p) => p.post_id === post.post_id)
      );
      return [...prev, ...newPosts]; // Only add unique posts
    });
  };

  return (
    <div className="flex justify-center overflow-auto">
      <div className="p-3 min-w-full no-scrollbar::-webkit-scrollbar">
        <SearchBar />
        <UserProfilePosts onPostsFetched={handlePostsFetched} />

        <ul>
          {media.map((post, index) => (
            <li
              key={post.post_id}
              ref={index === media.length - 1 ? observerRef : null}
            >
              <PostCard
                media_url={post.media_url}
                description={post.description}
                post_id={post.post_id}
                comment={post.comment || null}
                save={post.save || false}
                user={post.user}
              />
            </li>
          ))}
        </ul>

        {/* Ensure the loading indicator is at the bottom */}
        {loading && (
          <div className="flex justify-center mt-4">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-500 border-e-transparent"
              role="status"
            />
          </div>
        )}

        {/* <p className="bg-white flex justify-center">hello</p> */}
      </div>
    </div>
  );
};

export default Media;
