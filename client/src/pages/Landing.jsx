import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Footer from '../components/layout/Footer';

const STEPS = [
  { title: 'Upload Design', desc: 'Share your vision with sketches or reference photos.', icon: '📐' },
  { title: 'Enter Measurements', desc: 'Provide precise body measurements for a perfect fit.', icon: '📏' },
  { title: 'Designer Reviews & Accepts', desc: 'A professional reviews your request and sets pricing.', icon: '✨' },
  { title: 'Pay Deposit & Track Order', desc: 'Pay 50% to start production and track every milestone.', icon: '💳' },
];

const TESTIMONIALS = [
  { name: 'Sophia Laurent', text: 'Stitchora transformed my wedding dress vision into reality. The craftsmanship exceeded every expectation.', role: 'Bride' },
  { name: 'Marcus Reid', text: 'My bespoke suit fits like it was painted on. The designer communication throughout was exceptional.', role: 'Executive' },
  { name: 'Yuki Tanaka', text: 'From upload to delivery, every step felt premium. This is how custom fashion should work.', role: 'Fashion Enthusiast' },
];

export default function Landing() {
  const [designers, setDesigners] = useState([]);
  const [fabrics, setFabrics] = useState([]);

  useEffect(() => {
    api.get('/designers/featured').then(({ data }) => setDesigners(data)).catch(() => {});
    api.get('/fabrics/featured').then(({ data }) => setFabrics(data)).catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-card via-background to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
          <div>
            <span className="inline-block rounded-full bg-accent/20 px-4 py-1 text-sm font-medium text-primary">
              Premium Custom Tailoring
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-6xl">
              Design Your Perfect Outfit with Stitchora
            </h1>
            <p className="mt-6 text-lg text-charcoal/70">
              Upload your idea, share your measurements, and get custom-tailored clothing from professional designers.
            </p>
            <Link to="/register" className="btn-accent mt-8 inline-flex text-base">
              Start Designing
            </Link>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1558171813-4c088f5c6f0f?w=800&q=80"
              alt="Fashion tailoring studio with fabric and sewing tools"
              className="rounded-2xl shadow-soft"
            />
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-primary px-6 py-4 text-white shadow-soft">
              <p className="font-display text-2xl font-semibold text-accent">500+</p>
              <p className="text-sm text-white/80">Custom pieces crafted</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-primary sm:text-4xl">How It Works</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-charcoal/60">
            Four simple steps from concept to your wardrobe
          </p>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="card-surface text-center">
                <span className="text-3xl">{step.icon}</span>
                <span className="mt-4 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                  Step {i + 1}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-charcoal/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="designers" className="bg-card/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-primary">Featured Designers</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {designers.map((d) => (
              <div key={d._id} className="card-surface overflow-hidden p-0">
                <img
                  src={d.avatar || 'https://images.unsplash.com/photo-1594744803329-e58b31de8cd5?w=400'}
                  alt={d.name}
                  className="h-48 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-primary">{d.name}</h3>
                  <p className="text-sm text-accent">{d.specialty}</p>
                  <p className="mt-2 text-sm text-charcoal/60 line-clamp-2">{d.bio}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-accent">★ {d.rating}</span>
                    <span className="text-charcoal/50">{d.completedOrders} orders</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fabrics" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-primary">Featured Fabrics</h2>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {fabrics.map((f) => (
              <div key={f._id} className="group overflow-hidden rounded-2xl bg-card shadow-card transition hover:shadow-soft">
                <img src={f.image} alt={f.name} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="p-4">
                  <h3 className="font-medium text-primary">{f.name}</h3>
                  <p className="text-xs text-charcoal/50">{f.material} · {f.color}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-accent">What Our Clients Say</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="rounded-2xl bg-white/5 p-6 backdrop-blur">
                <p className="text-white/90">&ldquo;{t.text}&rdquo;</p>
                <footer className="mt-4">
                  <cite className="font-medium not-italic text-accent">{t.name}</cite>
                  <p className="text-sm text-white/50">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <h2 className="font-display text-3xl font-bold text-primary">Ready to create something extraordinary?</h2>
        <Link to="/register" className="btn-primary mt-8 inline-flex">
          Start Designing Today
        </Link>
      </section>

      <Footer />
    </div>
  );
}
