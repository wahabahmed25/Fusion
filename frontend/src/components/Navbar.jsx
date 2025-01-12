import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="bg-gray-900 text-white shadow-md fixed h-screen w-64 z-50 flex flex-col">
      <nav className="flex flex-col items-start px-6 py-8 space-y-6">
        

        {/* Navigation Links */}
        <div className="flex flex-col space-y-14 p-12">
          <Link
            to="/home"
            className="text-xl hover:text-pink-500 transition duration-200"
          >
            Spark
          </Link>
          
          {/*come back to this (creating posts) */}
          <button
            className="text-xl whitespace-nowrap hover:text-pink-500 transition duration-200"
            onClick={() => alert("Open Create Spark modal")}
          >
            Create Spark
          </button>
          <Link
            to="/messages"
            className="text-xl hover:text-pink-500 transition duration-200"
          >
            Messages
          </Link>
          <Link
            to="/saved"
            className="text-xl hover:text-pink-500 transition duration-200"
          >
            Saved
          </Link>
        </div>

        
      </nav>
    </div>
  );
};

export default Navbar;
