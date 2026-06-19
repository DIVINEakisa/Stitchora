# Designer Payout System Guide

## Overview

After a customer completes payment, the system automatically transfers earnings to the designer's preferred account (MTN Mobile Money, Airtel, or Bank).

## Payout Flow

```
Customer pays remaining amount
    ↓
Payment verified with provider
    ↓
Retrieve designer's payment preference
    ↓
Calculate amount (minus platform fee - optional)
    ↓
Initiate payout via payment provider
    ↓
Payout processed
    ↓
Designer receives notification
    ↓
Funds appear in designer's account
```

## Implementation Steps

### 1. Create Payout Configuration

Create `server/src/config/payout.js`:

```javascript
import { verifyPayment } from "./payment.js";

const PLATFORM_FEE_PERCENTAGE = 0.1; // 10% platform fee (optional)

export const calculateDesignerEarnings = (totalAmount) => {
  const platformFee = totalAmount * PLATFORM_FEE_PERCENTAGE;
  return totalAmount - platformFee;
};

export const initiateDesignerPayout = async (payoutData) => {
  const { designerId, amount, orderRef, designerEmail, paymentProvider } =
    payoutData;

  try {
    if (paymentProvider === "flutterwave") {
      return await initiateFlutterwavePayout({
        amount,
        orderRef,
        designerEmail,
      });
    } else if (paymentProvider === "paystack") {
      return await initiatePaystackPayout({
        amount,
        orderRef,
        designerEmail,
      });
    }
  } catch (err) {
    console.error("Payout initiation error:", err);
    throw new Error(`Payout failed: ${err.message}`);
  }
};

const initiateFlutterwavePayout = async (data) => {
  const { amount, orderRef, designerEmail } = data;

  // Flutterwave payout implementation
  // Requires: recipient bank code, account number, or mobile wallet

  // For this example, we'll use the disbursement API
  const response = await axios.post(
    "https://api.flutterwave.com/v3/transfers",
    {
      account_bank: data.bankCode, // Bank code for bank transfers
      account_number: data.accountNumber,
      amount,
      narration: `Stitchora Order ${orderRef}`,
      currency: "GHS",
      reference: orderRef,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    },
  );

  return {
    success: true,
    payoutId: response.data.data.id,
    status: response.data.data.status,
  };
};

const initiatePaystackPayout = async (data) => {
  const { amount, orderRef, designerEmail } = data;

  // Paystack transfer implementation
  const response = await axios.post(
    "https://api.paystack.co/transfer",
    {
      source: "balance", // Payout from business balance
      reason: `Stitchora Order ${orderRef}`,
      amount: Math.round(amount * 100), // Paystack uses cents
      recipient: data.recipientCode, // Created via /transfer_recipient endpoint
      currency: "GHS",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  return {
    success: true,
    payoutId: response.data.data.id,
    status: response.data.data.status,
  };
};
```

### 2. Update Order Routes

Add payout logic to `server/src/routes/orders.js`:

```javascript
import {
  calculateDesignerEarnings,
  initiateDesignerPayout,
} from "../config/payout.js";

// In the pay-remaining-confirm endpoint, after payment verification:

router.post(
  "/:id/pay-remaining-confirm",
  protect,
  authorize("customer"),
  async (req, res) => {
    try {
      // ... existing verification code ...

      // NEW: Initiate designer payout
      if (order.designer) {
        const designer = await User.findById(order.designer);

        if (designer?.paymentPreference) {
          const designerEarnings = calculateDesignerEarnings(
            order.remainingAmount,
          );

          try {
            const payoutResult = await initiateDesignerPayout({
              designerId: designer._id,
              amount: designerEarnings,
              orderRef: order._id,
              designerEmail: designer.email,
              paymentProvider: process.env.PAYMENT_PROVIDER,
              bankCode: designer.paymentPreference.bankCode,
              accountNumber: designer.paymentPreference.accountNumber,
              recipientCode: designer.paymentPreference.recipientCode,
            });

            // Store payout record
            order.designerPayout = {
              designerId: designer._id,
              amount: designerEarnings,
              method: designer.paymentPreference.method,
              payoutId: payoutResult.payoutId,
              status: payoutResult.status,
              initiatedAt: new Date(),
            };

            // Send notification email to designer
            await sendPayoutNotification(designer, order, designerEarnings);
          } catch (payoutErr) {
            console.error("Payout failed:", payoutErr);
            // Still mark order as paid, but log payout failure
            order.designerPayoutError = payoutErr.message;
          }
        }
      }

      await order.save();
      // ... rest of response ...
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);
```

