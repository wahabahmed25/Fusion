//the page shows all the people you have messaged

// import Navbar from "../components/Navbar"
import MessageBar from "../components/MessageBar"
const MessagesPage = () => {
  return (
    <div className="bg-gray-900 h-screen">
        <div className="">
            {/* <Navbar /> */}
            <div className="flex justify-center text-white">
                <p>Messages</p>
            </div>
            <div>
                <MessageBar />
            </div>
        </div>
    </div>
  )
}

export default MessagesPage
