import { useState } from "react"
// //come back later
// like table:
// id, user_id, post_id
const LikeButton = () => {
  const [likes, setLikes] = useState(true);
  const [error, setError] = useState("");
  
  const token = localStorage.getItem('authToken');
  if(!token){
    setError("Error authorizing");
  }
  const handleClick = async(e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8081/likes" , {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if(!response){
      console.error("error fetching likes");
      setError("Error fetching likes")
    }
    const likeData = response.json();
    setLikes(likeData);
    console.log(likeData);
    
  }


  return (
    <div>
      {error && (
        <p className="text-red-500">Erro occured fetching likes</p>
      )}
      <button onClick={handleClick}>{likes}</button>
    </div>
  )
}

export default LikeButton
