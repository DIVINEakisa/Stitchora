import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/ui/Alert';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(user.role === 'designer' ? '/designer' : '/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(identifier, password);
      navigate(u.role === 'designer' ? '/designer' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-primary">Welcome Back</h1>
      <p className="mt-2 text-charcoal/60">Sign in to your Stitchora account</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <div>
          <label className="mb-1 block text-sm font-medium">Email or Phone Number</label>
          <input type="text" required className="input-field" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter your email or phone number" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal/60">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
      </p>
      <p className="mt-4 rounded-xl bg-card p-4 text-xs text-charcoal/50">
        Demo: customer@stitchora.demo / customer123 · elena@stitchora.demo / designer123
      </p>
    </div>
  );
}
