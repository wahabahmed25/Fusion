import { useState, useEffect } from "react";
import { extractFirstName } from "./SigninValidation";
import defaultProfile from "../icons/default-profile.svg";

const SuggestedUserProfile = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        const response = await fetch("http://localhost:8081/user_profiles", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const userData = await response.json();
        console.log("Fetched user profiles: ", userData);

        // Ensure userData is an array
        const profilesArray = Array.isArray(userData)
          ? userData
          : userData.profiles || []; // Adjust based on API response

        if (profilesArray.length === 0) {
          setUserProfiles([]);
          return;
        }

        const profiles = await Promise.all(
          profilesArray.map(async (user) => {
            const userResponse = await fetch(
              `http://localhost:8081/users/${user.user_id}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (!userResponse.ok) {
              throw new Error(`HTTP error! Status: ${userResponse.status}`);
            }
            const userDetails = await userResponse.json();
            return {
              profile_pic: user.profile_pic || defaultProfile,
              username: userDetails.username || "No username",
              name: extractFirstName(userDetails.full_name) || "No name",
            };
          })
        );

        setUserProfiles(profiles);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSuggestedUsers();
  }, []);
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="flex justify-end p-4 fixed w-full">
      <div className="text-gray-800 w-1/4 bg-gray-100 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Suggested Users</h2>
        <ul>
          {userProfiles.length === 0 ? (
            <p>No users to display.</p>
          ) : (
            userProfiles.map((profile, index) => (
              <li key={index} className="flex items-center mb-4">
                <img
                  src={profile.profile_pic}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div>
                  <p className="text-sm font-semibold capitalize">
                    {profile.name}
                  </p>
                  <p className="text-xs text-gray-500">@{profile.username}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default SuggestedUserProfile;
