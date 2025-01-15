import closeIcon from "../icons/x-icon.svg";
import InputField from "./InputField";
import { useState } from "react";
import PropTypes from "prop-types";

const CreatePost = ({ showModal, toggleModal }) => {
  const [caption, setCaption] = useState("");
  const [uploadImage, setUploadImage] = useState(null); // store selected image


  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  return (
    <>
      {/* Create spark button */}
      {/* <button
        type="button"
        onClick={toggleModal}
        className="bg-gradient-to-r from-[#D3145A] to-[#FF7461] text-white py-2 px-4 rounded-md hover:opacity-90"
      >
        Create Spark
      </button> */}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            {/* Close Icon */}
            <img
              src={closeIcon}
              alt="Close"
              className="absolute top-4 right-4 w-6 h-6 cursor-pointer hover:opacity-80"
              onClick={toggleModal}
            />

            {/* Caption Field */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Create a Post
            </h2>
            <InputField
              label="Write a Caption"
              type="text"
              name="caption"
              value={caption}
              onChange={handleCaptionChange}
              placeholder="Create a caption"
              className="border-2 border-gray-300 text-black rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#D3145A] focus:border-[#D3145A] mb-4"
            />

            {/* Upload Image Section */}
            <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
              {!uploadImage ? (
                <label
                  htmlFor="fileUpload"
                  className="text-gray-500 text-sm cursor-pointer"
                >
                  Click to upload an image
                </label>
              ) : (
                <img
                  src={URL.createObjectURL(uploadImage)}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md"
                />
              )}
              <input
                id="fileUpload"
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(event) => {
                  setUploadImage(event.target.files[0]); // update state with selected file
                }}
              />
            </div>

            {/* Remove Image Button */}
            {uploadImage && (
              <button
                onClick={() => setUploadImage(null)}
                className="text-sm text-[#D3145A] mt-2 hover:underline"
              >
                Remove Image
              </button>
            )}

            {/* Publish Button */}
            <button
              className="mt-6 w-full bg-gradient-to-r from-[#D3145A] to-[#FF7461] text-white py-2 px-4 rounded-md hover:opacity-90"
              onClick={toggleModal}
            >
              Publish
            </button>
          </div>
        </div>
      )}
    </>
  );
};

CreatePost.propTypes = {
    showModal: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
}

export default CreatePost;
