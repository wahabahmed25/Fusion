import ShowChat from "./ShowChat";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import io from "socket.io-client";
import axios from "axios";
// const socket = io.connect("http://localhost:3001");

const MessageButton = () => {

  const { user_id } = useParams();
  const userId = Number(user_id);
  const [socket] = useState(() => io("http://localhost:3001"));
  const [chat, setChat] = useState(false);
  const [room, setRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      console.log("Current user loaded: ", parsedUser);

      if (parsedUser && userId) {
        const sortedIds = [parsedUser.id, userId].sort((a, b) => a - b); // Use user ID, not object
        setRoom(`${sortedIds[0]}-${sortedIds[1]}`);
      }
    } else {
      console.warn("No current user found in localStorage.");
    }
    // console.log("current user bla badeifebfueibfe: ", currentUser);
  }, [userId]);


useEffect(() => {
    if(room){
        fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [room]);



  const handleOpenChat = () => {
    setChat((prev) => !prev);
    // fetchMessages();
  };

  const fetchMessages = async () => {
    // setChat((prev) => !prev);
    if (!room) {
      console.warn("room is not set. aborting message fetch");
      return;
    } //prevents API call.
    // setOpenChat((prev) => !prev);
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
      console.log("loading previos messages: ", response.data);
    } catch (err) {
      console.error("error fetching previous messages", err);
      setError("error fetching previous messages");
    }
  };

  const handleClose = () => {
    setChat(false);
  }

  console.log("Current User:", userId);
  console.log("Socket:", socket);
  console.log("Room:", room);

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={handleOpenChat}
        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Message
      </button>

      {chat && (
        <div>
          <ShowChat
            socket={socket}
            user={currentUser}
            room={room}
            messages={messages}
            handleClose={handleClose}
          />
        </div>
      )}
    </div>
  );
};

export default MessageButton;
