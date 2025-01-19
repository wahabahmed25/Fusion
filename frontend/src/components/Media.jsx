import { useState } from "react";
import UserProfilePosts from "./UserProfilePosts";
import PostCard from "./PostCard";

const Media = () => {
  const [media, setMedia] = useState([]);
  // const [error, setError] = useState("");

  const handlePostsFetched = (posts) => {
    setMedia(posts); // Save posts from UserProfilePosts
  };

  return (
    <div className="flex justify-center">
      <div className="p-3 min-w-full">
        {/* {error && <p className="text-red-500">{error}</p>} */}
        <UserProfilePosts onPostsFetched={handlePostsFetched} />
        <ul>
          {media.map((post) => (
            <PostCard
              key={post.post_id}
              media_url={post.media_url}
              description={post.description}
              like={post.like || 0}
              comment={post.comment || 0}
              save={post.save || false}
              user={post.user} // Pass user profile info to PostCard
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Media;
