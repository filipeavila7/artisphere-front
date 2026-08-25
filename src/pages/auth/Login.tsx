import Button from "../../components/button/Button"
import "../../styles/login.css"

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