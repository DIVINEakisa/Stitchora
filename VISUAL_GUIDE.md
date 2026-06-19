# Payment System - Visual Guide

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    STITCHORA PAYMENT SYSTEM                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌────────────────┐       ┌───────────┐
│   Customer   │────────▶│ Payment Modal  │──────▶│ Provider  │
│   (Browser)  │         │  (React)       │       │ Gateway   │
└──────────────┘         └────────────────┘       └───────────┘
       │                         │                       │
       │                         ▼                       │
       │                  ┌────────────────┐            │
       │                  │  Enter Phone   │            │
       │                  │  Select Method │            │
       │                  └────────────────┘            │
       │                         │                      │
       │                         ▼                      │
       │                  ┌────────────────┐            │
       │                  │  API Request   │            │
       │◀─────────────────│ /pay-*-initiate│◀───────────│
       │   Transaction ID │                │            │
       │                  └────────────────┘            │
       │
       ▼
  ┌─────────────────────┐
  │  Phone Receives     │
  │  USSD Prompt        │
  │  MTN/Airtel         │
  └─────────────────────┘
       │
       ▼
  ┌─────────────────────┐
  │  User Enters PIN    │
  │  Confirms Payment   │
  └─────────────────────┘
       │
       ▼
  ┌─────────────────────┐
  │  Click "I've        │
  │  Completed Payment" │
  └─────────────────────┘
       │
       ▼
  ┌─────────────────────┐      ┌──────────────┐
  │  API Request        │─────▶│ Verify with  │
  │  /pay-*-confirm     │      │ Provider     │
  └─────────────────────┘      └──────────────┘
       │                              │
       ◀──────────────────────────────┘
       │
       ▼
  ┌─────────────────────┐
  │  ✓ Payment          │
  │    Confirmed        │
  └─────────────────────┘
       │
       ▼
  ┌─────────────────────┐
  │  Order Status       │
  │  Updated            │
  └─────────────────────┘
```

## 💰 Payment Initiation Flow

```
                    PAYMENT INITIATED
                           │
                           ▼
        ┌──────────────────────────────────┐
        │  Create Transaction Record       │
        │  - transactionRef                │
        │  - amount                        │
        │  - paymentMethod                 │
        │  - status: "processing"          │
        └──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │  Call Payment Provider API       │
        │  (Flutterwave or Paystack)       │
        └──────────────────────────────────┘
                    │              │
         ┌──────────┴─────┬────────┴──────────┐
         │                │                   │
         ▼                ▼                   ▼
    ┌────────┐       ┌────────┐         ┌────────┐
    │Success │       │Pending │         │Failed  │
    └────────┘       └────────┘         └────────┘
         │                │                   │
         ▼                ▼                   ▼
   Send to User    USSD Prompt        Error Message
   Transaction ID  on Phone           Try Again
   Status         Awaiting PIN         Option
                  Confirmation
```

## 🔄 Complete Payment Sequence

```
STEP 1: USER INITIATES PAYMENT
┌──────────────────────────────────────────────┐
│ Customer clicks "Pay Deposit"                │
│ PaymentModal opens                           │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│ User selects payment method                  │
│ - MTN Mobile Money                           │
│ - Airtel Money                               │
│ - Enters phone number                        │
│ - Clicks "Continue"                          │
└──────────────────────────────────────────────┘


STEP 2: BACKEND INITIATES PAYMENT
┌──────────────────────────────────────────────┐
│ POST /orders/:id/pay-deposit-initiate        │
│ - Request: phone, method                     │
│ - Backend validates input                    │
│ - Calls payment provider API                 │
│ - Response: transactionId, transactionRef    │
└──────────────────────────────────────────────┘


STEP 3: USER RECEIVES PAYMENT PROMPT
┌──────────────────────────────────────────────┐
│ Customer's phone receives USSD prompt        │
│ MTN: Dial *170# or USSD menu                 │
│ Airtel: Dial *500# or USSD menu              │
│                                              │
│ Shows:                                       │
│ - Amount to pay                              │
│ - Confirm Y/N                                │
└──────────────────────────────────────────────┘


