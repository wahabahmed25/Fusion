// import { io } from "socket.io-client";
// import { useEffect, useState } from "react";

// const socket = io("http://localhost:8080"); // URL of your backend server

// const Test = () => {
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     socket.on("message", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const sendMessage = () => {
//     socket.emit("message", "Hello, world!");
//   };

//   return (
//     <div className="bg-white">
//       <button onClick={sendMessage}>Send Message</button>
//       <ul>
//         {messages.map((msg, index) => (
//           <li key={index}>{msg}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Test;
