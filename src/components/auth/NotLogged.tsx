
import { Link } from "react-router-dom";
import "../../styles/not-logged.css";

function NotLogged() {
  return (
    <div className="not-logged-box">
        <img src="/avatar.png" alt="Ilustração de usuário não autenticado" />
        <h2>You need to be logged in</h2>
        <p>Please log in to your account to access this feature.</p>
        <Link to="/login">Login</Link>
    </div>
  )
}

export default NotLogged
