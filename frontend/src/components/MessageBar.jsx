import PropTypes from "prop-types";
import { useState } from "react";
import ShowChat from "./ShowChat";
import axios from "axios";
const MessageBar = ({ socket, user, room }) => {
  const [openChat, setOpenChat] = useState(false);
    // const [error, setError] = useState('');
    // const [loadMessages, setLoadMessages] = useState([])
  


  return (
    <div className="text-white flex justify-center mt-10">
        {error && (<p className="text-red-500">{error}</p>)}
      {user && (
        <>
          <button onClick={handleOpenChat} className="flex items-center">
            <img
              src={
                user.profile_pic
                  ? `http://localhost:8081${user.profile_pic}`
                  : "http://localhost:8081/default-profile.svg"
              }
              alt="Profile"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="text-sm font-bold lowercase">@{user.username || "Unknown"}</p>
            </div>
          </button>

          {/* ShowChat should only render when openChat is true */}
          {openChat && <ShowChat socket={socket} user={user} room={room} toggleChat = {handleOpenChat} />}
        </>
      )}
    </div>
  );
};

MessageBar.propTypes = {
  socket: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  room: PropTypes.string.isRequired,
};

export default MessageBar;
