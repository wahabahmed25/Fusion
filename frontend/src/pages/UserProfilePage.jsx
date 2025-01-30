import SpecificUserProfile from "../components/SpecificUserProfile";
import SpecificUserPosts from "../components/SpecificUserPosts";
import { useParams } from "react-router";
import FollowCount from "../components/FollowCount";
import backIcon from "../icons/backArrow-icon.svg";
import { Link } from "react-router-dom";
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
      console.error("erro authorizing");
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
      console.log("response: ", response.data);
      setIsFollowing(response.data.is_following);
    } catch (err) {
      console.error("error checking following status", err);
      setError("error checking error status");
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
        {/* Back Icon and Home Text */}
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

        {/* Profile Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Left Side: User Profile */}
          <div className="bg-gray-700 flex justify-center items-center rounded-xl shadow-lg p-6 w-full md:w-1/3">
            <SpecificUserProfile />
            <FollowCount user_id={userId} />
            <div className="flex justify-center gap-4 mt-4">
              {loading ? (
                <div className="animate-pulse bg-gray-200 rounded-lg w-24 h-8" />
              ) : (
                <>
                  <FollowButton targetUserId={userId} isFollowing={isFollowing} />
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Side: Follow Count, Follow Button, and Message Button */}
          {/* <div className="bg-gray-700 text-center items-center flex rounded-xl justify-center shadow-lg p-6 w-full md:w-2/3">
            
          </div> */}
        </div>

        {/* Posts Section */}
        <h1 className="text-white text-2xl font-bold text-center mb-6">Posts</h1>
        <SpecificUserPosts />
      </div>
    </div>
  );
};


export default UserProfilePage;
