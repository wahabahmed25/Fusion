import { useState, useEffect } from "react";
import axios from "axios";
import defaultProfile from "../icons/default-profile.svg"; // Adjust the path if needed
import { useParams } from "react-router";
// import FollowButton from "./FollowButton";
const SpecificUserProfile = () => {
  const [userProfile, setUserProfile] = useState({
    username: "",
    full_name: "",
    profile_pic: "",
    is_following: false,
  });
  const { user_id } = useParams(); // Get user_id from the URL
  const [error, setError] = useState("");

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Error authorizing. Please log in.");
      return;
    }

    try {
      // Fetch user profile data
      const response = await axios.get(
        `http://localhost:8081/user_profiles/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const profileData = response.data;
      console.log("Fetched Profile Data:", profileData);

      // Update state with the fetched data
      setUserProfile({
        profile_pic: profileData.profile_pic || defaultProfile,
        username: profileData.username || "No username",
        full_name: profileData.full_name || "No name",
        is_following: profileData.is_following,
      });
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Error fetching user profile. Please try again later.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id]); // Re-fetch when user_id changes

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex justify-center items-center text-center">
        <img
          src={userProfile.profile_pic}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-gray-200 mb-4"
        />
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white lowercase">@{userProfile.username}</h2>
          <p className="text-white uppercase">{userProfile.full_name}</p>
        </div>
      </div>
    </div>
  );
};

export default SpecificUserProfile;