import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/ui/Alert';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', password: '', role: 'customer' });
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
      const u = await register(form);
      navigate(u.role === 'designer' ? '/designer' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-primary">Join Stitchora</h1>
      <p className="mt-2 text-charcoal/60">Create your account to start designing</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <div>
          <label className="mb-1 block text-sm font-medium">Full Name</label>
          <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Optional if phone is provided" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone Number</label>
          <input type="tel" className="input-field" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="Optional if email is provided" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input type="password" required minLength={6} className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {['customer', 'designer'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`rounded-xl border-2 py-3 text-sm font-medium capitalize transition ${
                  form.role === r ? 'border-primary bg-primary/5 text-primary' : 'border-primary/15 hover:border-primary/30'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-accent w-full">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal/60">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">Sign In</Link>
      </p>
    </div>
  );
}
