# Payment System - Quick Start Guide

## 5-Minute Setup

### Step 1: Choose Payment Provider

```bash
# Option A: Paystack (⭐ RECOMMENDED FOR RWANDA)
# Sign up: https://dashboard.paystack.com
# Best for: MTN Money Rwanda, Airtel Money Rwanda
# Coverage: Rwanda, Nigeria, Kenya, Ghana, South Africa

# Option B: Flutterwave (Alternative for Pan-African)
# Sign up: https://dashboard.flutterwave.com
# Best for: Multiple African countries
```

### Step 2: Get API Keys

1. Go to your chosen provider's dashboard
2. Navigate to API Keys or Settings
3. Copy your **Secret Key** (keep it private!)
4. Copy your **Public Key** (for frontend)

### Step 3: Configure Environment

Create `.env` in `server/` directory:

```env
# For Rwanda (Recommended)
PAYMENT_PROVIDER=paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxx
CLIENT_URL=http://localhost:3000

# Or if using Flutterwave:
# PAYMENT_PROVIDER=flutterwave
# FLUTTERWAVE_SECRET_KEY=sk_test_xxxxxxxxxxxx
# FLUTTERWAVE_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
```

### Step 4: Start Server

```bash
cd server
npm install  # if needed
npm run dev
```

### Step 5: Test Payment Flow

1. Navigate to an order detail page
2. Click "Pay Deposit"
3. Select payment method (MTN or Airtel)
4. Enter test phone number
5. Follow USSD prompt on phone (use test credentials)
6. Confirm payment

## What Changed?

### Old Flow ❌

```
Click "Pay Deposit" → Order immediately marked as paid ❌
```

### New Flow ✅

```
Click "Pay Deposit"
  ↓
Enter phone number & payment method
  ↓
USSD prompt appears on phone
  ↓
User confirms on phone
  ↓
System verifies with payment provider
  ↓
Order marked as paid ✓
  ↓
Designer gets payout ✓
```

## Files Changed

### Backend

- `server/src/routes/orders.js` - Updated payment endpoints
- `server/src/models/Order.js` - Added payment transaction tracking
- `server/src/models/User.js` - Added designer payment preferences
- `server/src/config/payment.js` - **NEW** Payment provider integration

### Frontend

- `client/src/pages/OrderDetail.jsx` - Updated to use PaymentModal
- `client/src/components/orders/PaymentCard.jsx` - Updated button flow
- `client/src/components/orders/PaymentModal.jsx` - **NEW** Payment UI

## API Endpoints Changed

### Old Endpoints (Deprecated but still exist)

```
POST /orders/:id/pay-deposit → Returns error
POST /orders/:id/pay-remaining → Returns error
```

### New Endpoints

```
POST /orders/:id/pay-deposit-initiate
POST /orders/:id/pay-deposit-confirm
POST /orders/:id/pay-remaining-initiate
POST /orders/:id/pay-remaining-confirm
```

## Testing Checklist

- [ ] API keys configured in `.env`
- [ ] Backend server running
- [ ] Frontend running
- [ ] Can open order detail page
- [ ] "Pay Deposit" button opens payment modal
- [ ] Can select payment method
- [ ] Can enter phone number
- [ ] Modal shows payment processing state
- [ ] Can click "I've Completed Payment"
- [ ] Payment confirms successfully
- [ ] Order status updates to `deposit_paid`

## Common First-Time Issues

### "Cannot find module config/payment"

- Make sure `server/src/config/payment.js` file was created
- Restart backend server

### "Invalid API key"

- Check `.env` file spelling
- Verify API key is correct in payment provider dashboard
- Make sure it's the **Secret Key**, not Public Key

### "Cannot initiate payment"

- Check server logs for detailed error
- Verify `PAYMENT_PROVIDER` is set correctly
- Ensure API keys are for the correct provider

### "Phone number validation failed"

- Phone number must be 9+ digits
- Can use international format: +233XXXXXXXXX
- Or local format: 0XXXXXXXXX

## Next Steps

1. **Test with real payments** (use small amounts)
2. **Set up designer payment preferences** form
3. **Implement designer payouts** (see DESIGNER_PAYOUT_GUIDE.md)
4. **Add email notifications** for successful payments
5. **Create payment history dashboard**
6. **Set up webhook handlers** for automatic payment confirmation

## Documentation

- **Full Setup**: See `PAYMENT_SYSTEM_GUIDE.md`
- **Designer Payouts**: See `DESIGNER_PAYOUT_GUIDE.md`
- **Provider Docs**:
  - Flutterwave: https://developer.flutterwave.com/
  - Paystack: https://paystack.com/docs/

## Get Help

1. Check payment provider's status page
2. Review server logs: `npm run dev` output
3. Test with provider's test mode first
4. Contact payment provider support

## Payment Test Credentials

### Flutterwave

- **Phone**: +234 8100000000 (dummy)
- **OTP**: 123456
- **Network**: MTN/Airtel depends on account region

### Paystack

- **Card**: 4084084084084081
- **CVV**: 408
- **Expiry**: 12/32
- **OTP**: 123456
- **Phone**: 07033332020 (for mobile money)

## Troubleshooting

### Payment not confirming?

1. Wait 10-15 seconds (provider processing time)
2. Check server logs for errors
3. Try clicking "I've Completed Payment" again
4. Restart backend and retry

### Order not updating after payment?

1. Check database connection
2. Verify order ID is correct
3. Look for error messages in modal
4. Check backend logs

### Designer not getting paid?

1. Designer must set payment preference first
2. Check `designerPayoutError` in order record
3. Verify designer's account information
4. Contact payment provider support

## Success Indicators

✅ Payment modal appears when clicking pay button  
✅ USSD prompt shown on phone  
✅ Payment can be confirmed  
✅ Order status changes to `deposit_paid`  
✅ Designer can see order is paid  
✅ Payment history recorded in database

---

**Ready?** Start with Step 1 above and you'll have real mobile money payments working in minutes! 🚀
