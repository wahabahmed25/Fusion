import axios from "axios";
import { useState } from "react";
import PropTypes from "prop-types";

const FollowButton = ({ targetUserId, isFollowing }) => {
  const [following, setfollowing] = useState(isFollowing);
  const [error, setError] = useState("");
  const handleClick = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("error authorzing");
      setError("error authorizing");
      return;
    }
    try {
        const action = following ? "unfollow" : "follow";
      const response = await axios.post("http://localhost:8081/follow-user", {targetUserId, action}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setfollowing(!following);
    } catch (error) {
      console.error("error following/unfollowing;", error);
      setError("error un/following user");
    }
  };

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <button className="bg-blue-300 mt-2 py-1 px-2 rounded-md text-sm" onClick={handleClick}>{following ? "unfollow" : "Follow"}</button>
    </div>
  );
};

FollowButton.propTypes = {
    targetUserId: PropTypes.number.isRequired,
    isFollowing: PropTypes.any,
}

export default FollowButton;