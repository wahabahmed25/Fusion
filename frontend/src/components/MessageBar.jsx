import PropTypes from "prop-types";
import { useState, useEffect } from "react";
// import ShowChat from "./ShowChat";
// import axios from "axios";
import io from "socket.io-client";

import MessageButton from "./MessageButton";
const MessageBar = ({ user }) => {
  const [socket] = useState(() => io("http://localhost:3001"));
  const [room, setRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
    } else {
      console.warn("No current user found in localStorage.");
    }
  }, []);

  useEffect(() => {
    if (currentUser && user?.user_id) {
      const sortedIds = [currentUser.id, user.user_id].sort((a, b) => a - b);
      setRoom(`${sortedIds[0]}-${sortedIds[1]}`);
    }
  }, [currentUser, user?.user_id]);

  console.log("MessageBar user prop:", user);
  console.log("Current User:", currentUser);
  console.log("Room:", room);
  console.log("Socket:", socket);

  return (
    <div className="max-w-md mx-auto my-4">
      <div className="flex items-center bg-gray-300 hover:bg-gray-400 p-4 rounded-lg shadow-md">
        <img
          src={
            user.profile_pic
              ? `http://localhost:8081${user.profile_pic}`
              : "http://localhost:8081/default-profile.svg"
          }
          alt="Profile"
          className="w-12 h-12 rounded-full mr-4"
        />
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-900">
            {user.full_name || "Unknown"}
          </p>
          <p className="text-sm text-gray-700">
            @{user.username || "unknown"}
          </p>
        </div>
        {/* Render MessageButton only if currentUser and room are available */}
        {currentUser && currentUser.id && room && (
          <MessageButton
            user_id={currentUser}
            room={room}
            socket={socket}
          />
        )}
      </div>
    </div>
  );
};

MessageBar.propTypes = {
  user: PropTypes.object,
  // socket: PropTypes.object.isRequired,
  // // user_id: PropTypes.number.isRequired,
  // room: PropTypes.string,
};

export default MessageBar;
