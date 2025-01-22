import unSavedIcon from "../icons/saved-icon.svg";
import savedIcon from "../icons/unsaved-icon.svg";
import { useState } from "react";
const SavePosts = () => {
  const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState('');
 

  const handleSave = async() => {
    const token = localStorage.getItem('authToken');
    if(!token){
        console.error("error authorizing");
        setError("error authorizing");
        return;
    }
    setIsSaved((prev) => !prev);
    try{
        const response = await fetch('http://localhost:8081/saved_posts', {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
              },
        })
        if(!response.ok){
            setError("error saving post");
            console.error("error saving posts");
        }
        const savedData = await response.json();
        setIsSaved(savedData.isSaved);
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
          src={isSaved ? unSavedIcon : savedIcon}
          alt="save"
          className="w-7 h-7"
        />

      </button>
      
    </div>
  );
};

export default SavePosts;
