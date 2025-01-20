import { useState } from "react";
import PropTypes from "prop-types";

// //come back later
// like table:
// id, user_id, post_id
const LikeButton = ({ post_id, likes }) => {
  const [currentLikes, setCurrentLikes] = useState(likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState("");
  console.log("Post object in LikeButton:", post_id); // Debugging log

  // const handleLikes = ({ post }) => {
  //   const newLikes = isLiked ? likes - 1 : likes + 1; // Toggle likes count
  //   setLikes(newLikes);
  //   setIsLiked((prev) => !prev);
  //   // if (onLike) onLike(newLikes, !isLiked); // Inform parent if needed
  // };

  const handleClick = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Error authorizing");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({post_id}),
      });

      if (!response.ok) {
        throw new Error("Failed to update likes");
      }

      const likeData = await response.json();
      setCurrentLikes(likeData.likeCount);
      setIsLiked((prev) => !prev);
    } catch (error) {
      console.error(error);
      setError("Error liking post");
    }
  };

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleClick}>
        {isLiked ? `Unlike (${currentLikes })` : `Like (${currentLikes })`}
      </button>
    </div>
  );
};
//  <div className="mt-4 flex justify-between items-center text-gray-600">
//       {/* Like and Comment */}
//       <div className="flex items-center gap-4">
//         {/* Like */}
//         <div className="flex items-center gap-1">
//           <button
//             className={`hover:text-blue-600 ${
//               isLiked ? "text-red-500" : "text-gray-500"
//             }`}
//             onClick={handleLikes}
//           >
//             <img
//               src={isLiked ? filledHeartIcon : heartIcon}
//               alt="like"
//               className="w-6 h-6"
//             />
//           </button>
//           <span className="text-sm">{likes}</span>
//         </div>

LikeButton.propTypes = {
  post_id: PropTypes.number.isRequired,
  likes: PropTypes.number,
};
export default LikeButton;
