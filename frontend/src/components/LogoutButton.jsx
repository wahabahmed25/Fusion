// import { useState } from "react"
import { useNavigate } from "react-router";
const LogoutButton = () => {
    // const  [error, setError] = useState('')
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear();
        // window.localStorage.href = '/';
        navigate("/login")
        alert("Logged out")
    }
  return (
    <div>
      <button onClick = {handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
        Logout
      </button>
    </div>
  )
}

export default LogoutButton
