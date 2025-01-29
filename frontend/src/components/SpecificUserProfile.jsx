//user profile, username, full_name profile_pic
import { useState, useEffect } from "react"
import axios from "axios"
const SpecificUserProfile = ({user_id}) => {
    const [userProfile, setUserProfile] = useState({
        username: "",
        full_name: "",
        profile_pic: "",
    })
    const [error, setError] = useState('');
    const fetchUserProfile = async() => {
        const token = localStorage.getItem('authToken');
        if(!token){
            setError('error authorizing');
            return;
        }
        const response = await axios.get(`http://localhost:8081/user_profiles/${user_id}`)

    }

    useEffect(() => {
        fetchUserProfile();
    }, [])
  return (
    <div>
      
    </div>
  )
}

export default SpecificUserProfile
