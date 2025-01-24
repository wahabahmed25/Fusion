import PersonalProfile from "../components/PersonalProfile"
import PersonalPosts from "../components/PersonalPosts"
import backIcon from "../icons/backArrow-icon.svg"
import { Link } from "react-router"
import FollowCount from "../components/FollowCount"
const PersonalProfilePage = () => {
  return (
    //something wrong with background
    <div className="bg-gray-800 w-full bg-cover">
        <Link to="/home">
            <img 
                src={backIcon}
                alt="back"
                className="w-7 h-7 ml-14 invert"
            />
            <h1 className="text-white ml-14">home</h1>
        </Link>
        <div className="flex justify-center">
            <PersonalProfile />
            <div className="flex justify-center text-white">
                <button className="bg-blue-700 min-h-max px-2">logout</button>
            </div>
        </div>
        
        <div className="text-white flex justify-center gap-8 mt-4">
            <FollowCount />
            <h1>posts 0</h1>
        </div>
        <div>
            <PersonalPosts />
        </div>
        
      

    </div>
  )
}

export default PersonalProfilePage
