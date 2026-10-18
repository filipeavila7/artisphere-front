import { FaDiscord, FaFacebookF, FaGoogle, FaInstagram } from "react-icons/fa";

import logo from "../../assets/logo.png";

// Carrega todos os PNGs da pasta automaticamente (Vite).
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

function AuthShowcase() {
  return (
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
  );
}

export default AuthShowcase;