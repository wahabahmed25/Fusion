import SpecificUserProfile from "../components/SpecificUserProfile";
import SpecificUserPosts from "../components/SpecificUserPosts";
import { useParams } from "react-router";
import backIcon from "../icons/backArrow-icon.svg";
import { Link } from "react-router-dom";
import FollowCount from "../components/FollowCount";
import FollowButton from "../components/FollowButton";
import axios from "axios";
import { useState, useEffect } from "react";

const UserProfilePage = () => {
  const { user_id } = useParams();
  const userId = Number(user_id);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const checkFollowingStatus = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("error authorizing");
      setError("error authorizing");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8081/isFollowing/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(response.data.is_following);
    } catch (err) {
      console.error("error checking following status", err);
      setError("error checking following status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFollowingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id]);

  return (
    <div className="bg-gray-800 min-h-screen p-4">
      {error && <p className="text-red-500">{error}</p>}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/home" className="flex items-center gap-2">
            <img
              src={backIcon}
              alt="home"
              className="w-7 h-7 invert opacity-75 hover:opacity-100 transition-opacity"
            />
            <span className="text-white text-lg font-medium">Home</span>
          </Link>
        </div>

        <div className="bg-gray-700 rounded-xl mx-auto w-1/2 shadow-lg p-6">
          <div className="flex flex-col items-center">
            <SpecificUserProfile />
            <FollowCount user_id={userId} />
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              {loading ? (
                <div className="animate-pulse bg-gray-600 rounded-lg w-full h-10" />
              ) : (
                <>
                  <FollowButton
                    targetUserId={userId}
                    isFollowing={isFollowing}
                    className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  />
                  <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <h1 className="text-white text-2xl font-bold text-center mt-8 mb-6">
          Posts
        </h1>
        <SpecificUserPosts />
      </div>
    </div>
  );
};

export default UserProfilePage;
