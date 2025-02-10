//gets and stores chat
import PropTypes from "prop-types";
import io from "socket.io-client";
import axios from "axios";
const socket = io.connect("http://localhost:3001");

import { useState } from "react";
const ShowChat = ({ socket, user, room, toggleChat}) => {
  const [openChat, setOpenChat] = useState(true);
  const [messageValue, setMessageValue] = useState('');
  const [error, setError] = useState("");
  const [loadMessages, setLoadMessages] = useState([]);
  const handleChange = (e) => {
    setMessageValue(e.target.value);
  }

  const handleStoreMessage = async(e) => {
      e.preventDefault();
      const token = localStorage.getItem('authToken');
      if(!token){
        console.error('error authorizing');
        setError('error authorizing');
        return;
      }
      try{  
        const response = await axios.put('http://localhost:8081/store-messages', {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        console.log("messaged stored: ",response.data)
      } catch(err){
        console.error('error storing message', err);
        setError('error storing message');
      }
  }

  const handleLoadChat = async(e) => {
    e.preventDefault();
    setOpenChat((prev) => !prev);
    const token = localStorage.getItem('authToken');
    if(!token){
        console.error('error authorizing');
        setError('error authorizing');
        return;
    }
    try{
        const response = await axios.get(`http://localhost:8081/messages/${room}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
        })
        const messageData = response.data;
        setLoadMessages(messageData);

    } catch(err){
        console.error('error fetching messages from user: ', err);
        setError('error fetching messages from user');
    }

  };

  const handleCloseChat = () => {
    setOpenChat(false);
  };
  return (
    <div>
      <div className="fixed bottom-0 right-4 w-80 md:w-96 bg-white shadow-lg rounded-t-lg border border-gray-300">
        <div className="bg-blue-600 text-white py-2 px-4 font-bold rounded-t-lg flex justify-between items-center">
          <span>Chat</span>
          <button
            onClick={handleCloseChat}
            className="text-white text-lg font-bold"
          >
            X
          </button>
        </div>
        <div className="h-96 overflow-y-auto p-4 flex flex-col space-y-2">
          {/* Chat messages go here */}
          <div className="self-start bg-gray-200 text-black p-2 rounded-lg max-w-xs">
            Hello! 👋
          </div>
          <div className="self-end bg-blue-500 text-white p-2 rounded-lg max-w-xs">
            Hi there!
          </div>
          {error && (<p className="text-red-500">{error}</p>)}

        </div>
        <form onSubmit = {handleStoreMessage} className="p-2 flex border-t border-gray-300">
          <input
            onChange={handleChange}
            value={messageValue}
            type="text"
            className="flex-1 text-black p-2 border border-gray-300 rounded-l-lg focus:outline-none"
            placeholder="Type a message..."
          />
          <button

            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

ShowChat.propTypes = {
  socket: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  room: PropTypes.string.isRequired,
};
export default ShowChat;
