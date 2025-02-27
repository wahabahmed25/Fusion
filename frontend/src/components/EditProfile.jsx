import { useState, useEffect } from "react";
import closeIcon from "../icons/x-icon.svg";
import InputFieldTwo from "./InputFieldTwo";
import axios from "axios";
import PropTypes from "prop-types";
import { validateForm, validateField } from "../components/EditValidation";

const EditProfile = ({
  initialName = "",
  initialBio = "",
  initialUsername = "",
  initialProfilePic = "",
}) => {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [formErr, setFormErr] = useState({});
  const [profileValue, setProfileValue] = useState({
    full_name: initialName,
    username: initialUsername,
    bio: initialBio,
  });
  const [profilePreview, setProfilePreview] = useState(initialProfilePic);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    setProfilePreview(initialProfilePic);
  }, [initialProfilePic]);

  useEffect(() => {
    setProfileValue({
      full_name: initialName,
      username: initialUsername,
      bio: initialBio,
    });
  }, [initialName, initialBio, initialUsername]);

  const handleRemovePic = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Error authorizing");
      return;
    }
    try {
      const response = await axios.put(
        "http://localhost:8081/remove-profile-pic",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfilePic(null);
      setProfilePreview("/default-profile.svg");
      alert(response.data.message);
    } catch (err) {
      console.error(err);
      setError("Error removing profile pic");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setFormErr((prev) => ({ ...prev, [name]: fieldError }));
    setProfileValue((prevValue) => ({ ...prevValue, [name]: value }));
  };

  const handleProfilePic = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const formError = validateForm(profileValue);
    setFormErr(formError);

    if (Object.keys(formError).length > 0) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Error authorizing");
      return;
    }
    const formData = new FormData();
    formData.append("full_name", profileValue.full_name);
    formData.append("username", profileValue.username);
    formData.append("bio", profileValue.bio);
    if (profilePic && profilePic !== "default-profile.svg") {
      formData.append("profile_pic", profilePic);
    }

    try {
      const response = await axios.put(
        `http://localhost:8081/change-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProfileValue({
        full_name: response.data.full_name,
        bio: response.data.bio,
        username: response.data.username,
      });
      setProfilePic(response.data.profile_pic);
      setEditing(false);
    } catch (error) {
      console.error(error);
      setError("Error saving profile changes");
    }
  };

  return (
    <div className="p-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleEditClick}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Edit Profile
      </button>

      {editing && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-700 p-10 rounded-lg shadow-xl w-96 h-auto relative flex flex-col">
            <button
              onClick={() => setEditing(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <img src={closeIcon} alt="Close" className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              <img
                // src={profilePreview || "default-profile.svg"}
                src={
                  profilePreview
                    ? `http://localhost:8081${profilePreview}`
                    : "http://localhost:8081/default-profile.svg"
                }
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />
              
              <div className="flex w-full mt-2 gap-2">
                <label className="relative cursor-pointer bg-purple-600 text-white text-sm px-4 py-2 rounded-md hover:bg-purple-700 transition w-1/2 text-center">
                  Edit Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePic}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
                <button
                  onClick={handleRemovePic}
                  className="bg-red-500 text-white text-sm px-4 py-2 rounded-md hover:bg-red-600 transition w-1/2"
                >
                  Remove Picture
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <InputFieldTwo
                label="Name"
                type="text"
                name="full_name"
                value={profileValue.full_name}
                onChange={handleChange}
              />
              {formErr.full_name && (
                <p className="text-red-500 text-xs">{formErr.full_name}</p>
              )}
              <InputFieldTwo
                label="Username"
                type="text"
                name="username"
                value={profileValue.username}
                onChange={handleChange}
              />
              {formErr.username && (
                <p className="text-red-500 text-xs">{formErr.username}</p>
              )}
              <InputFieldTwo
                label="Bio"
                type="text"
                name="bio"
                value={profileValue.bio}
                onChange={handleChange}
              />
              {formErr.bio && (
                <p className="text-red-500 text-xs">{formErr.bio}</p>
              )}
            </div>

            <button
              onClick={handleSaveChanges}
              className="bg-green-500 text-white w-full py-2 rounded-md hover:bg-green-600 transition duration-300 mt-5"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

EditProfile.propTypes = {
  initialBio: PropTypes.string,
  initialName: PropTypes.string,
  initialProfilePic: PropTypes.string,
  initialUsername: PropTypes.string,
};

export default EditProfile;
