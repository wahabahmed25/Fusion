//post request, when submit it adds to comments table
// import InputField from "./InputField";
import { useState } from "react";
import PropTypes from "prop-types";
import enterIcon from "../icons/arrow-icon.svg";

const CreateComment = ({ post_id, fetchComments }) => {
  const [commentValue, setCommentValue] = useState({
    comment: "",
  });

  const [error, setError] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCommentValue((prevValues) => ({ ...prevValues, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("error authorizing user");
      console.error("error authorizing");
      return;
    }
    if (!commentValue.comment.trim()) {
      setError("comment field cannot be empty");
      return;
    }
    if (!post_id) {
        console.error("post_id is undefined in CreateComment");
        return null; // Prevent rendering the component
      }
    try {
      const response = await fetch('http://localhost:8081/comments',
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment: commentValue.comment,
            post_id, 
          }),
        }
      );
      if (!response.ok) {
        throw new Error("failed to add comment");        
      }
      const commentData = await response.json();
      console.log("comment added: ", commentData);
      //clear input
      setCommentValue({comment: ""});

      setError("")
      //refrech comment list
      if(fetchComments){
        fetchComments();
      }

    } catch (err) {
      console.log(err);
      setError("Failed to add comment. Please try again.");
    }
  };

  // useEffect(() => {
  //     insertComment();
  // }, [])
  return (
    <div className="mt-4">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="relative">
        {/* Input with Button */}
        <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          <input
            type="text"
            name="comment"
            placeholder="Add Comment"
            value={commentValue.comment}
            onChange={handleChange}
            className="flex-1 p-4 text-gray-700 focus:outline-none"
          />
          <button
            type="submit"
            className=" text-white p-2 m-2 rounded-full hover:bg-gray-200 focus:outline-none"
          >
            <img 
              src={enterIcon}
              alt="Send"

            
            />
          </button>

        </div>
      </form>
    </div>
  );
};
CreateComment.propTypes = {
  post_id: PropTypes.number.isRequired,
  fetchComments: PropTypes.func,
};

export default CreateComment;
