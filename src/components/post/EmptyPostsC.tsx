import "../../styles/post.css";

interface EmptyPostsProps {
  userName?: string;
}

function EmptyPostsC({ userName }: EmptyPostsProps) {
  const isOtherProfile = !!userName;

  return (
    <div className="empty-post-box">
      <img
        className="empty-avatar"
        src="/avatata-2.png"
        alt=""
      />

      <div className="empty-title">
        <h1>No posts yet!</h1>

        <h3>
          {isOtherProfile
            ? `@${userName} hasn't shared anything yet.`
            : "Start sharing something and let your profile come to life."}
        </h3>
      </div>
    </div>
  );
}

export default EmptyPostsC;