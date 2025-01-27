import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import deleteIcon from "../icons/delete-icon.svg";
import closeIcon from "../icons/x-icon.svg";

const DeletePost = ({ post_id, onDelete }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing");
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8081/posts/${post_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Post deleted:", response.data);
      onDelete(); // Notify parent component to refresh the post list
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("Error deleting post");
    }
  };

  return (
    <div>
      {/* Delete Button */}
      <button
        onClick={() => setIsConfirming(true)}
        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <img src={deleteIcon} alt="delete" className="w-full h-5 block" />
      </button>

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            {/* Close Icon (Top-Right) */}
            <button
              onClick={() => setIsConfirming(false)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
            >
              <img src={closeIcon} alt="X" className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this post?</p>

            {/* Error Message */}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Buttons (Bottom) */}
            <div className="flex justify-between">
              {/* Cancel Button (Bottom-Left) */}
              <button
                onClick={() => setIsConfirming(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>

              {/* Confirm Delete Button (Bottom-Right) */}
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DeletePost.propTypes = {
  post_id: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired, // Callback to notify parent component
};

export default DeletePost;
