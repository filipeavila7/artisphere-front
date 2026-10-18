import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Button from "../../components/button/Button";
import AuthShowcase from "../../components/auth/AuthShowcase";
import { useLogin } from "../../hooks/useLogin";

import logo from "../../assets/logo.png";
import "../../styles/login.css";

function Login() {
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // passar valores digitados para a mutation e ele manda para a requisição na service
    loginMutation.mutate({
      email,
      password,
    });
  }

  return (
    <div className="login-lay">
      <AuthShowcase />

      <section className="login-box-right">
        {/* só aparece no mobile, quando o painel roxo some */}
        <div className="brand brand-mobile">
          <img src={logo} alt="Artisphere logo" className="brand-logo" />
          <span className="brand-name">Artisphere</span>
        </div>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Log in to keep creating and connecting</p>
        </div>

        <div className="login-box">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {loginMutation.isError && (
              <p className="login-error" role="alert">
                Couldn't log you in. Check your email and password.
              </p>
            )}

            <div className="btn-login-box">
              <Button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </div>

            <div className="forgot-box">
              <button type="button" className="link-btn">
                Forgot your password?
              </button>
            </div>
          </form>

          <div className="line"></div>

          <div className="sign-box">
            <span>Don’t have an account?</span>
            <button
              type="button"
              className="link-btn strong"
              onClick={() => navigate("/register")}
            >
              Sign up
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;