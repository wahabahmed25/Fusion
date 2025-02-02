import Navbar from "../components/Navbar"
// import { Link } from "react-router"
// import SuggestedUsers from "../components/SuggestedUserProfile"
// import CreatePost from "../components/CreatePost"
// import Test from "../components/Test"
import Media from "../components/Media"

const Home = () => {
  return (
    <div className="bg-gray-900 bg-cover min-h-screen no-scrollbar::-webkit-scrollbar">
      <Navbar />
      {/* <Test /> */}
      <Media />
      {/* <SuggestedUsers /> */}



    </div>
  )
}

export default Home
