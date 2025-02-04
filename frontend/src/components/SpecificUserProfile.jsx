import { useState, useEffect } from "react";
import axios from "axios";
// import defaultProfile from "../icons/default-profile.svg";
import { useParams } from "react-router";

const SpecificUserProfile = () => {
  const [userProfile, setUserProfile] = useState({
    username: "",
    full_name: "",
    profile_pic: "",
  });
  const { user_id } = useParams();
  const [error, setError] = useState("");

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Error authorizing. Please log in.");
      return;
    }

    try {
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
    //   const img = new Image();
    //   img.src = `http://localhost:8081${profileData.profile_pic}`;
        setUserProfile({
          username: profileData.username || "No username",
          full_name: profileData.full_name || "No name",
          profile_pic: profileData.profile_pic,
        });
      
      console.log("Final Image Path:", userProfile.profile_pic);

      console.log("this is specific user data: ", response.data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Error fetching user profile. Please try again later.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id]);

  return (
    <div className="text-center mb-4">
      {error && <p className="text-red-500">{error}</p>}
      <img
        
        src={userProfile.profile_pic}
        alt="Profile"
        className="w-32 h-32 rounded-full border-4 border-gray-200 mx-auto mb-4"
        onLoad={(e) => e.target.classList.remove("opacity-0")}
      />
      <h2 className="text-2xl font-bold text-white lowercase">
        @{userProfile.username}
      </h2>
      <p className="text-white uppercase">{userProfile.full_name}</p>
    </div>
  );
};

export default SpecificUserProfile;
