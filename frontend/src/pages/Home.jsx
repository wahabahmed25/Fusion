import Navbar from "../components/Navbar"
// import { Link } from "react-router"
import SuggestedUsers from "../components/UserProfile"
// import CreatePost from "../components/CreatePost"
// import Test from "../components/Test"
const Home = () => {
  return (
    <div className="bg-gray-900 bg-cover min-h-screen">
      {/* <CreatePost /> */}
      <Navbar />
      {/* <Test /> */}
      <SuggestedUsers />

    </div>
  )
}

export default Home
