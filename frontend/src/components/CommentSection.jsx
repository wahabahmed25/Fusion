//where the comments show
//get request (fetching comments)
import defaultProfile from "../icons/default-profile.svg"; // or adjust the relative path if needed
import commentIcon from "../icons/comment-icon.svg";
// import { Draggable } from "react-draggable";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import closeIcon from "../icons/x-icon.svg";
import CreateComment from "./CreateComment";
const CommentSection = ({ post_id }) => {
  const [comment, setComment] = useState([]);
  const [error, setError] = useState("");
  const [currentComments, setCurrentComments] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };

  const fetchComments = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("error authorizing");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8081/comments/${post_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        setError("error fetching comments");
        console.error("error fetching comments", response.statusText);
      }
      const commentData = await response.json();
      console.log(commentData);
      setComment(commentData.comments);
      setCurrentComments(commentData.commentCount);
    } catch (error) {
      console.error(error);
      setError("something went wrong (CommentSection.jsx)");
    }
  };

  useEffect(() => {
    if (post_id) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post_id]);
  useEffect(() => {
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
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex items-center gap-1">
        <button className="">
          <img
            src={commentIcon}
            alt="comment"
            className="w-6 h-6"
            onClick={toggleModal}
          />
        </button>

        <span className="text-sm">{currentComments}</span>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          {/* <Draggable> */}

          <div
            className="bg-white w-full max-w-lg h-4/5 p-6 rounded-lg shadow-lg relative animate-slide-up"
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
          >
            {/* Close Button */}
            <button
              onClick={toggleModal}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <img src={closeIcon} alt="Close" className="w-4 h-4" />
            </button>

            {/* Header */}
            <h1 className="text-xl font-semibold text-gray-800 mb-4">
              Comment Section
            </h1>

            {/* Create Comment Form */}
            <CreateComment post_id={post_id} fetchComments={fetchComments} />

            {/* Comments Display */}
            <div className=" space-y-4 overflow-y-auto no-scrollbar max-h-[60%] mt-4 border-t border-gray-200 pt-4">
              {comment.length > 0 ? (
                comment.map((comments) => (
                  <div
                    key={comments.id}
                    className="p-4 bg-gray-100 rounded-lg shadow-md"
                  >
                    {/* Profile Pic and Full Name */}
                    <div className="flex items-center gap-2">
                      <img
                        src={comments.profile_pic || defaultProfile} // Fallback to default if no profile pic
                        alt={comments.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <p className="text-sm lowercase font-semibold text-gray-800">
                        {comments.full_name || "anonamyz"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700">{comments.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(comments.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center">
                  No comments yet.
                </p>
              )}
            </div>
          </div>
          {/* </Draggable> */}
        </div>
      )}
    </>
  );
};
CommentSection.propTypes = {
  showModal: PropTypes.bool,
  toggleModal: PropTypes.func,
  post_id: PropTypes.number.isRequired,
};

export default CommentSection;
