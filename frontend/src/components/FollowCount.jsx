import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const FollowCount = ({ user_id }) => {
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [error, setError] = useState("");
  const fetchFollowCount = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorzing");
      console.error("error authorizing");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8081/follow-counts/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("fetched follow count: ", response.data);
      setFollowerCount(response.data.follower_count);
      setFollowingCount(response.data.following_count);
    } catch (err) {
      console.error(err || err.response || err.message);
      setError("error getting follow count");
    }
  };

  useEffect(() => {
    fetchFollowCount();
    console.log("Received user_id:", user_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id]);
  return (
    <div className="flex space-x-8">
    {error && <p className="text-red-500">{error}</p>}

      {/* Followers Count */}
      <div className="text-center transition-transform transform hover:scale-105">
        <h1 className="text-2xl font-bold text-white">{followerCount}</h1>
        <p className="text-gray-400 text-sm">Followers</p>
      </div>

      {/* Following Count */}
      <div className="text-center transition-transform transform hover:scale-105">
        <h1 className="text-2xl font-bold text-white">{followingCount}</h1>
        <p className="text-gray-400 text-sm">Following</p>
      </div>
    </div>
  );
};
FollowCount.propTypes = {
  user_id: PropTypes.number.isRequired,
};

export default FollowCount;
