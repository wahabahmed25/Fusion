// import io from "socket.io-client";
// import { useState } from "react";
// const socket = io.connect("http://localhost:3001");
// const Test = () => {
//   const [username, setUsername] = useState("");
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
//   return (
//     <div className="bg-gray-800 flex flex-col items-center justify-center w-1/2 mx-auto p-6 rounded-lg shadow-lg">
//       <h3 className="text-white text-xl font-semibold mb-4">Join a Chat</h3>
//       <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
//         <input
//           className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           onChange={handleUsernameChange}
//           type="text"
//           placeholder="Enter your name"
//         />
//         <input
//           className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           onChange={handleRoomChange}
//           type="text"
//           placeholder="Room ID"
//         />
//         <button
//           onClick={joinRoom}
//           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-semibold transition duration-300"
//         >
//           Join Room
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Test;
