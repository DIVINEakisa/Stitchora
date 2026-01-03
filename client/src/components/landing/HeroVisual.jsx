import { motion } from 'framer-motion';
import heroMain from '../../assets/WhatsApp Image 2026-05-27 at 10.46.42 AM.jpeg';
import heroDetail1 from '../../assets/WhatsApp Image 2026-05-27 at 10.46.40 AM.jpeg';
import heroDetail2 from '../../assets/WhatsApp Image 2026-05-27 at 10.46.37 AM.jpeg';

const ORDER_STEPS = ['Custom design', 'In review', 'In production'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="grid grid-cols-[1fr_0.72fr] gap-3 sm:gap-4">
        {/* Main image */}
        <motion.div
          className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,58,32,0.18)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <img
            src={heroMain}
            alt="Stitchora tailored pieces and fabrics"
            className="aspect-[4/5] h-full w-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Secondary images */}
        <div className="grid gap-3 sm:gap-4">
          <motion.div
            className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-card"
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <img
              src={heroDetail1}
              alt="Detail of premium fabrics and tailoring details"
              className="aspect-[4/5] h-full w-full object-cover"
              loading="lazy"
            />
          </motion.div>
          <motion.div
            className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-card"
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src={heroDetail2}
              alt="Close-up of Stitchora fabric selection"
              className="aspect-square h-full w-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>

      {/* Floating order card */}
      <motion.div
        className="absolute -bottom-5 left-4 right-4 rounded-2xl border border-primary/10 bg-white/95 p-4 shadow-[0_18px_50px_rgba(15,58,32,0.18)] backdrop-blur sm:left-8 sm:right-auto sm:w-80"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Live brief</p>
            <p className="mt-1 font-display text-xl font-semibold text-primary">Evening dress concept</p>
          </div>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">In progress</span>
        </div>
        <div className="mt-4 space-y-3">
          {ORDER_STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-3 text-sm text-charcoal/65">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating quality badge */}
      <motion.div
        className="absolute right-4 top-4 hidden rounded-2xl border border-accent/30 bg-primary px-5 py-4 text-white shadow-[0_16px_40px_rgba(15,58,32,0.25)] sm:block"
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
      >
        <p className="font-display text-3xl font-semibold text-accent">Custom</p>
        <p className="text-xs font-medium text-white/75">Made-to-measure quality</p>
      </motion.div>
    </div>
  );
}
