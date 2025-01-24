import { useState, useEffect } from "react"
import axios from "axios";
import PropTypes from "prop-types";

const FollowCount = ({ user_id }) => {
    const [followingCount, setFollowingCount] = useState(0);
    const [followerCount, setFollowerCount] = useState(0);
    const [error, setError] = useState('');
    const fetchFollowCount = async() => {
        const token = localStorage.getItem('authToken');
        if(!token){
            setError('error authorzing');
            console.error("error authorizing");
            return;
        }
        try{
            const response = await axios.get(`http://localhost:8081/follow-counts/${user_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
            console.log("fetched follow count: ", response.data);
            setFollowerCount(response.data.follower_count);
            setFollowingCount(response.data.following_count);
        } catch(err){
            console.error(err);
            setError("error getting follow count");
        }
    }

    useEffect(() => {
        fetchFollowCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user_id])
  return (
    <div>
        {error && <p className="text-red-500">{error}</p>}

      <div>
        <h1>followers {followerCount}</h1>
        <h1>following {followingCount}</h1>
      </div>
    </div>
  )
}
FollowCount.propTypes = {
    user_id: PropTypes.number,
}

export default FollowCount
