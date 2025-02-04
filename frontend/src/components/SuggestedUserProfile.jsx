import { useState, useEffect } from "react";
// import { extractFirstName } from "./SigninValidation";
// import defaultProfile from "../icons/default-profile.svg";
// import { useResolvedPath } from "react-router";
import FollowButton from "./FollowButton";
const SuggestedUserProfile = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [error, setError] = useState(null);

  const getRandomUser = (users, count) => {
    return users.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  const fetchSuggestedUsers = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing");
      return;
    }
    try {
      const response = await fetch("http://localhost:8081/suggested-users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("error fetching suggested users");
        setError("error fetching suggested users");
      }

      const suggestedUserData = await response.json();
      console.log("Fetched suggested user profiles: ", suggestedUserData);
      setUserProfiles(getRandomUser(suggestedUserData, 8));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchSuggestedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="absolute top-5 right-5 w-1/5">
      <div className="text-gray-800 bg-gray-100 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Suggested</h2>
        <ul>
          {userProfiles.length === 0 ? (
            <p>No users to display.</p>
          ) : (
            userProfiles.map((profile, index) => (
              <li
                key={index}
                className="flex items-center mb-4 hover:bg-gray-300 p-2 rounded-lg"
              >
                <img
                  src={
                    !profile.profile_pic || profile.profile_pic === "/default-profile.svg"
                      ? "/default-profile.svg"
                      : `http://localhost:8081${profile.profile_pic}`
                  }
                  alt="User Profile"
                  className="w-10 h-10 rounded-full mr-4"
                />

                <div>
                  <p className="text-sm font-semibold capitalize">
                    {profile.full_name}
                  </p>
                  <p className="text-xs text-gray-500">@{profile.username}</p>
                  <FollowButton
                    targetUserId={profile.user_id}
                    isFollowing={profile.is_following}
                  />
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
