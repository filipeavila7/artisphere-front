import "../../styles/global.css"

function EmptyFollow() {
  return (
    <div className="empty-follow-box">
        <img className="follow-avatar" src="/avatar-4.png" alt="" />
        <div className="follow-empty-title">
            <p>You’re not following anyone yet.</p>
        </div>
        
    </div>
  )
}

export default EmptyFollow