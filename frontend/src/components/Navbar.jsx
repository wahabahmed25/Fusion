import { Link } from "react-router-dom";
import YourProfile from "../components/PersonalProfile"
const Navbar = () => {
  return (
    <div className="bg-gray-700 text-white shadow-md fixed h-screen w-auto z-50 flex flex-col">
      <nav className="flex flex-col items-start px-6 py-8 space-y-6">
        <div className="w-full">
          <Link to="/home" className="text-white text-4xl font-extrabold tracking-wide p-20 hover:text-pink-500 transition duration-300">FUSION</Link>
        </div>
        <YourProfile />
        
        

        {/* Navigation Links */}
        <div className="flex flex-col space-y-10 p-4 px-12 pb-10 w-full">
          <Link
            to="/home"
            className="text-xl px-6 py-2 w-40 rounded-lg hover:bg-pink-500 transition duration-200"
          >
            Spark
            
          </Link>
          
          {/*come back to this (creating posts) */}
          <button
            className="text-xl p-2 w-40  rounded-lg hover:bg-pink-500 transition duration-200"
            onClick={() => alert("Open Create Spark modal")}
          >
            Create Spark
          </button>
          <Link
            to="/messages"
            className="text-xl px-6 py-2 w-40 rounded-lg hover:bg-pink-500 transition duration-200"
          >
            Messages
          </Link>
          <Link
            to="/saved"
            className="text-xl px-6 py-2 w-40 rounded-lg hover:bg-pink-500 transition duration-200"
          >
            Saved
          </Link>
        </div>

        
      </nav>
    </div>
  );
};

export default Navbar;
