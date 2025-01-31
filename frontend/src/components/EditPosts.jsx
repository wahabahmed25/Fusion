import { useState, useEffect } from "react";
import editIcon from "../icons/edit-icon.svg";
import PropTypes from "prop-types";
import axios from "axios";
import closeIcon from "../icons/x-icon.svg";
import uploadIcon from "../icons/upload-icon.svg";
import DeletePost from "./DeletePost";

const EditPosts = ({
  post_id,
  onEdit = () => {},
  initialDescription = "",
  initialMediaUrl = "",
}) => {
  const [dropDown, setDropDown] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialMediaUrl);

  useEffect(() => {
    setDescription(initialDescription);
    setImagePreview(initialMediaUrl);
  }, [initialDescription, initialMediaUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleIconClick = () => {
    setDropDown((prev) => !prev);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setDropDown(false); // Close the dropdown when opening the modal
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.put(
        `http://localhost:8081/posts/${post_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);
      setImage(response.data.media_url);
      setDescription(response.data.description);
      setIsEditing(false);
      onEdit(); // Notify parent component to refresh the post list
    } catch (error) {
      console.error("error editing posts", error);
      setError("error editing posts");
    }
  };

  return (
    <div className="relative">
      {error && <p className="text-red-500">{error}</p>}

      {/* Edit Icon Button */}
      <button onClick={handleIconClick} className="focus:outline-none">
        <img src={editIcon} alt="edit" className="w-6 h-6" />
      </button>

      {/* Dropdown Menu */}
      {dropDown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border drop-shadow-lg z-0">
          <button
            onClick={handleEdit}
            className="block w-full px-4 py-2 text-sm text-black hover:bg-gray-100"
          >
            Edit
          </button>
          <DeletePost post_id={post_id} onDelete={onEdit} />
        </div>
      )}

      {/* Edit Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
            >
              <img src={closeIcon} alt="close" className="w-6 h-6" />
            </button>

            {/* Form Title */}
            <h2 className="text-xl font-semibold mb-4">Edit Post</h2>

            {/* Description Input */}
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Edit description"
              className="w-full h-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />

            {/* Image Upload */}
            <div className="mb-4">
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="loading..."
                    className="w-full h-60 object-cover rounded-md"
                  />
                </div>
              )}
              <label className="flex rounded-sm hover:bg-gray-200 hover:cursor-pointer justify-center mt-4">
                <img
                  src={uploadIcon}
                  alt="upload image"
                  className="w-9 h-9 flex justify-center items-center"
                />
                <span className="flex justify-center items-center ml-2">
                  upload image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Save Changes Button */}
            <button
              onClick={handleSaveChanges}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

EditPosts.propTypes = {
  post_id: PropTypes.number.isRequired,
  onEdit: PropTypes.func, // onEdit is optional
  initialDescription: PropTypes.string, // Initial description
  initialMediaUrl: PropTypes.string, // Initial media URL
};

export default EditPosts;
