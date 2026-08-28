import { FaSearch } from "react-icons/fa"
import "../../styles/nav-bar.css"

function NavBar() {
  return (
    <nav className="nav-bar">
        <div className="nav-search-box">
            <div className="search">
              <div className="search-icon-box">
                <FaSearch className="search-icon"/>
              </div>
              <input placeholder="Search artists, artworks, tags..." 
               className="search-input" type="text" />
            </div>
        </div>

        <div>oi</div>
    </nav>
  )
}

export default NavBar