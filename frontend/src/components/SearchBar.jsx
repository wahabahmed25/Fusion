import SearchIcon from "../icons/search.svg";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { useParams } from "react-router-dom";
const SearchBar = () => {
  const [value, setValue] = useState("");
  const [userSearch, setUserSearch] = useState([]);
  const [error, setError] = useState("");

  const fetchUserSearch = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Error authorizing");
      console.error("Error authorizing");
      return;
    }

    if (!value.trim()) {
      setUserSearch([]); // Clear results when empty
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8081/search-user?query=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setUserSearch(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
      setError("User not found");
      setUserSearch([]);
    }
  };

  useEffect(() => {
    fetchUserSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="flex flex-col items-center relative">
      {error && <p className="text-red-500">{error}</p>}

      {/* Search Bar */}
      <div className="relative w-96">
        <input
          className="px-4 py-2 w-full bg-gray-500 text-white rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="Search..."
          type="text"
          value={value}
          onChange={handleChange}
        />
        <img
          src={SearchIcon}
          alt="Search"
          className="w-7 h-7 absolute right-3 top-1/2 transform -translate-y-1/2 opacity-35"
        />
      </div>

      {/* Search Results */}
      {userSearch.length > 0 && (
        <div
          
          className="absolute top-full mt-2 z-30 w-96 bg-gray-700 rounded-md shadow-lg overflow-hidden"
        >
          <ul>
            {userSearch.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-600 transition"
              >
                <Link to={`/userProfilePage/${user.id}`}>
                  <img
                    src={
                      user.profile_pic
                        ? `http://localhost:8081${user.profile_pic}`
                        : "http://localhost:8081/default-profile.svg"
                    }
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="text-white">
                    <p className="font-medium  lowercase flex justify-start">
                      @{user.username}
                    </p>
                    <p className="text-sm text-gray-300 uppercase flex justify-start">
                      {user.full_name}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
