import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaHashtag, FaRegImage, FaSearch, FaTimes } from "react-icons/fa";

import { getSearchSuggestions } from "../../service/search/SearchService";

import "../../styles/nav-bar.css";

function NavBar() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: () => getSearchSuggestions(query),
    enabled: query.trim().length > 0,
    staleTime: 30 * 1000,
  });

  const profiles = suggestions?.profiles ?? [];
  const posts = suggestions?.posts ?? [];
  const tags = suggestions?.tags ?? [];

  const hasSuggestions =
    profiles.length > 0 || posts.length > 0 || tags.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    const value = query.trim();

    if (!value) {
      return;
    }

    setShowSuggestions(false);

    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleProfileClick = (userName: string) => {
    setShowSuggestions(false);

    navigate(`/user/${encodeURIComponent(userName)}`);
  };

  const handlePostClick = (title: string) => {
    setShowSuggestions(false);
    setQuery(title);

    navigate(`/search?q=${encodeURIComponent(title)}`);
  };

  const handleTagClick = (name: string) => {
    setShowSuggestions(false);
    setQuery(name);

    navigate(`/search?q=${encodeURIComponent(name)}`);
  };

  const handleClear = () => {
    setQuery("");
    setShowSuggestions(false);
  };

  return (
    <nav className="nav-bar">
      <div className="nav-search-box" ref={searchRef}>
        <div className="search">
          <div className="search-icon-box">
            <FaSearch className="search-icon" />
          </div>

          <input
            placeholder="Search artists, artworks, tags..."
            className="search-input"
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (query.trim()) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={handleKeyDown}
          />

          {query && (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={handleClear}
            >
              <FaTimes />
            </button>
          )}
        </div>

        {showSuggestions && query.trim() && (
          <div className="search-suggestions">
            {/* =========================
                BUSCA DIRETA
            ========================= */}

            <button
              type="button"
              className="search-suggestion"
              onClick={handleSearch}
            >
              <span className="suggestion-icon">
                <FaSearch />
              </span>

              <div className="suggestion-info">
                <span className="suggestion-name">
                  Search for “{query.trim()}”
                </span>
              </div>

              <kbd className="suggestion-kbd">Enter</kbd>
            </button>

            {isLoading && (
              <div className="search-suggestion-loading">Searching...</div>
            )}

            {!isLoading && !hasSuggestions && (
              <div className="search-suggestion-empty">No results found</div>
            )}

            {/* =========================
                ARTISTS
            ========================= */}

            {!isLoading && profiles.length > 0 && (
              <div className="suggestion-section">
                <span className="suggestion-section-title">Artists</span>

                {profiles.map((profile) => (
                  <button
                    type="button"
                    key={profile.id}
                    className="search-suggestion"
                    onClick={() => handleProfileClick(profile.userName)}
                  >
                    <img
                      src={profile.imageUrlProfile || "/null-pfp-l.png"}
                      alt={profile.userName}
                      className="suggestion-image"
                    />

                    <div className="suggestion-info">
                      <span className="suggestion-name">{profile.name}</span>

                      <span className="suggestion-username">
                        @{profile.userName}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* =========================
                ARTWORKS
            ========================= */}

            {!isLoading && posts.length > 0 && (
              <div className="suggestion-section">
                <span className="suggestion-section-title">Artworks</span>

                {posts.map((title) => (
                  <button
                    type="button"
                    key={title}
                    className="search-suggestion"
                    onClick={() => handlePostClick(title)}
                  >
                    <span className="suggestion-icon">
                      <FaRegImage />
                    </span>

                    <div className="suggestion-info">
                      <span className="suggestion-name">{title}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* =========================
                TAGS
            ========================= */}

            {!isLoading && tags.length > 0 && (
              <div className="suggestion-section">
                <span className="suggestion-section-title">Tags</span>

                {tags.map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    className="search-suggestion"
                    onClick={() => handleTagClick(tag.name)}
                  >
                    <span className="suggestion-icon">
                      <FaHashtag />
                    </span>

                    <div className="suggestion-info">
                      <span className="suggestion-name">{tag.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;