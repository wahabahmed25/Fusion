import PropTypes from "prop-types";
import axios from "axios";
import { useState, useEffect, useRef } from "react";

const ShowChat = ({ socket, user, room, messages: initialMessages, handleClose }) => {
  const [messageValue, setMessageValue] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !room) return;

    const handleReceiveMessage = (data) => {
      console.log("Received message:", data);
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, room]);

  useEffect(() => {
    if (socket && room) {
      socket.emit("join_room", room);
      console.log("Joined room:", room);
    }
  }, [socket, room]);

  useEffect(() => {
    // Disable scrolling when chat is open
    document.body.style.overflow = "hidden";

    return () => {
      // Enable scrolling when chat is closed
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageValue.trim()) return;

    console.log("Message value before sending:", messageValue);

    const receiverIdStr = room.replace(user.id + "-", "").replace("-" + user.id, "");
    const receiverId = Number(receiverIdStr);
    const messageData = {
      sender_user_id: user.id,
      receiver_id: receiverId,
      room: room,
      message: messageValue,
    };
    console.log("this is message data: ", messageData);

    socket.emit("send_message", { room, messageData });

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("error authorizing");
      setError("error authorizing");
      return;
    }

    try {
      await axios.post("http://localhost:8081/store-messages", messageData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setMessages((prev) => [...prev, messageData]);
      setMessageValue("");
    } catch (err) {
      console.error("error storing messages", err);
      setError(err.response ? err.response.data.error : "Error storing messages");
    }
  };

  return (
    <div className="fixed bottom-0 z-30 right-4 w-80 md:w-96 bg-white shadow-lg rounded-t-lg border border-gray-300">
      <div className="bg-blue-600 text-white py-2 px-4 font-bold rounded-t-lg flex justify-between items-center">
        <span>Chat</span>
        <button onClick={handleClose} className="text-white text-lg font-bold">
          X
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4 flex flex-col space-y-2">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg max-w-xs ${
                msg.sender_user_id === user.id
                  ? "self-end bg-blue-500 text-white"
                  : "self-start bg-gray-200 text-black"
              }`}
            >
              {msg.message}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No messages yet...</p>
        )}
        <div ref={messagesEndRef} />
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
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
};

ShowChat.propTypes = {
  socket: PropTypes.object.isRequired,
  user: PropTypes.any,
  room: PropTypes.string.isRequired,
  messages: PropTypes.array.isRequired,
  handleClose: PropTypes.func,
};

export default ShowChat;
