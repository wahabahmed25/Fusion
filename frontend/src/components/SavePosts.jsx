import savedIcon from "../icons/saved-icon.svg";
import unSavedIcon from "../icons/unsaved-icon.svg";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const SavePosts = ({ post_id }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  // Fetch the initial saved status when the component mounts
  useEffect(() => {
    const fetchSavedStatus = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("error authorizing");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8081/saved_posts?post_id=${post_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError("error fetching saved status");
          return;
        }

        const data = await response.json();
        setIsSaved(data.isSaved); // Update isSaved state based on backend response
      } catch (error) {
        console.error("error fetching saved status", error);
        setError("error fetching saved status");
      }
    };

    fetchSavedStatus();
  }, [post_id]);

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("error authorizing");
      setError("error authorizing");
      return;
    }

    if (!post_id) {
      console.error("post_id is not provided");
      setError("post_id is not provided");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/saved_posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post_id }),
      });

      if (!response.ok) {
        setError("error saving post");
        console.error("error saving posts");
        return;
      }

      const savedData = await response.json();
      console.log("data: ", savedData);

      // Update isSaved state based on backend response
      if (savedData.isSaved !== undefined) {
        setIsSaved(savedData.isSaved);
      } else {
        console.error("isSaved value not found in response");
        setError("isSaved value not found in response");
      }

      setError("");
    } catch (error) {
      console.error("something went wrong (savePosts.jsx)", error);
      setError("something went wrong (savePosts.jsx)");
    }
  };

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
};

export default SavePosts;