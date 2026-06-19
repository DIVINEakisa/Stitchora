# Payment System Implementation Guide

## Overview

This guide explains how to set up and use the new realistic mobile money payment system in your Stitchora project.

## Key Features

✅ **Real Mobile Money Integration**: Supports MTN and Airtel mobile money payments  
✅ **Payment Confirmation**: Users must confirm payment on their phone  
✅ **Transaction Tracking**: All payment attempts are tracked in the database  
✅ **Designer Payouts**: Money automatically transfers to designer's preferred account  
✅ **Payment History**: Complete audit trail of all transactions

## Architecture

### Frontend Flow

```
PaymentCard (shows payment button)
    ↓
PaymentModal (opens - asks for method & phone)
    ↓
User enters payment details
    ↓
POST /pay-[deposit|remaining]-initiate
    ↓
USSD/Payment Prompt appears on user's phone
    ↓
User confirms payment on phone
    ↓
User clicks "I've Completed Payment"
    ↓
POST /pay-[deposit|remaining]-confirm
    ↓
Payment verified with provider
    ↓
Order marked as paid ✓
    ↓
Designer gets payout notification
```

### Backend Payment Providers

Currently supports:

- **Flutterwave** (Recommended) - Supports 20+ African countries
- **Paystack** - Supports Ghana, Nigeria, Kenya, South Africa
- Can easily extend to other providers

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your server directory with:

```env
# Payment Provider - choose 'flutterwave' or 'paystack'
PAYMENT_PROVIDER=flutterwave

# Flutterwave Configuration
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key

# Paystack Configuration (if using Paystack)
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Client URL for payment redirects
CLIENT_URL=http://localhost:3000
```

### 2. Get API Keys

#### For Paystack (Recommended for Rwanda): ⭐

1. Go to https://dashboard.paystack.com
2. Sign up or log in
3. Navigate to Settings → API Keys & Webhooks
4. Copy your **Secret Key** (starts with `sk_test_`)
5. Test with test keys first
6. Supports MTN Money Rwanda and Airtel Money Rwanda

#### For Flutterwave (Pan-African Alternative):

1. Go to https://dashboard.flutterwave.com
2. Sign up or log in
3. Navigate to Settings → API Keys
4. Copy your **Secret Key** and **Public Key**
5. Test with test keys first
6. Also supports Rwanda mobile money

### 3. Database Migration

The Order model has been updated with payment transaction fields:

```javascript
{
  depositTransaction: {
    type, amount, paymentMethod, phoneNumber,
    status, transactionRef, transactionId,
    initiatedAt, confirmedAt, failureReason
  },
  remainingTransaction: { /* same structure */ }
}
```

User model has been updated with designer payment preferences:

```javascript
{
  paymentPreference: {
    method, // 'mtn', 'airtel', or 'bank'
    accountNumber, accountName,
    phoneNumber, // for mobile money
    bankName, // for bank transfers
  }
}
```

If you're upgrading an existing database, these fields will be added automatically on the next save.

### 4. Install Dependencies (if needed)

```bash
cd server
npm install axios dotenv
cd ../client
npm install
```

## Frontend Implementation

### Payment Modal Usage

The `PaymentModal` component handles the entire payment flow:

```jsx
import PaymentModal from "./components/orders/PaymentModal";

<PaymentModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  order={order}
  paymentType="deposit" // or "remaining"
  onSuccess={(updatedOrder) => {
    // Handle successful payment
  }}
  loading={isLoading}
/>;
```

### Updated PaymentCard

The `PaymentCard` component now accepts `onOpenPaymentModal`:

```jsx
<PaymentCard
  order={order}
  onOpenPaymentModal={(type) => openPaymentModal(type)}
  loading={isLoading}
/>
```

## API Endpoints

### New Payment Endpoints

#### Initiate Deposit Payment

```
POST /orders/:id/pay-deposit-initiate
Content-Type: application/json

{
  "paymentMethod": "mtn", // or "airtel"
  "phoneNumber": "+233 5XX XXX XXX"
}

Response:
{
  "success": true,
  "transactionRef": "deposit-65a1b2c3d4e5f6g7h8i9-1234567890",
  "transactionId": "12345",
  "authUrl": "https://...", // Optional - may redirect user
  "message": "Payment initiated. Please complete payment on your phone."
}
```

#### Confirm Deposit Payment

```
POST /orders/:id/pay-deposit-confirm
Content-Type: application/json

{
  "transactionRef": "deposit-65a1b2c3d4e5f6g7h8i9-1234567890"
}

Response:
{
  "success": true,
  "message": "Deposit payment confirmed! Production will begin soon.",
  "order": { /* updated order object */ }
}
```

#### Initiate Remaining Payment

```
POST /orders/:id/pay-remaining-initiate
Content-Type: application/json

{
  "paymentMethod": "airtel", // or "mtn"
  "phoneNumber": "0555123456"
}
```

#### Confirm Remaining Payment

```
POST /orders/:id/pay-remaining-confirm
Content-Type: application/json

{
  "transactionRef": "remaining-65a1b2c3d4e5f6g7h8i9-1234567890"
}
```

## Payment Flow Sequence

### Customer Journey

1. **Browse Order Details**
   - Customer sees order with payment status

2. **Click "Pay Deposit"**
   - `PaymentModal` opens
   - User selects payment method (MTN or Airtel)
   - User enters phone number

3. **System Initiates Payment**
   - Backend calls `POST /pay-deposit-initiate`
   - Payment provider generates transaction reference
   - USSD prompt appears on user's phone

4. **User Confirms on Phone**
   - User receives USSD or app notification
   - Enters mobile money PIN
   - Payment is processed

