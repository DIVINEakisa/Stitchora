import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-primary text-white/90">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-display text-2xl font-semibold text-accent">Stitchora</h3>
            <p className="mt-3 text-sm text-white/70">
              Premium custom fashion connecting you with professional designers worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-accent">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li><Link to="/register" className="hover:text-white">Create Account</Link></li>
              <li><a href="/#how-it-works" className="hover:text-white">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-accent">Contact</h4>
            <p className="mt-3 text-sm text-white/70">hello@stitchora.com</p>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/50">
          © {new Date().getFullYear()} Stitchora. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
