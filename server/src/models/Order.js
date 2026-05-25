import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'requested',
  'reviewed',
  'deposit_paid',
  'in_production',
  'ready',
  'delivered',
  'rejected',
];

export const PAYMENT_STATUSES = ['pending', 'partially_paid', 'fully_paid'];

const measurementSchema = new mongoose.Schema(
  {
    chest: Number,
    waist: Number,
    hips: Number,
    shoulders: Number,
    inseam: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    designer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    designImage: { type: String, required: true },
    measurements: measurementSchema,
    fabric: { type: mongoose.Schema.Types.ObjectId, ref: 'Fabric' },
    designerChoosesFabric: { type: Boolean, default: false },
    preferredCompletionDate: { type: Date },
    estimatedCompletionDate: { type: Date },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'requested',
    },
    totalPrice: { type: Number, default: 0 },
    depositAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'pending',
    },
    depositPaidAt: Date,
    finalPaidAt: Date,
    rejectReason: { type: String, default: '' },
    rejectSuggestions: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (this.isModified('totalPrice') && this.totalPrice > 0) {
    this.depositAmount = Math.round(this.totalPrice * 0.5 * 100) / 100;
    this.remainingAmount = Math.round((this.totalPrice - this.depositAmount) * 100) / 100;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