### 3. Add Payout Schema to Order Model

Update `server/src/models/Order.js`:

```javascript
const payoutSchema = new mongoose.Schema(
  {
    designerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    method: String, // 'mtn', 'airtel', 'bank'
    payoutId: String,
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    initiatedAt: Date,
    completedAt: Date,
    failureReason: String,
  },
  { _id: false }
);

// Add to orderSchema:
designerPayout: payoutSchema,
designerPayoutError: String,
```

### 4. Create Recipient Codes for Designers

For Paystack, you need to create recipient codes. Add this to the auth/designer setup:

```javascript
// In designer profile update endpoint
export const createPaystackRecipient = async (designerData) => {
  const response = await axios.post(
    "https://api.paystack.co/transferrecipient",
    {
      type: designerData.paymentMethod === "bank" ? "nuban" : "mobile_money",
      name: designerData.accountName,
      account_number: designerData.accountNumber,
      bank_code: designerData.bankCode, // For bank transfers
      currency: "GHS",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  return response.data.data.recipient_code;
};
```

### 5. Create Payment Preference Form for Designers

Create `client/src/components/designer/PaymentPreferenceForm.jsx`:

```jsx
import { useState } from "react";
import api from "../../api/axios";
import Alert from "../ui/Alert";

export default function PaymentPreferenceForm({ designer, onSave }) {
  const [method, setMethod] = useState(
    designer?.paymentPreference?.method || "mtn",
  );
  const [accountNumber, setAccountNumber] = useState(
    designer?.paymentPreference?.accountNumber || "",
  );
  const [accountName, setAccountName] = useState(
    designer?.paymentPreference?.accountName || "",
  );
  const [phoneNumber, setPhoneNumber] = useState(
    designer?.paymentPreference?.phoneNumber || "",
  );
  const [bankName, setBankName] = useState(
    designer?.paymentPreference?.bankName || "",
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const paymentData = {
        method,
        accountNumber,
        accountName,
        phoneNumber,
        bankName,
      };

      const { data } = await api.patch("/auth/payment-preference", paymentData);
      setMessage("Payment preference saved successfully!");
      onSave(data);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to save payment preference",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface space-y-4">
      <h2 className="font-display text-lg font-semibold text-primary">
        Payment Preference
      </h2>

      {message && (
        <Alert
          type={message.includes("success") ? "success" : "error"}
          message={message}
        />
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-charcoal">
          Payment Method
        </label>
        <div className="space-y-2">
          {["mtn", "airtel", "bank"].map((m) => (
            <label key={m} className="flex items-center">
              <input
                type="radio"
                value={m}
                checked={method === m}
                onChange={(e) => setMethod(e.target.value)}
                className="h-4 w-4"
              />
              <span className="ml-3 cursor-pointer capitalize text-charcoal">
                {m}
              </span>
            </label>
          ))}
        </div>
      </div>

      {method !== "bank" && (
        <>
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-charcoal"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+233 5XX XXX XXX"
              className="input-field"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="account"
              className="mb-2 block text-sm font-medium text-charcoal"
            >
              Mobile Money Account Number
            </label>
            <input
              id="account"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Your account number"
              className="input-field"
              disabled={loading}
            />
          </div>
        </>
      )}

      {method === "bank" && (
        <>
          <div>
            <label
              htmlFor="bank"
              className="mb-2 block text-sm font-medium text-charcoal"
            >
              Bank Name
            </label>
            <input
              id="bank"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g., GCB Bank"
              className="input-field"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="account"
              className="mb-2 block text-sm font-medium text-charcoal"
            >
              Account Number
            </label>
            <input
              id="account"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Your bank account number"
              className="input-field"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-charcoal"
            >
              Account Name
            </label>
            <input
              id="name"
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Account holder name"
              className="input-field"
              disabled={loading}
            />
          </div>
        </>
      )}

      <button type="submit" className="btn-accent w-full" disabled={loading}>
        {loading ? "Saving..." : "Save Payment Preference"}
      </button>
    </form>
  );
}
```

### 6. Add Notification System

Create email notification for payout:

