import { useState } from "react";
import Button from "../../components/button/Button";
import { useLogin } from "../../hooks/useLogin";
import "../../styles/login.css";
import {
  FaDiscord,
  FaEye,
  FaEyeSlash,
  FaFacebookF,
  FaGoogle,
  FaInstagram,
} from "react-icons/fa";

import logo from "../../assets/logo.png";

// Carrega todos os PNGs da pasta automaticamente (Vite).
// Basta colocar os avatares em src/assets/avatars/
const avatarModules = import.meta.glob<string>("../../assets/avatars/*.png", {
  eager: true,
  import: "default",
});

const avatars = Object.values(avatarModules);

// Repete a lista até ter itens suficientes pra preencher a largura da tela
function buildTrack(list: string[]): string[] {
  if (list.length === 0) return [];

  let base = [...list];
  while (base.length < 8) {
    base = [...base, ...list];
  }
  return base;
}

const rowOne = buildTrack(avatars);
const rowTwo = buildTrack([...avatars].reverse());

type MarqueeRowProps = {
  items: string[];
  reverse?: boolean;
};

function MarqueeRow({ items, reverse = false }: MarqueeRowProps) {
  if (items.length === 0) return null;

  return (
    <div className="marquee-row">
      <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
        {/* a lista aparece 2x: a animação anda 50% e recomeça sem pulo */}
        {[0, 1].map((copy) => (
          <div className="marquee-group" key={copy} aria-hidden={copy === 1}>
            {items.map((src, index) => (
              <img
                key={`${copy}-${index}`}
                src={src}
                alt=""
                className="marquee-avatar"
                draggable={false}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Login() {
  const loginMutation = useLogin();

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
      {/* ================= LADO ESQUERDO ================= */}
      <section className="login-box-left">
        <div className="login-blob blob-1" />
        <div className="login-blob blob-2" />

        <header className="brand">
          <img src={logo} alt="Artisphere logo" className="brand-logo" />
          <span className="brand-name">Artisphere</span>
        </header>

        <div className="hero">
          <h1 className="hero-title">
            <span className="reveal" style={{ "--i": 0 } as React.CSSProperties}>
              Share.
            </span>
            <span className="reveal" style={{ "--i": 1 } as React.CSSProperties}>
              Get inspired.
            </span>
            <span
              className="reveal highlight"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              Connect.
            </span>
          </h1>

          <p
            className="hero-text reveal"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            A platform for artists and fans to share ideas, creations, and
            stories
          </p>

          <div
            className="login-icons-box reveal"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <button type="button" className="login-icon-box" aria-label="Google">
              <FaGoogle className="login-icon" />
            </button>
            <button type="button" className="login-icon-box" aria-label="Facebook">
              <FaFacebookF className="login-icon" />
            </button>
            <button type="button" className="login-icon-box" aria-label="Instagram">
              <FaInstagram className="login-icon" />
            </button>
            <button type="button" className="login-icon-box" aria-label="Discord">
              <FaDiscord className="login-icon" />
            </button>
          </div>
        </div>

        <div className="avatar-marquee">
          <MarqueeRow items={rowOne} />
          <MarqueeRow items={rowTwo} reverse />
        </div>
      </section>

      {/* ================= LADO DIREITO ================= */}
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
            <button type="button" className="link-btn strong">
              Sign up
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;