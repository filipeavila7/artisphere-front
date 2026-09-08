import { FaArrowRight} from "react-icons/fa6"
import "../../styles/post.css"


function EmptyPostsB() {
  return (
    <div className="empty-post-box">
      <img className="empty-avatar" src="/avatata-2.png" alt="" />
      <div className="empty-title">
        <h1>No posts yet!</h1>
        <h3>Like your favorite posts and find them here anytime.</h3>
        <button className="empty-btn"> Go to feed <FaArrowRight/></button>
      </div>
      
    </div>
  )
}

export default EmptyPostsB
