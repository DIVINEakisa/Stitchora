import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashPath = user?.role === 'designer' ? '/designer' : '/dashboard';

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Designers', href: '/#designers' },
    { label: 'Services', href: '/#services' },
    { label: 'Contact', href: '/#contact' },
  ];

  const headerClasses = scrolled
    ? 'bg-white/95 border-b border-primary/10 shadow-soft backdrop-blur-md'
    : 'bg-transparent border-b border-transparent';

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${headerClasses}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-accent shadow-soft">
            St
          </span>
          <span className="font-display text-2xl font-semibold text-primary">Stitchora</span>
        </Link>

        {/* Center nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-charcoal/70 transition hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <NavLink
                to={dashPath}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-primary' : 'text-charcoal/70 hover:text-primary'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-primary' : 'text-charcoal/70 hover:text-primary'
                  }`
                }
              >
                Messages
              </NavLink>
              <button type="button" onClick={handleLogout} className="btn-outline py-2 text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-charcoal/70 transition hover:text-primary">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary py-2 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary/10 bg-white/80 text-charcoal/80 shadow-card transition hover:border-primary/40 hover:text-primary md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="space-y-1.5">
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition ${
                open ? 'translate-y-1.5 rotate-45' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-4 rounded-full bg-current transition ${
                open ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition ${
                open ? '-translate-y-1.5 -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-primary/10 bg-white/95 shadow-soft backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-charcoal/80 transition hover:bg-card hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              {user ? (
                <>
                  <NavLink
                    to={dashPath}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-charcoal/80 transition hover:bg-card hover:text-primary"
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/chat"
                    className="rounded-xl px-3 py-2 text-sm font-medium text-charcoal/80 transition hover:bg-card hover:text-primary"
                  >
                    Messages
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-xl border border-primary/15 px-3 py-2 text-sm font-medium text-primary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex-1 rounded-xl border border-primary/15 px-3 py-2 text-center text-sm font-medium text-charcoal/80"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 rounded-xl bg-primary px-3 py-2 text-center text-sm font-medium text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