STEP 4: USER CONFIRMS PAYMENT
┌──────────────────────────────────────────────┐
│ User enters PIN                              │
│ Payment is processed by MTN/Airtel           │
│ User receives confirmation SMS               │
│ - Transaction successful                     │
│ - Balance updated                            │
└──────────────────────────────────────────────┘


STEP 5: USER CONFIRMS IN APP
┌──────────────────────────────────────────────┐
│ Modal shows:                                 │
│ "Payment Instructions"                       │
│ - You'll receive a USSD prompt               │
│ - Follow on-screen instructions              │
│ - Enter your PIN                             │
│ - You'll receive confirmation                │
│                                              │
│ Button: "I've Completed Payment"             │
└──────────────────────────────────────────────┘


STEP 6: BACKEND VERIFIES PAYMENT
┌──────────────────────────────────────────────┐
│ POST /orders/:id/pay-deposit-confirm         │
│ - Backend calls verifyPayment()              │
│ - Contacts payment provider API              │
│ - Gets payment status                        │
│                                              │
│ If successful:                               │
│ - Update order.paymentStatus                 │
│ - Set order.depositPaidAt                    │
│ - Change order.status → "deposit_paid"       │
│                                              │
│ If failed:                                   │
│ - Show error message                         │
│ - Allow user to retry                        │
└──────────────────────────────────────────────┘


STEP 7: ORDER STATUS UPDATED
┌──────────────────────────────────────────────┐
│ Database Update:                             │
│ {                                            │
│   _id: ObjectId(...),                        │
│   paymentStatus: "partially_paid",           │
│   status: "deposit_paid",                    │
│   depositPaidAt: Date.now(),                 │
│   depositTransaction: {                      │
│     status: "success",                       │
│     transactionRef: "deposit-xxx",           │
│     transactionId: "12345",                  │
│     confirmedAt: Date.now()                  │
│   }                                          │
│ }                                            │
└──────────────────────────────────────────────┘


STEP 8: SUCCESS & NOTIFICATIONS
┌──────────────────────────────────────────────┐
│ Customer sees: ✓ Deposit paid successfully   │
│                  Production will begin soon   │
│                                              │
│ Designer sees: New notification               │
│                Deposit received: GH₵XXX      │
│                Can start production           │
│                                              │
│ Order Timeline: Updates to show payment ✓    │
└──────────────────────────────────────────────┘
```

## 📊 Payment Status States

```
┌─────────────────────────────────────────────────────┐
│              PAYMENT STATUS WORKFLOW                │
└─────────────────────────────────────────────────────┘

PENDING (Initial state)
    │
    ├─ Customer initiates payment
    │
    ▼
PARTIALLY_PAID (After deposit)
    │
    ├─ Designer accepts and works
    ├─ Designer completes work
    │
    ▼
FULLY_PAID (After final payment)
    │
    ├─ Funds available to designer
    ├─ Payout to designer's account
    │
    └─ Order complete ✓


Order Status Timeline:
┌──────────┬──────────┬─────────────┬───────┬──────────┐
│requested │ reviewed │deposit_paid │ready  │delivered │
└──────────┴──────────┴─────────────┴───────┴──────────┘
              ▲            ▲         ▲
              │            │         │
         deposit      deposit    remaining
         initiated     paid       paid
```

## 🚀 Integration Points

```
Frontend (React)
├─ OrderDetail.jsx
│  ├─ Imports PaymentModal
│  └─ Manages payment state
│
├─ PaymentCard.jsx
│  ├─ Shows payment info
│  └─ Triggers modal open
│
└─ PaymentModal.jsx (NEW)
   ├─ Step 1: Method selection
   ├─ Step 2: Phone input
   └─ Step 3: Payment processing

Backend (Node.js/Express)
├─ routes/orders.js
│  ├─ POST /pay-deposit-initiate
│  ├─ POST /pay-deposit-confirm
│  ├─ POST /pay-remaining-initiate
│  └─ POST /pay-remaining-confirm
│
├─ config/payment.js (NEW)
│  ├─ initiatePayment()
│  └─ verifyPayment()
│
├─ models/Order.js
│  ├─ paymentTransactionSchema
│  └─ Payment tracking fields
│
└─ models/User.js
   └─ paymentPreferenceSchema

