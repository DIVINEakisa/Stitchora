import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashPath = user?.role === 'designer' ? '/designer' : '/dashboard';

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-2xl font-semibold text-primary">
          Stitchora
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="/#how-it-works" className="text-sm text-charcoal/70 transition hover:text-primary">
            How It Works
          </a>
          <a href="/#designers" className="text-sm text-charcoal/70 transition hover:text-primary">
            Designers
          </a>
          <a href="/#fabrics" className="text-sm text-charcoal/70 transition hover:text-primary">
            Fabrics
          </a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NavLink
                to={dashPath}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-primary' : 'text-charcoal/70 hover:text-primary'}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-primary' : 'text-charcoal/70 hover:text-primary'}`
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
      </nav>
    </header>
  );
}
