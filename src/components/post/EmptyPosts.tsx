import { FaPlus } from "react-icons/fa6"
import "../../styles/post.css"


function EmptyPosts() {
  return (
    <div className="empty-post-box">
      <img className="empty-avatar" src="/avatata-2.png" alt="" />
      <div className="empty-title">
        <h1>No posts yet!</h1>
        <h3>Start sharing something and let your profile come to life.</h3>
        <button className="empty-btn"><FaPlus/>   New post</button>
      </div>
      
    </div>
  )
}

export default EmptyPosts
