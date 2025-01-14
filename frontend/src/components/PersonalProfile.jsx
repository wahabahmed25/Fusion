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
      <div className="text-white p-2 px-6 rounded-lg shadow-lg w-42 text-center flex">
        <img
          src={yourProfile.profile_pic}
          alt="empty"
          className="w-24 h-24 rounded-full object-cover mr-4"
        />
        <div className="flex flex-col justify-center">
          <p className="text-white text-xl font-semibold mb-2 whitespace-nowrap">{yourProfile.name}</p>

          <p className="text-gray-400 text-sm whitespace-nowrap">{yourProfile.username}</p>

        </div>
        
        
        
      </div>

    </div>
  );
};

export default PersonalProfile;
