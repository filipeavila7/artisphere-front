import "../../styles/new.css";

function New() {
  return (
    <div className="new-page">

      <div className="new-header">
        <h1>What do you want to create?</h1>
        <p>Choose what you want to share with the Artisphere community.</p>
      </div>

      <div className="new-options">

        <div className="new-option">
          <div className="new-option-image">
            <img src="/avatar-7.png" alt="" />
          </div>

          <div className="new-option-content">
            <h2>New story</h2>
            <p>
              Share a moment with your followers.
            </p>

            <span className="new-option-arrow">→</span>
          </div>
        </div>

        <div className="new-option">
          <div className="new-option-image">
            <img src="/avatar-8.png" alt="" />
          </div>

          <div className="new-option-content">
            <h2>New post</h2>
            <p>
              Create something to share with the community.
            </p>

            <span className="new-option-arrow">→</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default New;