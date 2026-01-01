import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Footer from '../components/layout/Footer';
import HeroVisual from '../components/landing/HeroVisual';
import EditorialStrip from '../components/landing/EditorialStrip';
import fabricA from '../assets/WhatsApp Image 2026-05-27 at 10.46.38 AM (1).jpeg';
import fabricB from '../assets/WhatsApp Image 2026-05-27 at 10.46.39 AM.jpeg';
import fabricC from '../assets/WhatsApp Image 2026-05-27 at 10.46.41 AM.jpeg';
import fabricD from '../assets/WhatsApp Image 2026-05-27 at 10.46.43 AM.jpeg';
import ctaImage from '../assets/WhatsApp Image 2026-05-27 at 10.46.44 AM.jpeg';

const STEP_ICONS = [
  // Upload — arrow up into cloud shape
  <svg key="upload" className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="#0F3A20" fillOpacity="0.08"/>
    <path d="M20 26V16M20 16l-4 4M20 16l4 4" stroke="#0F3A20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 28h14" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"/>
  </svg>,
  // Measurements — ruler
  <svg key="measure" className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="#0F3A20" fillOpacity="0.08"/>
    <rect x="9" y="17" width="22" height="6" rx="2" stroke="#0F3A20" strokeWidth="2"/>
    <path d="M13 17v-2M17 17v-3M21 17v-2M25 17v-3" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,
  // Review — checkmark in circle
  <svg key="review" className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="#0F3A20" fillOpacity="0.08"/>
    <circle cx="20" cy="20" r="9" stroke="#0F3A20" strokeWidth="2"/>
    <path d="M15 20l3.5 3.5L25 17" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
  // Track — location pin / progress
  <svg key="track" className="h-10 w-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="#0F3A20" fillOpacity="0.08"/>
    <path d="M20 11c-3.3 0-6 2.7-6 6 0 4.5 6 12 6 12s6-7.5 6-12c0-3.3-2.7-6-6-6z" stroke="#0F3A20" strokeWidth="2"/>
    <circle cx="20" cy="17" r="2" fill="#D4AF37"/>
  </svg>,
];

const PROCESS_STEPS = [
  {
    title: 'Upload Design',
    desc: 'Start with a sketch, saved outfit, or reference photo. Your designer sees the exact mood and details you want.',
  },
  {
    title: 'Enter Measurements',
    desc: 'Share chest, waist, hips, shoulders, and inseam so every decision is made around your body.',
  },
  {
    title: 'Designer Reviews',
    desc: 'A professional tailor reviews feasibility, pricing, timing, fabrics, and any requested adjustments.',
  },
  {
    title: 'Track Production',
    desc: 'Pay the deposit, follow progress updates, chat in real time, and complete payment when the piece is ready.',
  },
];

const EXPERIENCE_POINTS = [
  'Role-based customer and designer dashboards',
  'Order milestones from requested to delivered',
  'Real-time chat for fabrics, fittings, and updates',
  'Secure image upload and structured measurement forms',
];

const FALLBACK_DESIGNERS = [
  {
    _id: '1',
    name: 'Elena Vasquez',
    specialty: 'Evening and Bridal',
    bio: 'Couture specialist focused on sculpted silhouettes and hand-finished detail.',
    rating: 4.9,
    completedOrders: 248,
    coverImage: fabricA,
  },
  {
    _id: '2',
    name: 'James Okonkwo',
    specialty: 'Bespoke Menswear',
    bio: 'Master tailor for refined suits, formalwear, and modern wardrobe staples.',
    rating: 4.8,
    completedOrders: 189,
    coverImage: fabricB,
  },
  {
    _id: '3',
    name: 'Amara Chen',
    specialty: 'Contemporary Couture',
    bio: 'Combines clean architectural shapes with luxury fabrics and subtle drama.',
    rating: 5.0,
    completedOrders: 312,
    coverImage: fabricC,
  },
];

const FALLBACK_FABRICS = [
  {
    _id: '1',
    name: 'Midnight Silk',
    material: 'Silk',
    color: 'Black',
    image: fabricA,
  },
  {
    _id: '2',
    name: 'Ivory Linen',
    material: 'Linen',
    color: 'Cream',
    image: fabricB,
  },
  {
    _id: '3',
    name: 'Emerald Velvet',
    material: 'Velvet',
    color: 'Green',
    image: fabricC,
  },
  {
    _id: '4',
    name: 'Champagne Satin',
    material: 'Satin',
    color: 'Gold',
    image: fabricD,
  },
];

