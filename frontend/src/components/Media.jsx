import { useState } from "react";
import UserProfilePosts from "./UserProfilePosts";
import PostCard from "./PostCard";
import SearchBar from "./SearchBar";
const Media = () => {
  const [media, setMedia] = useState([]);
  // const [error, setError] = useState("");

  const handlePostsFetched = (posts) => {
    setMedia(posts); // Save posts from UserProfilePosts
  };

  return (
    <div className="flex justify-center overflow-auto">
      <div className="p-3 min-w-full no-scrollbar::-webkit-scrollbar">
        {/* {error && <p className="text-red-500">{error}</p>} */}
        <SearchBar />
        <UserProfilePosts onPostsFetched={handlePostsFetched} />
        <ul>
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
            
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Media;
