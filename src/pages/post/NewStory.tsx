import { useNavigate } from "react-router-dom";
import "../../styles/new-story.css"

function NewStory() {
    const navigate = useNavigate();

    return (
        <div className="new-story-page">
            <div className="new-story-container">
                <div className="new-story-header">
                    <h1>Create a story</h1>
                    <p>
                        Choose how you want to share your moment.
                    </p>
                </div>

                <div className="new-story-options">
                    <button
                        className="new-story-option"
                        onClick={() => navigate("/new/story/image")}
                    >
                        <div className="new-story-option-preview image-preview">
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M3 16l5-5 4 4 2-2 7 6" />
                            </svg>
                        </div>

                        <div className="new-story-option-content">
                            <h2>Story with image</h2>
                            <p>
                                Share a photo or image with your followers.
                            </p>
                        </div>

                        <span className="new-story-option-arrow">
                            →
                        </span>
                    </button>

                    <button
                        className="new-story-option"
                        onClick={() => navigate("/new/story/text")}
                    >
                        <div className="new-story-option-preview text-preview">
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M5 4h14" />
                                <path d="M12 4v16" />
                                <path d="M8 20h8" />
                            </svg>
                        </div>

                        <div className="new-story-option-content">
                            <h2>Text story</h2>
                            <p>
                                Share a simple message through a story.
                            </p>
                        </div>

                        <span className="new-story-option-arrow">
                            →
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NewStory;