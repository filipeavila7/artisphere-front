import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import "../../styles/new-story-text.css";

import type { StoryVisibility } from "../../types/story/StoryType";
import { createTextStory } from "../../service/story/StoryService";

const MAX_LENGTH = 250;

const BACKGROUND_COLORS = [
    "#6d28d9",
    "#4c1d95",
    "#7c3aed",
    "#a21caf",
    "#be185d",
    "#dc2626",
    "#ea580c",
    "#0f766e",
    "#0369a1",
    "#1e293b",
];

function getFontSize(length: number): string {
    if (length > 160) return "1.35rem";
    if (length > 90) return "1.7rem";
    if (length > 40) return "2.1rem";
    return "2.6rem";
}

function NewStoryText() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [text, setText] = useState("");
    const [backgroundColor, setBackgroundColor] = useState(
        BACKGROUND_COLORS[0]
    );
    const [visibility, setVisibility] =
        useState<StoryVisibility>("EVERYONE");

    const [isCreating, setIsCreating] = useState(false);

    const handleNextColor = () => {
        const currentIndex = BACKGROUND_COLORS.indexOf(backgroundColor);
        const nextIndex = (currentIndex + 1) % BACKGROUND_COLORS.length;
        setBackgroundColor(BACKGROUND_COLORS[nextIndex]);
    };

    const handleCreateStory = async () => {
        if (!text.trim() || isCreating) {
            return;
        }

        try {
            setIsCreating(true);

            await createTextStory({
                text: text.trim(),
                backgroundColor,
                visibility,
            });

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["my-profile"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["profile"],
                }),  
                queryClient.invalidateQueries({
                    queryKey: ["myStories"],
                }),
                
            ]);

            navigate("/feed");
        } catch (error) {
            console.error("Error creating text story:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="new-story-text-page">
            <div className="new-story-text-container">

                <div className="new-story-text-header">
                    <button
                        className="new-story-text-back-button"
                        onClick={() => navigate("/new/story")}
                        type="button"
                    >
                        ←
                    </button>

                    <div>
                        <h1>Create a text story</h1>
                        <p>Say something with a splash of color.</p>
                    </div>
                </div>

                <div className="new-story-text-form">

                    <div
                        className="story-text-canvas"
                        style={{ backgroundColor }}
                    >
                        <textarea
                            className="story-text-input"
                            value={text}
                            onChange={(event) =>
                                setText(event.target.value)
                            }
                            placeholder="Type a status"
                            maxLength={MAX_LENGTH}
                            style={{ fontSize: getFontSize(text.length) }}
                            autoFocus
                        />

                        <button
                            type="button"
                            className="story-text-color-button"
                            onClick={handleNextColor}
                            aria-label="Change background color"
                            title="Change background color"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.3-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.3A3.7 3.7 0 0 0 21 11 9 9 0 0 0 12 3Z" />
                                <circle cx="7.5" cy="11" r="1" />
                                <circle cx="10.5" cy="7" r="1" />
                                <circle cx="15" cy="7.5" r="1" />
                            </svg>
                        </button>

                        <span className="story-text-counter">
                            {text.length}/{MAX_LENGTH}
                        </span>
                    </div>

                    <div className="story-text-palette">
                        {BACKGROUND_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className={`story-text-swatch ${backgroundColor === color ? "selected" : ""
                                    }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setBackgroundColor(color)}
                                aria-label={`Select color ${color}`}
                            />
                        ))}
                    </div>

                    <div className="story-text-field">
                        <label>Who can see your story?</label>

                        <div className="story-text-visibility-options">

                            <button
                                type="button"
                                className={`story-text-visibility-option ${visibility === "EVERYONE" ? "selected" : ""
                                    }`}
                                onClick={() => setVisibility("EVERYONE")}
                            >
                                <div className="story-text-visibility-icon">
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                                        <circle cx="12" cy="12" r="2.5" />
                                    </svg>
                                </div>

                                <div>
                                    <strong>Everyone</strong>
                                    <span>Anyone who can view your profile</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                className={`story-text-visibility-option ${visibility === "CLOSE_FRIENDS" ? "selected" : ""
                                    }`}
                                onClick={() => setVisibility("CLOSE_FRIENDS")}
                            >
                                <div className="story-text-visibility-icon">
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M16 11h6" />
                                        <path d="M19 8v6" />
                                    </svg>
                                </div>

                                <div>
                                    <strong>Close friends</strong>
                                    <span>Only people on your close friends list</span>
                                </div>
                            </button>

                        </div>
                    </div>

                    <button
                        type="button"
                        className="create-story-text-button"
                        disabled={!text.trim() || isCreating}
                        onClick={handleCreateStory}
                    >
                        {isCreating ? "Creating story..." : "Create story"}
                    </button>

                </div>
            </div>
        </div>
    );
}

export default NewStoryText;