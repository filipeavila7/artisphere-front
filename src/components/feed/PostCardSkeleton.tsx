import "../../styles/feed.css"


export function PostCardSkeleton() {
    const aspectRatios = [
        "3 / 4",
        "4 / 5",
        "1 / 1",
        "3 / 5",
        "4 / 3",
    ];

    const aspectRatio =
        aspectRatios[Math.floor(Math.random() * aspectRatios.length)];

    return (
        <div className="post-card skeleton-card">
            <div
                className="skeleton-image"
                style={{ aspectRatio }}
            />

            <div className="skeleton-title" />

            <div className="skeleton-info">
                <div className="skeleton-text" />
                <div className="skeleton-text small" />
            </div>
        </div>
    );
}