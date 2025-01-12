import Navbar from "../components/Navbar"
import { Link } from "react-router"
import YourProfile from "../components/PersonalProfile"
const Home = () => {
  return (
    <div className="bg-gray-900 bg-cover min-h-screen">
      <div className="pt-16">
        <Link to="/home" className="text-white text-4xl font-extrabold tracking-wide p-12 hover:text-pink-500 transition duration-300">FUSION</Link>
      </div>
      <YourProfile />
      <Navbar />
    </div>
  )
}

export default Home
