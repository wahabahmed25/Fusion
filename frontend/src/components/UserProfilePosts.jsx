import { useState, useEffect } from "react";
import PropTypes from "prop-types";
// import { useRef } from "react";
const UserProfilePosts = ({ onPostsFetched }) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  console.log(loading)
  // const observerRef = useRef(null);
  console.log(posts);

  useEffect(() => {
    fetchUserPosts(page);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleScroll = () => {
    // console.log('height: ', document.documentElement.scrollHeight);
    // console.log("top: ", document.documentElement.scrollTop);
    // console.log("window: ",window.innerHeight);
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
      document.documentElement.scrollHeight
    ) {
      setPage((prev) => prev + 1);
      setLoading(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchUserPosts = async () => {
    if (!hasMorePosts) return;
    setLoading(true);
    onPostsFetched([], true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Error authorizing user");
      setError("Authorization error. Please log in.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8081/user-posts?page=${page}&limit=5`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        console.error("Error fetching posts");
        setError("Failed to fetch posts.");
        onPostsFetched([], false);
        return;
      }
      const postsData = await response.json();
      if (postsData.length === 0) {
        setHasMorePosts(false);
      } else {
        // setPosts((prev => [...prev, ...postsData]));
        setPosts((prev) =>
          page === 1 ? postsData.posts : [...prev, ...postsData.posts]
        );
        onPostsFetched(postsData.posts, false);
        setHasMorePosts(postsData.hasMore);
        // setLoading(false);
      }
    } catch (error) {
      console.error("Error occurred", error);
      setError("Something went wrong. Please try again later.");
      onPostsFetched([], false);
    }
    //2 sec loading time
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  

  if (error) return <p>{error}</p>;

  return (
    <div>
      


    </div>
  );
};
UserProfilePosts.propTypes = {
  onPostsFetched: PropTypes.func,
};

export default UserProfilePosts;
