import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const paymentPreferenceSchema = new mongoose.Schema(
  {
    method: { type: String, enum: ["mtn", "airtel", "bank"], required: true },
    accountNumber: { type: String, required: true },
    accountName: String,
    phoneNumber: String, // For mobile money
    bankName: String, // For bank transfers
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, sparse: true },
    phoneNumber: { type: String, sparse: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["customer", "designer"], default: "customer" },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    specialty: { type: String, default: "" },
    rating: { type: Number, default: 5 },
    completedOrders: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    paymentPreference: paymentPreferenceSchema, // For designers - how they receive payment
  },
  { timestamps: true },
);

// Add unique indexes for email and phone (allowing null values)
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });

userSchema.pre("save", async function (next) {
  // Validate that at least email or phone is provided
  if (!this.email && !this.phoneNumber) {
    throw new Error("Either email or phone number is required");
  }
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
