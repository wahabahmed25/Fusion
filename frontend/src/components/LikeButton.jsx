import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import filledHeartIcon from "../icons/redHeart-icon.svg"; // Add a filled heart icon for 'liked' state
import heartIcon from "../icons/heart-icon.svg";

// //come back later
// like table:
// id, user_id, post_id
const LikeButton = ({ post_id }) => {
  const [currentLikes, setCurrentLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState("");
  console.log("Post object in LikeButton:", post_id); // Debugging log

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if(!token){
      console.error("error authorizing");
    }
    const fetchLikes = async () => {
      try{
        const response = await fetch(`http://localhost:8081/likes/${post_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if(!response.ok){
          throw new Error("Failed to fetch likes");

        }
        const likeData = await response.json();
        setCurrentLikes(likeData.likeCount);
        setIsLiked(likeData.isLiked);
      } catch(error){
        setError("Error fetching likes");
        console.error(error);

      }
    }
    fetchLikes();
  }, [post_id])

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
        body: JSON.stringify({ post_id }),
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
      <button onClick={handleClick} className="flex items-center gap-1">
        <img 
          src={isLiked ? filledHeartIcon : heartIcon}
          alt="like"
          className="w-6 h-6"
        
        />
        <span className="text-sm">{currentLikes}</span>
        
      </button>
    </div>
  );
};


LikeButton.propTypes = {
  post_id: PropTypes.number.isRequired,
};
export default LikeButton;
