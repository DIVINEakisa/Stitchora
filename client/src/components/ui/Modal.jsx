import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} rounded-2xl bg-white p-6 shadow-soft animate-in`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-charcoal/50 transition hover:bg-card hover:text-charcoal"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
