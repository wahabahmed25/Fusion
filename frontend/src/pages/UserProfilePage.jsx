// import ShowChat from "../components/ShowChat";
import SpecificUserProfile from "../components/SpecificUserProfile";
import SpecificUserPosts from "../components/SpecificUserPosts";
import { useParams } from "react-router";
import backIcon from "../icons/backArrow-icon.svg";
import { Link } from "react-router-dom";
import FollowCount from "../components/FollowCount";
import FollowButton from "../components/FollowButton";
import axios from "axios";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";
import MessageButton from "../components/MessageButton";
const socket = io.connect("http://localhost:3001");
// console.log(socket)
const UserProfilePage = () => {
  const { user_id } = useParams();
  // const targetUserId = Number(user_id);
  const userId = Number(user_id);

  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // const [chat, setChat] = useState(false);
  const [room, setRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState({});

  

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);

      if (parsedUser && userId) {
        const sortedIds = [parsedUser.id, userId].sort((a, b) => a - b);
        setRoom(`${sortedIds[0]}-${sortedIds[1]}`);
      }
    }
  }, [userId]);

  const checkFollowingStatus = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Error authorizing");
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

      setIsFollowing(response.data.is_following);
      // setCurrentUser(response.data.user);
      console.log('current data: ', response.data);
    } catch (err) {
      console.log(err);
      setError("Error checking following status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFollowingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);


 
  return (
    <div className="bg-gray-800 min-h-screen p-4">
      {error && <p className="text-red-500">{error}</p>}

      <div className="max-w-6xl mx-auto">
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

        <div className="bg-gray-700 rounded-xl mx-auto w-1/2 shadow-lg p-6">
          <div className="flex flex-col items-center">
            <SpecificUserProfile />
            <FollowCount user_id={userId} />
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              {loading ? (
                <div className="animate-pulse bg-gray-600 rounded-lg w-full h-10" />
              ) : (
                <>
                  <FollowButton
                    targetUserId={userId}
                    isFollowing={isFollowing}
                    className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  />

                  <MessageButton 
                    user_id = {currentUser}
                    socket = {socket}
                    room = {room}
                    />
                  
                </>
              )}
            </div>
          </div>
        </div>

        {/* {chat && <ShowChat socket={socket} user={currentUser} room={room} />} */}

        <h1 className="text-white text-2xl font-bold text-center mt-8 mb-6">
          Posts
        </h1>
        <SpecificUserPosts />
      </div>
    </div>
  );
};

UserProfilePage.propTypes = {
  socket: PropTypes.object,
  currentUser: PropTypes.shape({
    userId: PropTypes.number,
  }),
};
export default UserProfilePage;
