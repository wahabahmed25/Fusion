import PropTypes from "prop-types";
import defaultProfile from "../icons/default-profile.svg";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";
import SavePosts from "./SavePosts";
import EditPosts from "./EditPosts";
import { Link } from "react-router";
const PostCard = ({
  media_url,
  description,
  post_id,
  user,
}) => {
  const imageUrl = `http://localhost:8081/${media_url}`;

  const handleEditSuccess = () => {
    console.log("post updated, refresh");
  };
  
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 max-w-md mx-auto my-4">
      {/* User Profile and Edit Section */}
      <div className="flex justify-between items-center mb-2">
        {user && (
          <Link to = {`/userProfilePage/${user.user_id}`} className="flex items-center hover:bg-gray-300 rounded-lg hover:cursor-pointer px-2 py-1">
            <img
              src={user.profile_pic || defaultProfile}
              alt="null"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="text-sm font-bold lowercase">@{user.username || "Unknown"}</p>
              <p className="text-xs text-gray-600 uppercase">{user.name || user.full_name || "Anonymous"}</p>
            </div>
          </Link>
        )}

        {/* Edit button positioned on the top right */}
        <EditPosts
          post_id={post_id}
          onEdit={handleEditSuccess}
          initialDescription={description}
          initialMediaUrl={imageUrl}
        />
      </div>

      {/* Post Description */}
      <div className="">
        <h3 className="text-md px-1 pb-2 text-gray-800">{description}</h3>
      </div>

      {/* Post Image */}
      <div className="w-full h-80 overflow-hidden rounded-md mb-4">
        <img
          src={imageUrl}
          alt="Post"
          className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
        />
      </div>

      {/* Post Actions */}
      <div className="mt-4 flex justify-between items-center text-gray-600">
        <div className="flex items-center gap-4">
          <LikeButton post_id={post_id} />
          <CommentSection post_id={post_id} />
        </div>

        {/* Save */}
        <SavePosts post_id={post_id} />
      </div>
    </div>
  );
};

PostCard.propTypes = {
  media_url: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  post_id: PropTypes.number.isRequired,
  user: PropTypes.shape({
    user_id: PropTypes.number.isRequired, 
    profile_pic: PropTypes.string,
    username: PropTypes.string,
    name: PropTypes.string,
    full_name: PropTypes.string,
  }),
}
export default PostCard;