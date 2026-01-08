import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-primary/10 bg-primary text-white/90">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-accent">
                St
              </span>
              <h3 className="font-display text-2xl font-semibold text-accent">Stitchora</h3>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Stitchora is a modern tailoring platform for clients and designers to collaborate on made-to-measure
              pieces with clarity and confidence.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <a href="/#how-it-works" className="hover:text-white">
                  How it works
                </a>
              </li>
              <li>
                <a href="/#services" className="hover:text-white">
                  Services
                </a>
              </li>
              <li>
                <a href="/#designers" className="hover:text-white">
                  Designers
                </a>
              </li>
              <li>
                <a href="/#fabrics" className="hover:text-white">
                  Fabrics
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Stay in touch</h4>
            <p className="mt-3 text-sm text-white/70">
              Be the first to know when new designers, fabrics, and features go live.
            </p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="input-field h-11 border-white/15 bg-white/10 text-sm text-white placeholder:text-white/50"
              />
              <button
                type="submit"
                className="btn-accent h-11 whitespace-nowrap px-4 text-xs font-semibold"
              >
                Join
              </button>
            </form>
            <div className="mt-4 flex gap-3 text-white/70">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-xs hover:border-white hover:text-white"
                aria-label="Visit Stitchora on X"
              >
                X
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-xs hover:border-white hover:text-white"
                aria-label="Visit Stitchora on Instagram"
              >
                Ig
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-xs hover:border-white hover:text-white"
                aria-label="Visit Stitchora on LinkedIn"
              >
                in
              </button>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/50">
          © {year} Stitchora. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
