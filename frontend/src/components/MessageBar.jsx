import PropTypes from "prop-types";

const MessageBar = ({ user }) => {

    const handleClick = () => {
        console.log("does nothing rn")
    }
  return (
    <div className="text-white flex justify-center mt-10">
      {user && (
        <button onClick={handleClick}>
          <img
            src={
              user.profile_pic
                ? `http://localhost:8081${user.profile_pic}`
                : "http://localhost:8081/default-profile.svg"
            }
            alt="null"
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-bold lowercase">
              @{user.username || "Unknown"}
            </p>
            {/* <p className="text-xs text-gray-600 uppercase">
              {user.name || user.full_name || "Anonymous"}
            </p> */}
          </div>
        </button>
      )}
    </div>
  );
};

MessageBar.propTypes = {
  user: PropTypes.number.isRequired,
};

export default MessageBar;
