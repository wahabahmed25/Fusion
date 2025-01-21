//where the comments show
//get request (fetching comments)
import { useState, useEffect } from "react"
import PropTypes from "prop-types";
import closeIcon from "../icons/x-icon.svg";
const CommentSection = ({ showModal, toggleModal, post_id }) => {

    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    console.log(comment);
    const fetchComments = async() => {
        const token = localStorage.getItem("authToken");
        if(!token){
            console.error("error authorizing")
            return;
        }
        try{
            const response = await fetch(`http://localhost:8081/comments/${post_id}`, {
                method:"GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
            })
            if(!response.ok){
                setError("error fetching comments");
                console.error("error fetching comments");
            }
            const commentData = await response.json();
            setComment(commentData);
        } catch(error){
            console.error(error);
            setError("something went wrong (CommentSection.jsx)");
        }
    }
    //come back to eslint
    useEffect(() => {
        fetchComments();
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [post_id])


  return (
    <>
        {error && <p className="text-red-500">{error}</p>}
        {showModal && (
            <div className="fixed inset-0 flex items-center text-white justify-center bg-gray-500 bg-opacity-35">
                <div className=" bg-gray-700 w-96 h-4/5 p-5 rounded-[20px]">
                    <img 
                        src={closeIcon}
                        alt="close" 
                        onClick={toggleModal}
                        className="hover:border-black"
                        
                        />
                    <h1> this it the comment section</h1>
                    
                </div>

            </div>
        )}
    
    </>
  );
};

CommentSection.propTypes = {
  showModal: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  post_id: PropTypes.number.isRequired,
};

export default CommentSection;
