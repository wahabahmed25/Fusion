import defaultProfile from "../icons/default-profile.svg"; // or adjust the relative path if needed
import { useEffect, useState } from "react";

const PersonalProfile = () => {
  const [yourProfile, setYourProfile] = useState({
    profile_pic: "",
    username: "",
    name: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken"); // Retrieve token from storage
    console.log("this is token (personal profile", token);

    if (!token) {
      console.error("No token found! Please log in.");
      return;
    }

    // Fetch user profile
    fetch("http://localhost:8081/user_profiles", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((profileData) => {
        console.log("Profile data: ", profileData);
        if (profileData && profileData.user_id) {
          return fetch(`http://localhost:8081/users/${profileData.user_id}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then((userData) => {
              console.log("User data: ", userData);
              setYourProfile({
                profile_pic: profileData.profile_pic || defaultProfile,
                username: userData.username || "No username",
                name: userData.full_name || "No name",
              });
            });
        }
        throw new Error("Invalid profile data!");
      })
      .catch((err) => console.error("Error fetching data: ", err));
  }, []);
  return (
    <div>
      <div className="text-white">
        <h1 className="text-white">Your profile</h1>
        <img
          src={yourProfile.profile_pic}
          alt="empty"
          className="w-32 h-32 rounded-full object-cover"
        />

        <p>{yourProfile.username}</p>
        <p>{yourProfile.name}</p>
      </div>
    </div>
  );
};

export default PersonalProfile;
