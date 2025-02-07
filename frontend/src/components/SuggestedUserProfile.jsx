import { useState, useEffect } from "react";
import FollowButton from "./FollowButton";
import { Link } from "react-router-dom";

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
    <div className="absolute top-5 right-5 w-60"> 
      <div className="text-gray-800 bg-gray-100 p-5 rounded-lg shadow-md w-full">
        <h2 className="text-lg font-semibold mb-4 text-center">Suggested</h2>
        <ul className="space-y-3">
          {userProfiles.length === 0 ? (
            <p className="text-center">No users to display.</p>
          ) : (
            userProfiles.map((profile, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:bg-gray-200 transition">
                <Link to={`/userProfilePage/${profile.user_id}`} className="flex items-center w-full overflow-hidden">
                  <img
                    src={
                      !profile.profile_pic || profile.profile_pic === "/default-profile.svg"
                        ? "/default-profile.svg"
                        : `http://localhost:8081${profile.profile_pic}`
                    }
                    alt="User Profile"
                    className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0"
                  />
                  <div className="flex flex-col flex-grow min-w-0">
                    <p className="text-sm font-semibold capitalize truncate">{profile.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">@{profile.username}</p>
                  </div>
                </Link>
                <div className="ml-3 flex-shrink-0">
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