Payment Provider
├─ Flutterwave API
│  ├─ /charges (initiate)
│  └─ /transactions/verify (confirm)
│
└─ Paystack API
   ├─ /charge (initiate)
   └─ /transaction/verify (confirm)
```

## 💾 Database Schema Changes

```
Order Document
{
  _id: ObjectId,
  customer: ObjectId,
  designer: ObjectId,

  // Existing fields...
  status: String,
  totalPrice: Number,

  // NEW: Payment tracking
  ┌─────────────────────────────────────┐
  │ depositTransaction: {                │
  │   type: "deposit",                  │
  │   amount: 250,                      │
  │   paymentMethod: "mtn",             │
  │   phoneNumber: "+233XXXXXXXXX",     │
  │   status: "success",                │
  │   transactionRef: "deposit-xxx",    │
  │   transactionId: "12345",           │
  │   initiatedAt: ISODate,             │
  │   confirmedAt: ISODate              │
  │ }                                    │
  │                                      │
  │ remainingTransaction: { /* same */ } │
  └─────────────────────────────────────┘

  paymentStatus: "partially_paid",
  depositPaidAt: ISODate,
  finalPaidAt: ISODate
}

User Document (Designer)
{
  _id: ObjectId,
  name: String,
  email: String,
  role: "designer",

  // NEW: Payment preference
  ┌──────────────────────────────┐
  │ paymentPreference: {          │
  │   method: "mtn", // or bank   │
  │   accountNumber: "0555123456",│
  │   accountName: "John Doe",    │
  │   phoneNumber: "+233XXXXXXXX",│
  │   bankName: "GCB Bank"        │
  │ }                             │
  └──────────────────────────────┘
}
```

## 🔐 Security Flow

```
                    PAYMENT DATA FLOW
┌────────────────────────────────────────────────┐

1. FRONTEND (Browser)
   ┌──────────────────────┐
   │ Phone Number         │ ─┐
   │ Payment Method       │ ─┤─ ENCRYPTED (HTTPS)
   │ (sent to backend)    │ ─┘
   └──────────────────────┘

2. BACKEND (Node.js)
   ┌──────────────────────────────────┐
   │ ✓ Validates input                │
   │ ✓ Checks user is authorized      │
   │ ✓ Never logs sensitive data      │
   │ ✓ Only stores encrypted refs     │
   └──────────────────────────────────┘
         │
         ▼
   ┌──────────────────────────────────┐
   │ API KEY (in .env, NEVER exposed) │
   │ Calls Payment Provider API       │
   └──────────────────────────────────┘
         │
         ▼
   ┌──────────────────────────────────┐
   │ Payment Provider                 │
   │ (Handles sensitive data)         │
   │ ✓ Process payment                │
   │ ✓ Return only transactionId      │
   └──────────────────────────────────┘
         │
         ▼
3. DATABASE
   ┌──────────────────────────────────┐
   │ Store only:                      │
   │ - transactionRef (reference)     │
   │ - transactionId (opaque)         │
   │ - Amount (non-sensitive)         │
   │ - Status (non-sensitive)         │
   │ - Phone (already known to user)  │
   └──────────────────────────────────┘

✓ API keys NEVER exposed
✓ Payment details handled by provider
✓ Only transaction references stored
✓ All communication over HTTPS
```

## 📱 Mobile Money Provider Codes

```
MTN Mobile Money
├─ USSD: *170#
├─ Network Code: MTN
└─ Supported Countries: GH, NG, RW, UG, etc.

Airtel Money
├─ USSD: *500#
├─ Network Code: AIRTEL
└─ Supported Countries: GH, NG, TZ, etc.

Vodafone Cash (if implemented)
├─ USSD: *110#
├─ Network Code: VODAFONE
└─ Supported Countries: GH, etc.
```

---

This visual guide helps you understand the complete payment flow at a glance. For detailed implementation, see the documentation files in your project.
