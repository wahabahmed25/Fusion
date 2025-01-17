import { useState, useEffect } from "react";
import PostCard from "./PostCard";

const Media = () => {
  const [media, setMedia] = useState([]);
  const [error, setError] = useState("");

  const fetchMedia = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Error with user authentication");
      return;
    }

    try {
      // Fetch user posts
      const postsResponse = await fetch("http://localhost:8081/user-posts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!postsResponse.ok) {
        const errorData = await postsResponse.json();
        setError(errorData.error || "Failed to fetch posts.");
        return;
      }

      const posts = await postsResponse.json();

      // Extract unique user IDs from posts
      const userIds = [...new Set(posts.map((post) => post.user_id))];

      // Fetch user profiles for those IDs
      const profilesResponse = await fetch("http://localhost:8081/user_profiles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_ids: userIds }),
      });

      if (!profilesResponse.ok) {
        const errorData = await profilesResponse.json();
        setError(errorData.error || "Failed to fetch user profiles.");
        return;
      }

      const userProfiles = await profilesResponse.json();

      // Merge posts with corresponding user profiles
      const enrichedPosts = posts.map((post) => ({
        ...post,
        user: userProfiles.find((user) => user.id === post.user_id),
      }));

      setMedia(enrichedPosts);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  return (
    <div className="flex justify-center">
      <div className="p-3 min-w-full">
        {error && <p className="text-red-500">{error}</p>}
        <ul>
          {media.map((post) => (
            <PostCard
              key={post.id}
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
