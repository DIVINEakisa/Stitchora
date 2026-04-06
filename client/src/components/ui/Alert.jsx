export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;
  const styles = {
    success: 'bg-primary/10 text-primary border-primary/20',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-card text-charcoal border-primary/10',
  };
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${styles[type]}`}>
      <p className="text-sm">{message}</p>
      {onClose && (
        <button type="button" onClick={onClose} className="ml-4 text-sm opacity-60 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}
