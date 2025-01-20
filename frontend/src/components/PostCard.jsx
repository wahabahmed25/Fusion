import PropTypes from "prop-types";
import commentIcon from "../icons/comment-icon.svg";
import saveIcon from "../icons/save-icon.svg";
// import heartIcon from "../icons/heart-icon.svg";
// import filledHeartIcon from "../icons/redHeart-icon.svg"; // Add a filled heart icon for 'liked' state
// import { useState } from "react";
import defaultProfile from "../icons/default-profile.svg"; // or adjust the relative path if needed
import LikeButton from "./LikeButton";
const PostCard = ({
  media_url,
  description,
  comment = 0,
  save = false,
  post_id,
  likes,
  // like = 0,
  user, // User profile data passed from Media.jsx
}) => {
  const imageUrl = `http://localhost:8081/${media_url}`;
  // const [likes, setLikes] = useState(like); // Initialize with the passed "like" prop
  // const [isLiked, setIsLiked] = useState(false);

  // const handleLikes = () => {
  //   const newLikes = isLiked ? likes - 1 : likes + 1; // Toggle likes count
  //   setLikes(newLikes);
  //   setIsLiked((prev) => !prev);
  //   if (onLike) onLike(newLikes, !isLiked); // Inform parent if needed
  // };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 max-w-md mx-auto my-4">
      {/* User Profile Section */}
      {user && (
        <div className="flex items-center mb-4">
          <img
            src={user.profile_pic || defaultProfile} // Default profile pic if not provided
            alt="null"
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-bold lowercase">@{user.username || "Unknown"}</p>
            <p className="text-xs text-gray-600 uppercase">{user.name || "Anonymous"}</p>
          </div>
        </div>
      )}

      {/* Post Description */}
      <div className="mt-4">
        <h3 className="text-md px-1 pb-2 text-gray-800">{description}</h3>
      </div>

      {/* Post Image */}
      <div className="w-full h-80 overflow-hidden rounded-md mb-4">
        <img
          src={imageUrl}
          alt="Post"
          className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
        />
      </div>

      {/* Post Actions */}
       <div className="mt-4 flex justify-between items-center text-gray-600">
        <div className="flex items-center gap-4">
          <LikeButton post_id={post_id} likes = {likes} />

          {/* Comment */}
          <div className="flex items-center gap-1">
            <button className="text-green-500 hover:text-green-600">
              <img src={commentIcon} alt="comment" className="w-6 h-6" />
            </button>
            <span className="text-sm">{comment}</span>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center">
          <button
            className={`text-yellow-500 hover:text-yellow-600 ${
              save ? "font-bold" : ""
            }`}
          >
            <img src={saveIcon} alt="save" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

PostCard.propTypes = {
  media_url: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  like: PropTypes.number,
  comment: PropTypes.number,
  save: PropTypes.bool,
  likes: PropTypes.number,
  post_id: PropTypes.number.isRequired,
  onLike: PropTypes.func, // Optional callback for parent component
  user: PropTypes.shape({
    profile_pic: PropTypes.string,
    username: PropTypes.string,
    name: PropTypes.string,
  }), // Define user profile shape
};

export default PostCard;
