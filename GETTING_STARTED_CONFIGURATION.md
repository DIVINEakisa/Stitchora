# Getting Started - Configuration Steps

## Before You Start

Make sure you have:

- ✅ Node.js installed
- ✅ MongoDB running
- ✅ Your project running locally
- ✅ 10 minutes to set up payment provider

## Step 1: Choose Your Payment Provider

### Option A: Paystack (⭐ RECOMMENDED FOR RWANDA)

**Best for**: Rwanda, Nigeria, Kenya, Ghana, South Africa - excellent MTN Money & Airtel Money support

1. Go to https://dashboard.paystack.com/signup
2. Enter your email and create password
3. Complete verification
4. Go to Settings → API Keys & Webhooks
5. Copy your **Secret Key** (starts with `sk_test_` for testing)

### Option B: Flutterwave (Pan-African Alternative)

**Best for**: Multiple African countries

1. Go to https://dashboard.flutterwave.com/signup
2. Enter your email and create password
3. Complete verification
4. Go to Settings → API Keys
5. Copy your **Secret Key** and **Public Key**

## Step 2: Configure Environment

### For Windows (PowerShell)

1. Open PowerShell in your project's `server` folder
2. Create `.env` file:

```powershell
# Create new .env file
New-Item -Path ".env" -ItemType File

# Open in editor
notepad .env
```

3. Add this content (replace with your actual keys):

```env
# Payment Provider Configuration (Rwanda)
PAYMENT_PROVIDER=paystack
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
CLIENT_URL=http://localhost:3000

# Or use Flutterwave:
# PAYMENT_PROVIDER=flutterwave
# FLUTTERWAVE_SECRET_KEY=sk_test_your_actual_secret_key_here
# FLUTTERWAVE_PUBLIC_KEY=pk_test_your_actual_public_key_here
```

4. Save and close (Ctrl+S, then close window)

### Verify Configuration

In PowerShell, run:

```powershell
# Check if .env file exists
Test-Path .env

# View the file content
Get-Content .env
```

You should see your configuration.

## Step 3: Restart Your Backend Server

In PowerShell:

```powershell
# Stop current server (Ctrl+C if running)
# Then restart it
npm run dev
```

You should see:

```
Server running on port 3000
Payment provider: flutterwave
```

## Step 4: Test the Payment Flow

1. **Open your app** in browser:
   - Navigate to `http://localhost:3000`
   - Go to your dashboard
   - Click on any order

2. **Try the payment flow**:
   - Click "Pay Deposit" or "Pay Remaining"
   - Payment modal should open
   - Select "MTN Mobile Money"
   - Enter a test phone number: `0543210987`
   - Click "Continue to Payment"

3. **Expected result**:
   - You should see "Payment initiated"
   - Modal shows payment instructions
   - If using Flutterwave, you might see a redirect

## Step 5: Verify Payment Works

After completing test payment:

- [ ] Modal shows transaction ID
- [ ] No error messages appear
- [ ] Backend logs show no errors
- [ ] Order status updates

If you see errors, check the Backend terminal for messages.

## Common Setup Issues

### ❌ Error: "Cannot find module axios"

**Solution**:

```powershell
cd server
npm install axios dotenv
npm run dev
```

### ❌ Error: "FLUTTERWAVE_SECRET_KEY is undefined"

**Solution**:

1. Check `.env` file exists in `server/` folder
2. Verify you copied keys correctly (no spaces)
3. Restart server: `npm run dev`

### ❌ Error: "Invalid API key"

**Solution**:

1. Go back to payment provider dashboard
2. Copy the **Secret Key** again (check for typos)
3. Make sure it starts with `sk_test_` or `sk_live_`
4. Update `.env` and restart server

### ❌ Modal doesn't open when clicking "Pay Deposit"

**Solution**:

1. Check browser console for JavaScript errors
2. Check backend logs for errors
3. Ensure files were created:
   - `server/src/config/payment.js`
   - `client/src/components/orders/PaymentModal.jsx`
4. Restart both frontend and backend

## Troubleshooting Checklist

Run through this if payment doesn't work:

```
□ .env file exists in server/ folder
□ API keys are correct (no typos)
□ Payment provider account is created
□ PAYMENT_PROVIDER is set correctly
□ Backend server is running
□ Frontend is running
□ Browser shows no JavaScript errors
□ Backend terminal shows no errors
□ Used test API keys (not production keys)
```

## Next: Test Different Scenarios

### Scenario 1: Successful Payment ✅

```
Phone: 0543210987
Method: MTN
Expected: Payment initiates and can be confirmed
```

### Scenario 2: Invalid Phone ❌

```
Phone: 123
Method: MTN
Expected: Error message "Please enter a valid phone number"
```

### Scenario 3: Different Method

```
Phone: 0543210987
Method: Airtel
Expected: Works same as MTN
```

## Production Deployment

When you're ready for real payments:

1. **Get production API keys** from payment provider
2. **Update `.env`**:
   ```env
   PAYMENT_PROVIDER=flutterwave
   FLUTTERWAVE_SECRET_KEY=sk_live_your_production_key
   CLIENT_URL=https://yourdomain.com
   ```
3. **Test with small amount** ($0.50 or GH₵5)
4. **Monitor payment provider dashboard**
5. **Enable webhook handling** for automatic confirmations

## Documentation Reference

- **Quick overview**: See `PAYMENT_QUICK_START.md`
- **Complete guide**: See `PAYMENT_SYSTEM_GUIDE.md`
- **Designer payouts**: See `DESIGNER_PAYOUT_GUIDE.md`
- **Implementation details**: See `PAYMENT_IMPLEMENTATION_SUMMARY.md`

## Get Help

If you get stuck:

1. **Check payment provider status**:
   - Flutterwave: https://status.flutterwave.com/
   - Paystack: https://status.paystack.com/

2. **Review server logs**:
   - Look at terminal output when `npm run dev` is running
   - Errors will be printed there

3. **Test payment provider connectivity**:

   ```powershell
   # In PowerShell, test if you can reach the provider
   Invoke-WebRequest -Uri "https://api.flutterwave.com/v3/charges" -Headers @{Authorization = "Bearer your_key"}
   ```

4. **Contact payment provider support**:
   - They have developer support channels

## What's Next After Setup?

Once payments work:

1. **Add designer payouts** (see `DESIGNER_PAYOUT_GUIDE.md`)
2. **Send email notifications** when payments complete
3. **Create payment dashboard** for designers to see earnings
4. **Add payment history** for customers
5. **Set up webhooks** for automatic payment verification
6. **Monitor transactions** in payment provider dashboard

## Success! 🎉

Once you see:

- Payment modal opens ✅
- Payment initiates ✅
- Order status updates ✅
- No error messages ✅

**You have successfully implemented real mobile money payments!**

Now you can:

- Collect real payments from customers
- Track transaction history
- Pay designers automatically
- Handle refunds and disputes

---

**Need help?** The payment provider's documentation is your best resource:

- **Flutterwave**: https://developer.flutterwave.com/docs/
- **Paystack**: https://paystack.com/docs/api/

Good luck! 🚀
