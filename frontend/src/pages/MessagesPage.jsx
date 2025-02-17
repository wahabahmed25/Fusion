//the page shows all the people you have messaged
// import Test from "../components/Test"
import io from "socket.io-client";
const socket = io.connect("http://localhost:3001");
import axios from "axios";
import backIcon from "../icons/backArrow-icon.svg";
import { Link } from "react-router-dom";
// import Navbar from "../components/Navbar"
import MessageBar from "../components/MessageBar";
import { useState, useEffect } from "react";
const MessagesPage = () => {
  const [messagedUser, setMessagedUser] = useState([]);
  const [error, setError] = useState("");
  // const [user, setUser] = useState("");
  //   const [room, setRoom] = useState("");

  //   const joinRoom = () => {
  //     if (username !== "" && room !== "") {
  //       socket.emit("join_room", room);
  //     }
  //   };

  //   const handleUsernameChange = (e) => {
  //     setUsername(e.target.value);
  //   };
  //   const handleRoomChange = (e) => {
  //     setRoom(e.target.value);
  //   };

  const fetchMessagedUsers = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing");
      console.error("error authorizing");
      return;
    }
    try {
      const response = await axios.get("http://localhost:8081/messaged-users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = response.data;
      setMessagedUser(data);
      console.log("all users you have messaged: ", data);
    } catch (err) {
      console.error("error getting messaged users", err);
      setError("error getting messaged users");
    }
  };

  useEffect(() => {
    fetchMessagedUsers();
  }, []);

  return (
    <div className="bg-gray-900 h-screen">
      {error && <p className="text-red-500">{error}</p>}
      <div className="">
        {/* <Navbar /> */}
        <div className="flex justify-center text-white">
          <p>Messages</p>
        </div>
        <Link to="/home" className="flex items-center gap-2">
            <img
              src={backIcon}
              alt="home"
              className="w-7 h-7 invert opacity-75 hover:opacity-100 transition-opacity"
            />
            <span className="text-white text-lg font-medium">Home</span>
          </Link>
        <div>
          {messagedUser.length > 0 ? (
            messagedUser.map((user) => (
              <div key={user.user_id}>
                <MessageBar
                  socket={socket}
                  user={user.user}
                  room={user.room} //or user.id?
                />
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center w-full col-span-full">
              No Messages
            </p>
          )}
          {/* test */}
          {/* <MessageBar
            socket={socket}
            user={12}
            room={123} //or user.id?
          /> */}

          {/* This will get all users you have messaged before */}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
