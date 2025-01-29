import SpecificUserPosts from "../components/SpecificUserPosts"
import { useState, useEffect } from "react"
import { useParams } from "react-router"
import axios from "axios"
const UserProfilePage = () => {
    const { user_id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    const fetchUserProfile = async() => {
        const token = localStorage.getItem('authToken');
        if(!token){
            setError('error authorizing')
            return;
        }
        try{
            const response = await axios.get(`http://localhost:8081/user_profiles`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
            console.log("specific user:", response.data);

            const userResponse = await axios.get(`http://localhost:8081/users/${response.data.user_id}`)
            setUser(userResponse.data);

        } catch(error){
            console.error('failed fetching user profile', error);
            setError('error fetching user profile');
        }

    }
    useEffect(() => {
        fetchUserProfile();
    }, [user_id])
  return (
    <div>
        {error && (<p className="text-red-500">{error}</p>)}
      <h1>{user.username} profile</h1>
      <SpecificUserPosts user_id={user.user_id} onPostsFetched={(posts) => console.log(posts)} />    </div>
  )
}

export default UserProfilePage