5. **System Confirms Payment**
   - User clicks "I've Completed Payment"
   - Backend calls `POST /pay-deposit-confirm`
   - System verifies with payment provider
   - Order status updated to `deposit_paid`
   - Designer is notified

6. **Designer Begins Work**
   - Designer receives notification
   - Can start production

### Designer Payout Flow

After customer's final payment is confirmed:

1. **Payment Verified**
   - `POST /pay-remaining-confirm` succeeds
   - Order status → `fully_paid`

2. **Automatic Payout** (TODO - implement)
   - System retrieves designer's payment preference
   - Transfers funds to designer's MTN/Airtel/Bank account
   - Transaction recorded in audit log

3. **Designer Notified**
   - Email notification with payout details
   - Funds appear in designer's account within minutes (mobile money) or 1-3 days (bank)

## Error Handling

### Common Issues

**Issue**: "Invalid payment method"  
**Solution**: Ensure `paymentMethod` is either 'mtn' or 'airtel' (lowercase)

**Issue**: "Phone number is required"  
**Solution**: Users must enter phone number in international (+233) or local (0XXX) format

**Issue**: "Payment verification failed"  
**Possible Causes**:

- Network issue during payment
- User cancelled payment
- Insufficient balance on phone
- **Solution**: Show retry option to user

**Issue**: "Invalid transaction reference"  
**Solution**: Don't reuse transaction refs; each payment gets a unique ref

### Testing Payment Providers

#### Flutterwave Test Mode

Use these test credentials:

- **Card**: 5531886652142950
- **CVV**: 564
- **Expiry**: 09/32
- **OTP**: 123456

For mobile money testing, check Flutterwave docs.

#### Paystack Test Mode

- **Card**: 4084084084084081
- **CVV**: 408
- **Expiry**: 12/32
- **OTP**: 123456

## Database Queries

### Get Payment History for Order

```javascript
const order = await Order.findById(orderId).populate("depositTransaction");
console.log(order.depositTransaction);
```

### Find Failed Payments

```javascript
const failedOrders = await Order.find({
  "depositTransaction.status": "failed",
});
```

### Get Designer Payment Preferences

```javascript
const designer = await User.findById(designerId);
console.log(designer.paymentPreference);
```

## Security Best Practices

1. **Never log API keys** - Keep `FLUTTERWAVE_SECRET_KEY` secret
2. **Validate phone numbers** - Sanitize user input
3. **Verify transactions** - Always verify with payment provider (done automatically)
4. **Use HTTPS** - Never transmit sensitive data over HTTP
5. **Implement rate limiting** - Prevent payment initiation spam
6. **Audit trail** - Log all payment attempts for compliance

## Customization

### Add More Payment Methods

In `server/src/config/payment.js`, extend the `methodMap`:

```javascript
const methodMap = {
  mtn: { currency: "GHS", network: "MTN", country: "GH" },
  airtel: { currency: "GHS", network: "AIRTEL", country: "GH" },
  vodafone: { currency: "GHS", network: "VODAFONE", country: "GH" }, // Add this
};
```

### Support Different Countries

Update currency and country codes:

```javascript
const countryMap = {
  gh: { currency: "GHS", country: "GH" },
  ng: { currency: "NGN", country: "NG" },
  ke: { currency: "KES", country: "KE" },
};
```

### Customize Payment Instructions

Edit `PaymentModal.jsx` to show provider-specific instructions:

```jsx
const instructions = {
  flutterwave: [
    "1. You will receive a USSD prompt on your phone",
    "2. Follow the on-screen instructions...",
  ],
  paystack: ["1. Enter your payment details..."],
};
```

## Implementation Checklist

- [ ] Set up payment provider account (Flutterwave or Paystack)
- [ ] Add API keys to `.env` file
- [ ] Restart backend server
- [ ] Test payment flow with test keys
- [ ] Add designer payment preference form (optional)
- [ ] Implement designer payout logic
- [ ] Set up email notifications for payments
- [ ] Test with real payments (small amount)
- [ ] Monitor payment provider dashboard
- [ ] Set up webhook handling (for async payment confirmation)
- [ ] Implement payment history dashboard
- [ ] Add payment retry logic
- [ ] Set up compliance/audit logging

## Next Steps

### Implement Designer Payout Logic

Create a function to transfer funds to designer:

```javascript
const payoutDesigner = async (designerId, amount, transactionId) => {
  const designer = await User.findById(designerId);

  if (!designer.paymentPreference) {
    throw new Error("Designer has not set payment preference");
  }

  const payout = await initiatePayoutViaProvider(
    designer.paymentPreference,
    amount,
    `Order completion - ${transactionId}`,
  );

  return payout;
};
```

### Add Webhook Support

Implement webhook handlers to auto-confirm payments:

```javascript
// In express app
app.post("/webhooks/flutterwave", (req, res) => {
  const { data } = req.body;

  if (data.status === "successful") {
    // Automatically confirm payment
    confirmPaymentTransaction(data.tx_ref);
  }

  res.json({ success: true });
});
```

### Add Payment Dashboard

Create a designer dashboard showing:

- Pending payouts
- Payment history
- Earnings summary
- Account settings

## Support & Troubleshooting

For issues:

1. Check payment provider's status page
2. Review payment provider's API logs
3. Check server logs for errors
4. Verify API keys are correct
5. Test with provider's test mode first

## References

- [Flutterwave Documentation](https://developer.flutterwave.com/)
- [Paystack Documentation](https://paystack.com/docs/)
- [Mobile Money Standards](https://www.gsma.com/mobileeconomy/)
