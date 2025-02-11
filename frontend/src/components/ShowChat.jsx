//gets and stores chat
import PropTypes from "prop-types";
// import io from "socket.io-client";
import axios from "axios";
import { useState, useEffect } from "react";
// const socket = io.connect("http://localhost:3001");

const ShowChat = ({ socket, user, room}) => {
  const [messageValue, setMessageValue] = useState('');
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    //listen for incoming messages in real time
    // (getting messages)
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    })
    //cleanup on unmount
    return () => {
      socket.off("receive_message");
    }
  }, [socket]);



  const handleSendMessage = async(e) => {
    e.preventDefault();
    if(!messageValue.trim()) return; 

    //prototype test
    const messageData = {
      sender_id: user.user_id,
      room,
      message: messageValue,
      timestamp: new Date(),
    }

    //emit the message in real time:
    socket.emit("send_message", messageData);
    const token = localStorage.getItem('authToken');
    if(!token){
      console.error('error authorizing');
      setError('error authorizing');
      return;
    }

    try{
      const response = await axios.post("http://localhost:8081/store-messages", messageData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      console.log(response.data);
      setMessageValue("");
    } catch(err){
      console.error('error storing messages', err);
      setError('error storing messages');
    }
  }

  
  
  return (
    <div className="fixed bottom-0 right-4 w-80 md:w-96 bg-white shadow-lg rounded-t-lg border border-gray-300">
      <div className="bg-blue-600 text-white py-2 px-4 font-bold rounded-t-lg flex justify-between items-center">
        <span>Chat</span>
        <button onClick={() => setMessages([])} className="text-white text-lg font-bold">
          X
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4 flex flex-col space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-xs ${
              msg.sender_id === user.user_id ? "self-end bg-blue-500 text-white" : "self-start bg-gray-200 text-black"
            }`}
          >
            {msg.message}
          </div>
        ))}
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <form onSubmit={handleSendMessage} className="p-2 flex border-t border-gray-300">
        <input
          onChange={(e) => setMessageValue(e.target.value)}
          value={messageValue}
          type="text"
          className="flex-1 text-black p-2 border border-gray-300 rounded-l-lg focus:outline-none"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600">
          Send
        </button>
      </form>
    </div>
  );
};

ShowChat.propTypes = {
  socket: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  room: PropTypes.string.isRequired,
};

export default ShowChat;