```javascript
// In routes/orders.js or a new file
const sendPayoutNotification = async (designer, order, amount) => {
  const emailContent = `
    <h2>Your Order Payment Has Been Received</h2>
    <p>Hi ${designer.name},</p>
    <p>Payment for order #${order._id.slice(-6)} has been confirmed.</p>
    <p><strong>Amount: GH₵${amount.toFixed(2)}</strong></p>
    <p>We've initiated a payout to your registered ${designer.paymentPreference.method} account.</p>
    <p>You should receive the funds within:</p>
    <ul>
      <li>Mobile Money (MTN/Airtel): 5-15 minutes</li>
      <li>Bank Transfer: 1-3 business days</li>
    </ul>
    <p>Order: #${order._id.slice(-6)}</p>
    <p>Thank you for using Stitchora!</p>
  `;

  // TODO: Implement email sending with your email provider
  // sendEmail(designer.email, 'Your Payout Has Been Initiated', emailContent);
};
```

## Payout Scenarios

### Scenario 1: Customer Pays Deposit

1. Customer initiates deposit payment
2. Completes payment on phone
3. System confirms payment
4. **No payout yet** (designer hasn't completed work)
5. Order status: `deposit_paid`

### Scenario 2: Customer Pays Remaining

1. Order is ready (designer completed work)
2. Customer initiates remaining payment
3. Completes payment on phone
4. System confirms payment
5. **System initiates payout to designer**
6. Funds transferred to designer's account
7. Designer receives notification
8. Order status: `ready` (waiting for delivery confirmation)

### Scenario 3: Payout Fails

1. Remaining payment confirmed
2. System attempts payout
3. Payout fails (invalid account, insufficient balance on provider, etc.)
4. Error recorded in `designerPayoutError`
5. Order marked as `fully_paid` (customer payment confirmed)
6. Admin notified of payout failure
7. Admin can manually retry payout

## Testing Payouts

### Test With Sandbox/Test Mode

Most payment providers have sandbox environments:

```javascript
// In .env
PAYMENT_PROVIDER=flutterwave
FLUTTERWAVE_SECRET_KEY=sk_test_... // test key (starts with sk_test)
FLUTTERWAVE_PUBLIC_KEY=pk_test_...

// Switch to production when ready:
FLUTTERWAVE_SECRET_KEY=sk_live_... // production key (starts with sk_live)
```

### Test Payout Flow

1. Create test designer with payment preference
2. Create test order
3. Trigger payment flow with test keys
4. Verify payout initiated in provider's dashboard
5. Check that payout shows as "pending" or "success"

## Compliance & Reconciliation

### Daily Reconciliation

```javascript
// Daily job to reconcile payouts
const reconcilePayouts = async () => {
  const pendingPayouts = await Order.find({
    "designerPayout.status": "pending",
    "designerPayout.initiatedAt": {
      $lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24 hours
    },
  });

  for (const order of pendingPayouts) {
    // Check payout status with provider
    const status = await checkPayoutStatus(order.designerPayout.payoutId);

    if (status === "success") {
      order.designerPayout.status = "success";
      order.designerPayout.completedAt = new Date();
    } else if (status === "failed") {
      order.designerPayout.status = "failed";
      // Retry or notify admin
    }

    await order.save();
  }
};
```

### Audit Trail

Keep all payout records for compliance:

```javascript
// Get payout history
const getPayoutHistory = async (designerId) => {
  const orders = await Order.find({
    designer: designerId,
    designerPayout: { $exists: true },
  });

  return orders.map((order) => ({
    orderId: order._id,
    amount: order.designerPayout.amount,
    method: order.designerPayout.method,
    status: order.designerPayout.status,
    date: order.designerPayout.initiatedAt,
  }));
};
```

## Next Steps

- [ ] Set up payment provider sandbox account
- [ ] Implement payout configuration
- [ ] Add payout schema to Order model
- [ ] Create payment preference form
- [ ] Test complete payout flow
- [ ] Implement email notifications
- [ ] Add payout history dashboard
- [ ] Set up daily reconciliation job
- [ ] Monitor first real payouts
- [ ] Document payout process for designers

## Troubleshooting

**Payout failed: "Invalid account number"**

- Verify account number format with payment provider
- Check that designer entered account correctly

**Payout stuck on "pending"**

- Check provider's status page
- Verify sufficient balance in merchant account
- Contact payment provider support

**Designer didn't receive funds**

- Check transaction status in provider's dashboard
- Verify designer's account details
- Wait appropriate time (5-15 min for mobile money, 1-3 days for bank)
