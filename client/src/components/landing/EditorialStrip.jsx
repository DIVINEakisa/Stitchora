import atelier1 from '../../assets/WhatsApp Image 2026-05-27 at 10.46.35 AM.jpeg';
import atelier2 from '../../assets/WhatsApp Image 2026-05-27 at 10.46.36 AM.jpeg';
import atelier3 from '../../assets/WhatsApp Image 2026-05-27 at 10.46.38 AM.jpeg';
import { motion } from 'framer-motion';

const STRIP = [
  {
    src: atelier1,
    alt: 'Tailoring space with neatly arranged garments',
    label: 'Atelier quality',
  },
  {
    src: atelier2,
    alt: 'Close view of curated premium fabrics',
    label: 'Premium fabrics',
  },
  {
    src: atelier3,
    alt: 'Detail of Stitchora tailoring setup',
    label: 'Precision craft',
  },
];

export default function EditorialStrip() {
  return (
    <section className="border-y border-primary/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
        {STRIP.map((item) => (
          <motion.figure
            key={item.label}
            className="group relative overflow-hidden rounded-2xl bg-primary shadow-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="aspect-[16/10] h-full w-full object-cover opacity-[0.85] transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
              loading="lazy"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/85 to-transparent p-4">
              <span className="font-display text-lg font-semibold text-white">{item.label}</span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