function SectionHeader({ eyebrow, title, description, align = 'center' }) {
  const alignment = align === 'left' ? 'text-left' : 'text-center mx-auto';

  return (
    <motion.div
      className={`max-w-3xl ${alignment}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-primary sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-charcoal/65">{description}</p>
    </motion.div>
  );
}

export default function Landing() {
  const [designers, setDesigners] = useState(FALLBACK_DESIGNERS);
  const [fabrics, setFabrics] = useState(FALLBACK_FABRICS);

  useEffect(() => {
    api.get('/designers/featured').then(({ data }) => data.length && setDesigners(data)).catch(() => {});
    api.get('/fabrics/featured').then(({ data }) => data.length && setFabrics(data)).catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden bg-page">
      {/* HERO */}
      <section className="relative border-b border-primary/10 bg-[linear-gradient(120deg,#FAFAFA_0%,#F4F1EA_56%,#FAFAFA_100%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" aria-hidden />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-8 lg:py-20 xl:py-24">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-accent/30 bg-white/80 px-4 py-2 text-sm font-medium text-primary shadow-card">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
              Luxury tailoring · Modern workflow
            </div>

            <h1 className="mt-7 font-display text-4xl font-semibold leading-[1.05] text-primary sm:text-5xl lg:text-6xl">
              Your Perfect Style, <span className="text-accent">Tailored for You</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-charcoal/70">
              Upload your design, share your measurements, and collaborate with professional designers to create custom
              outfits made specifically for you.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-accent px-7 text-base">
                Start Designing
              </Link>
              <a href="#designers" className="btn-outline px-7 text-base">
                Explore Designers
              </a>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-charcoal/75 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  ✓
                </span>
                <span>Professional designers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  ✓
                </span>
                <span>Secure payments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  ✓
                </span>
                <span>Custom tailoring</span>
              </div>
            </div>
          </motion.div>

          <HeroVisual />
        </div>
      </section>

      <EditorialStrip />

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="How it works"
            title="From saved inspiration to a finished piece"
            description="Stitchora gives clients and designers a shared workspace for references, measurements, pricing, production milestones, and final delivery."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, index) => (
              <motion.article
                key={step.title}
                className="group flex flex-col gap-5 rounded-2xl border border-primary/10 bg-card p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.08 }}
              >
                <div className="flex items-center justify-between">
                  {STEP_ICONS[index]}
                  <span className="rounded-full border border-accent/30 bg-white px-3 py-1 text-xs font-semibold text-primary">
                    Step {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-primary">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-charcoal/65">{step.desc}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES / PLATFORM OVERVIEW */}
      <section id="services" className="bg-primary py-20 text-white lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Built for confidence</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
              A complete order lifecycle for custom fashion
            </h2>
            <p className="mt-4 leading-7 text-white/70">
              Customers know what is happening. Designers know what to review. Every order moves through clear milestones with payment checkpoints built into the journey.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {EXPERIENCE_POINTS.map((point) => (
              <motion.div
                key={point}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <div className="h-1 w-10 rounded-full bg-accent" aria-hidden />
                <p className="mt-4 text-sm leading-6 text-white/[0.82]">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="designers" className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              align="left"
              eyebrow="Featured designers"
              title="Meet the artisans behind the fit"
              description="Choose from designers who understand fabric, proportion, timelines, and the details that turn a reference into a garment."
            />
            <Link to="/register" className="btn-outline shrink-0 self-start md:self-auto">
              Find Your Designer
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {designers.map((designer, i) => (
              <motion.article
                key={designer._id}
                className="group overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.06 }}
              >
                {/* Fabric cover image — no people */}
                <div className="relative aspect-[5/4] overflow-hidden bg-card">
                  <img
                    src={designer.coverImage || FALLBACK_DESIGNERS[i % FALLBACK_DESIGNERS.length].coverImage}
                    alt={`${designer.specialty} fabric`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      {designer.specialty}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-semibold text-white">{designer.name}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-6 text-charcoal/65">{designer.bio}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-primary/10 pt-4 text-sm">
                    <span className="font-semibold text-primary">{designer.experience || '8+ years experience'}</span>
                    <span className="text-charcoal/55">Rating {designer.rating}</span>
                  </div>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center rounded-xl border border-primary/15 px-4 py-2 text-xs font-medium text-primary transition hover:border-primary/40 hover:bg-card"
                  >
                    View Profile
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="fabrics" className="bg-card py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Featured fabrics"
            title="Materials chosen for drape, color, and wear"
            description="Browse premium textiles or let your designer recommend the strongest fabric for your silhouette, budget, and completion date."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fabrics.map((fabric) => (
              <motion.article
                key={fabric._id}
                className="group overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <div className="relative aspect-square overflow-hidden bg-page">
                  <img
                    src={fabric.image}
                    alt={fabric.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-semibold text-primary">{fabric.name}</h3>
                  <p className="mt-2 text-sm text-charcoal/55">
                    {fabric.material} / {fabric.color}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <img
            src={ctaImage}
            alt="Stitchora fabric and tailoring details"
            className="h-full w-full object-cover opacity-20"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/92 to-primary/70" aria-hidden />
        </div>
        <motion.div
          className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-20 text-white sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-24"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Start your next piece
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Ready to Create Your Next Outfit?
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-white/80">
              Share your idea, define your fit, and let Stitchora connect you with professional designers for
              made-to-measure pieces.
            </p>
          </div>
          <Link to="/register" className="btn-accent shrink-0 px-7 text-base">
            Start Designing
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
