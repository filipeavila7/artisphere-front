import "../../styles/not-found.css";

function NotFound() {
    return (
        <div className="not-found">
            <div className="not-found-content">
                
                <img className="not-found-icon" src="/avatar-9.png" alt="" />

                <span className="not-found-number">404</span>

                <h1>Page not found</h1>

                <p>
                    The page you're looking for doesn't exist or may have been removed.
                </p>

                <button onClick={() => window.history.back()}>
                    Go back
                </button>
            </div>
        </div>
    );
}

export default NotFound;