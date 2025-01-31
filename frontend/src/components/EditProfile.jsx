import { useState } from "react";
import closeIcon from "../icons/x-icon.svg";
import InputField from "./InputField";
import defaultProfile from "../icons/default-profile.svg"; // or adjust the relative path if needed
import axios from "axios";
const EditProfile = () => {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [profileValue, setProfileValue] = useState({
    full_name: '',
    profile_pic: '',
    username: '',
    bio: '',
  })

  const handleChange = (e) => {
      const { name, value } = e.target;
      setProfileValue((prevValue) => ({ ...prevValue, [name]: value }));
    };

  const handleSaveChanges = async(e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if(!token){
        console.error("error authorizing");
        setError('error authorizing');
        return;
    }
    try{
        const response = await axios.put(`http://localhost:8081/change-profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
        })
        setProfileValue({
            full_name: response.data.full_name,
            profile_pic: response.data.profile_pic,
            bio: response.data.bio,
            username: response.data.username,
        })

    } catch(error){
        console.error("error saving profile changes", error);
        setError("error saving profile changes");
    }
  }

  const toggleEditing = () => {
    setEditing(true);
  };
  const handleClose = () => {
    setEditing(false);
  };

  
  return (
    <div>
        {error && (<p className="text-red-500">{error}</p>)}
      <button
        onClick={toggleEditing}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Edit Profile
      </button>
      {editing && (
        <>
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-500 ">
              <button onClick={handleClose}>
                <img src={closeIcon} alt="close" />
              </button>
              <img 
                src={defaultProfile} 
                alt="loading profile..."
                className="w-24 h-24 rounded-full object-cover mr-4"
              />
              <button>Edit Picture</button>
              <InputField
                label="name"
                type="text"
                name="full_name"
                value={profileValue.full_name}
                onChange={handleChange}
              />
              <InputField
                label="username"
                type="text"
                name="username"
                value={profileValue.username}
                onChange={handleChange}
              />
              <InputField
                label="bio:"
                type="text"
                name="bio"
                value={profileValue.bio}
                onChange={handleChange}
              />


              <button onClick={handleSaveChanges}>
                <h1>saved changes</h1>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

{
  /* <InputField
              label="Username"
              type="text"
              name="username"
              value={loginInfo.username}
              placeholder="Username"
              onChange={handleChange}
              error={error.username}
              required
              className="border-2 border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#D3145A] focus:border-[#D3145A]"
            /> */
}
export default EditProfile;
