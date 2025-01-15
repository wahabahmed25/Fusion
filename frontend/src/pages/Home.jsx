import Navbar from "../components/Navbar"
// import { Link } from "react-router"
import SuggestedUsers from "../components/UserProfile"
import CreatePost from "../components/CreatePost"

const Home = () => {
  return (
    <div className="bg-gray-900 bg-cover min-h-screen">
      <CreatePost />
      <Navbar />
      <SuggestedUsers />
    </div>
  )
}

export default Home
