import unSavedIcon from "../icons/saved-icon.svg";
import savedIcon from "../icons/unsaved-icon.svg";
import { useState } from "react";
import PropTypes from "prop-types";

const SavePosts = ({ post_id }) => {
  const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState('');
 
    
  const handleSave = async() => {
    const token = localStorage.getItem('authToken');
    if(!token){
        console.error("error authorizing");
        setError("error authorizing");
        return;
    }
    // setIsSaved((prev) => !prev);
    try{
        const response = await fetch('http://localhost:8081/saved_posts', {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            body: JSON.stringify({ post_id }),

        })
        if(!response.ok){
            setError("error saving post");
            console.error("error saving posts");
        }
        if(!post_id){
            console.error("post_id is not provided");
        }
       
        const savedData = await response.json();
        // setIsSaved((prev) => !prev);
        setIsSaved(savedData.isSaved);
        console.log("data: ", savedData)

        setError('');
        
    } catch(error){
        console.error("something went wrong (savePosts.jsx)", error);
        setError("something went wrong (savePosts.jsx)");
    }
  }
  return (
    <div>
        {error && <p className="text-red-500">{error}</p>}

      <button onClick={handleSave}>
        <img
          src={isSaved ? savedIcon : unSavedIcon}
          alt="save"
          className="w-7 h-7"
        />

      </button>
      
    </div>
  );
};

SavePosts.propTypes = {
    post_id: PropTypes.number.isRequired,
}

export default SavePosts;
