import PersonalProfile from "../components/PersonalProfile";
import PersonalPosts from "../components/PersonalPosts";
import backIcon from "../icons/backArrow-icon.svg";
import { Link } from "react-router";
import FollowCount from "../components/FollowCount";
import { useState, useEffect } from "react";
import axios from "axios";
import LogoutButton from "../components/LogoutButton";
import EditProfile from "../components/EditProfile";

const PersonalProfilePage = () => {
  const [personalData, setPersonalData] = useState([]);
  const [loggedUser, setLoggedUser] = useState(null);
  const [error, setError] = useState("");
  const fetchUserId = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorzing");
    }
    try {
      const response = await axios.get(`http://localhost:8081/user_profiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("personalprofilepage data: ", response.data);
      const userData = response.data;
      setLoggedUser(userData.user_id);
      setPersonalData(userData);
    } catch (err) {
      console.error(err);
      setError("error fetching user profile");
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);
  return (
    <div className="bg-gray-900 min-h-screen p-6 ">
      {/* Back Button and Home Link */}
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex items-center space-x-2 mb-8">
        <Link to="/home" className="flex items-center space-x-2">
          <img src={backIcon} alt="back" className="w-6 h-6 invert" />
          <h1 className="text-white text-lg">Home</h1>
        </Link>
      </div>

      {/* Profile Section */}
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        {/* Profile Header */}
        <div className="flex justify-between items-center mb-6">
          <PersonalProfile />
          {/* <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
            Logout
          </button> */}
          <LogoutButton />
        </div>

        {/* Follow Count and Edit Profile */}
        <div className="flex justify-between items-center mb-6">
          <FollowCount user_id={loggedUser} />
          {/* <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            Edit Profile
          </button> */}
          <EditProfile
            initialBio={personalData.bio}
            initialName={personalData.full_name}
            initialProfilePic={personalData.profile_pic}
            initialUsername={personalData.username}
          />
        </div>
        {/* bio */}
        <div className="bg-gray-700 p-5 rounded-lg shadow-lg border border-gray-600 text-center">
          <h1 className="text-white text-lg font-bold mb-2">About Me</h1>
          <h1 className="text-white text-md italic">{personalData.bio}</h1>
        </div>
        {/* Posts Section */}
        <div className="mt-8">
          {/* <h2 className="text-2xl font-bold text-white mb-4">Posts</h2> */}
          <PersonalPosts />
        </div>
      </div>
    </div>
  );
};

export default PersonalProfilePage;
