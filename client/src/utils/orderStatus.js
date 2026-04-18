export const STATUS_STEPS = [
  { key: 'requested', label: 'Requested' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'deposit_paid', label: 'Deposit Paid' },
  { key: 'in_production', label: 'In Production' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
];

export const STATUS_LABELS = {
  requested: 'Requested',
  reviewed: 'Reviewed',
  deposit_paid: 'Deposit Paid',
  in_production: 'In Production',
  ready: 'Ready',
  delivered: 'Delivered',
  rejected: 'Rejected',
};

export const PAYMENT_LABELS = {
  pending: 'Pending',
  partially_paid: 'Partially Paid',
  fully_paid: 'Fully Paid',
};

export function getStatusIndex(status) {
  if (status === 'rejected') return -1;
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}
