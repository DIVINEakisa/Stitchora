import { formatCurrency, PAYMENT_LABELS } from '../../utils/orderStatus';

export default function PaymentCard({ order, onPayDeposit, onPayRemaining, loading }) {
  const { totalPrice, depositAmount, remainingAmount, paymentStatus, status } = order;

  return (
    <div className="card-surface">
      <h3 className="font-display text-lg font-semibold text-primary">Payment</h3>
      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60">Total Price</span>
          <span className="font-semibold">{formatCurrency(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60">Deposit (50%)</span>
          <span>{formatCurrency(depositAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60">Remaining (50%)</span>
          <span>{formatCurrency(remainingAmount)}</span>
        </div>
        <div className="flex justify-between border-t border-primary/10 pt-3 text-sm">
          <span className="text-charcoal/60">Payment Status</span>
          <span className="rounded-full bg-accent/20 px-3 py-0.5 text-xs font-medium text-primary">
            {PAYMENT_LABELS[paymentStatus]}
          </span>
        </div>
      </div>

      {paymentStatus === 'pending' && status === 'reviewed' && onPayDeposit && (
        <button
          type="button"
          onClick={onPayDeposit}
          disabled={loading}
          className="btn-accent mt-6 w-full"
        >
          {loading ? 'Processing...' : `Pay Deposit ${formatCurrency(depositAmount)}`}
        </button>
      )}

      {paymentStatus === 'partially_paid' && status === 'ready' && onPayRemaining && (
        <button
          type="button"
          onClick={onPayRemaining}
          disabled={loading}
          className="btn-accent mt-6 w-full"
        >
          {loading ? 'Processing...' : `Pay Remaining ${formatCurrency(remainingAmount)}`}
        </button>
      )}

      {paymentStatus === 'fully_paid' && (
        <p className="mt-4 text-center text-sm text-primary">All payments complete</p>
      )}
    </div>
  );
}
