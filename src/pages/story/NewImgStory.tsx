import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/new-story-img.css"

import type { StoryVisibility } from "../../types/story/StoryType";
import { createStory, uploadStoryImage } from "../../service/story/StoryService";

function NewStoryImage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [description, setDescription] = useState("");
    const [visibility, setVisibility] =
        useState<StoryVisibility>("EVERYONE");

    const [isCreating, setIsCreating] = useState(false);

    const handleImageChange = (file: File | undefined) => {
        if (!file) {
            return;
        }

        setSelectedImage(file);

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleFileInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        handleImageChange(event.target.files?.[0]);
    };

    const handleSelectImage = () => {
        fileInputRef.current?.click();
    };

    const handleCreateStory = async () => {
        if (!selectedImage || isCreating) {
            return;
        }

        try {
            setIsCreating(true);

            const filename = await uploadStoryImage(selectedImage);

            await createStory({
                imageUrl: filename,
                visibility,
                description: description.trim() || undefined,
            });

            navigate("/feed");
        } catch (error) {
            console.error("Error creating story:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="new-story-image-page">
            <div className="new-story-image-container">

                <div className="new-story-image-header">
                    <button
                        className="new-story-back-button"
                        onClick={() => navigate("/new/story")}
                        type="button"
                    >
                        ←
                    </button>

                    <div>
                        <h1>Create an image story</h1>
                        <p>
                            Share a moment with your followers.
                        </p>
                    </div>
                </div>

                <div className="new-story-image-form">

                    <div
                        className={`story-upload-area ${
                            previewUrl ? "has-image" : ""
                        }`}
                        onClick={handleSelectImage}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={handleFileInputChange}
                            hidden
                        />

                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Story preview"
                                className="story-image-preview"
                            />
                        ) : (
                            <div className="story-upload-placeholder">
                                <div className="story-upload-icon">
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
                                        <circle
                                            cx="8.5"
                                            cy="8.5"
                                            r="1.5"
                                        />
                                        <path d="M3 16l5-5 4 4 2-2 7 6" />
                                    </svg>
                                </div>

                                <h2>Upload an image</h2>

                                <p>
                                    Click to choose an image from your
                                    device.
                                </p>

                                <span>
                                    JPG or PNG · Max. 10 MB
                                </span>
                            </div>
                        )}
                    </div>

                    {selectedImage && (
                        <button
                            type="button"
                            className="change-image-button"
                            onClick={handleSelectImage}
                        >
                            Change image
                        </button>
                    )}

                    <div className="story-field">
                        <label htmlFor="story-description">
                            Description
                        </label>

                        <textarea
                            id="story-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder="Add a description..."
                            maxLength={100}
                        />

                        <span className="story-field-hint">
                            {description.length}/100 characters
                        </span>
                    </div>

                    <div className="story-field">
                        <label>Who can see your story?</label>

                        <div className="story-visibility-options">

                            <button
                                type="button"
                                className={`story-visibility-option ${
                                    visibility === "EVERYONE"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    setVisibility("EVERYONE")
                                }
                            >
                                <div className="visibility-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="2.5"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <strong>Everyone</strong>
                                    <span>
                                        Anyone who can view your profile
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                className={`story-visibility-option ${
                                    visibility === "CLOSE_FRIENDS"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    setVisibility("CLOSE_FRIENDS")
                                }
                            >
                                <div className="visibility-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle
                                            cx="9"
                                            cy="7"
                                            r="4"
                                        />
                                        <path d="M16 11h6" />
                                        <path d="M19 8v6" />
                                    </svg>
                                </div>

                                <div>
                                    <strong>Close friends</strong>
                                    <span>
                                        Only people on your close friends list
                                    </span>
                                </div>
                            </button>

                        </div>
                    </div>

                    <button
                        type="button"
                        className="create-story-button"
                        disabled={!selectedImage || isCreating}
                        onClick={handleCreateStory}
                    >
                        {isCreating
                            ? "Creating story..."
                            : "Create story"}
                    </button>

                </div>
            </div>
        </div>
    );
}

export default NewStoryImage;