import closeIcon from "../icons/x-icon.svg";
import InputField from "./InputField";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CreatePost = ({ showModal, toggleModal }) => {
  // const [caption, setCaption] = useState("");
  const [uploadImage, setUploadImage] = useState(null); // store selected image
  const [error, setError] = useState({});

  const [formValue, setFormValue] = useState({
    description: "",
    image: "",
  });

  // const handleCaptionChange = (e) => {
  //   setCaption(e.target.value);
  // };
  const formData = new FormData();
  formData.append("description", formValue.description);
  formData.append("image", uploadImage);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValue((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.log("error with user authentication");
      return;
    }
    try {
      const response = await fetch("http://localhost:8081/posts", {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        console.log("successfullying made posts");
        setError({});
        toggleModal();
      } else {
        const errorData = await response.json();
        setError({
          message: errorData.error || "Error making post, try again",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    // Cleanup the body overflow style when modal is closed
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex items-center no-scrollbar justify-center bg-opacity-50">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg border shadow-lg w-96 p-6 relative">
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
                name="description"
                value={formValue.description}
                onChange={handleChange}
                placeholder="Create a caption"
                error={error.caption}
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
                type="submit"
                className="mt-6 w-full bg-gradient-to-r from-[#D3145A] to-[#FF7461] text-white py-2 px-4 rounded-md hover:opacity-90"
                // onClick={toggleModal}
              >
                Publish
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

CreatePost.propTypes = {
  showModal: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default CreatePost;
