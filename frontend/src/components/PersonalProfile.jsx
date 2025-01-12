import defaultProfile from "../icons/default-profile.svg"; // or adjust the relative path if needed
import { useEffect, useState } from "react";

const PersonalProfile = () => {
  const [yourProfile, setYourProfile] = useState({
    profile_pic: "",
    username: "",
    name: "",
  });

  useEffect(() => {
    // Fetch user profile first
    fetch("http://localhost:8081/user_profiles")
      .then((response) => response.json())
      .then((profileData) => {
        console.log("profile data", profileData)
        // Check if profileData has user_id and proceed to fetch user data
        if (profileData && profileData.user_id) {
          fetch(`http://localhost:8081/users/${profileData.user_id}`)
            .then((response) => response.json())
            .then((userData) => {
                console.log("user data: ", userData)
              setYourProfile({
                profile_pic: profileData.profile_pic || defaultProfile, // Fallback if no profile pic
                username: userData.username || "No username", // Handle missing username
                name: userData.full_name || "No name", // Handle missing full_name
              });
            })
            .catch((err) => console.error("Error fetching user data: ", err));
        }
      })
      
      .catch((err) => console.error("Error fetching user profile: ", err));
  }, []);
  return (
    <div>
      <div className="text-white">
        <h1 className="text-white">Your profile</h1>
        <img 
            src = {yourProfile.profile_pic}
            alt = "empty"
            className="w-32 h-32 rounded-full object-cover"
        />

        <p>{yourProfile.username}</p>
        <p>{yourProfile.name}</p>
      </div>
    </div>
  );
};

export default PersonalProfile;
