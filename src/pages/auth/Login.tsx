import Button from "../../components/button/Button"
import "../../styles/login.css"
import { FaDiscord, FaGoogle, FaInstagram } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";

function Login() {
  return (
    <div className="login-lay">
      <div className="login-box-left">
        <div className="title-r-box">
          <h1>Share.</h1>
          <h1>Get inspired.</h1>
          <h1>Connect.</h1>
          <div className="p-r-box">
            <p>A platform for artists and fans to share ideas, creations, and stories</p>
          </div>
          <div className="login-icons-box">
            <div className="login-icon-box">
                <FaGoogle className="login-icon" />
            </div>

            <div className="login-icon-box">
                <FaFacebookF className="login-icon" />
            </div>
            <div className="login-icon-box">
                <FaInstagram className="login-icon" />
            </div>
            <div className="login-icon-box">
                <FaDiscord className="login-icon" />
            </div>
          </div>
          
        </div>

      </div>
      <div className="login-box-right">
        <h1>Login</h1>
        <div className="login-box">
            <form className="login-form" action="">
              <label htmlFor="email">Email</label>
              <input type="text" id="email" />

              <label htmlFor="">Password</label>
              <input type="password" />
              <div className="btn-login-box">
                <Button type="submit">Login</Button>
              </div>
              
              <div className="forgot-box">
                <p >Forgot your password?</p>
              </div>
              
              
            </form>
            <div className="line"></div>

            <div className="sign-box">
              <p>Don’t have an account? Sign up</p>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Login