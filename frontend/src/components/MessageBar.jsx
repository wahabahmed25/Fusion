import PropTypes from "prop-types";
import { useState} from "react";
import ShowChat from "./ShowChat";
import axios from "axios";
const MessageBar = ({ socket, user, room }) => {
  const [openChat, setOpenChat] = useState(false);
  // const [error, setError] = useState('');
  // const [loadMessages, setLoadMessages] = useState([])
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  // const handleOpenChat = () => {
  //   setOpenChat((prev) => !prev);

  // }

  const fetchMessages = async () => {
    setOpenChat((prev) => !prev);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing");
      console.error("error authorizing");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8081/messages/${room}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessages(response.data);
    } catch (err) {
      console.error("error fetching messages", err);
      setError("error fetching messages");
    }
  };



  return (
    <div className="text-white flex justify-center mt-10">
      {error && (<p className="text-red-500">{error}</p>)}
      {user && (
        <>
          <button onClick={fetchMessages} className="flex items-center">
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
              <p className="text-sm font-bold lowercase">
                @{user.username || "Unknown"}
              </p>
            </div>
          </button>

          {/* ShowChat should only render when openChat is true */}
          {openChat && (
            <ShowChat
              socket={socket}
              user={user}
              room={room}
              messages = {messages}
            />
          )}
        </>
      )}
    </div>
  );
};

MessageBar.propTypes = {
  socket: PropTypes.object.isRequired,
  user: PropTypes.object,
  room: PropTypes.string.isRequired,
};

export default MessageBar;
