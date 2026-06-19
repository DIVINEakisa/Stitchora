// Payment Provider Configuration
// This uses Flutterwave for mobile money integration (MTN and Airtel)
// Alternative providers: Paystack, Mtn Mobile Money, Airtel Money APIs

import axios from "axios";

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || "flutterwave";
const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLW_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initialize payment clients based on provider
const flutterwave = axios.create({
  baseURL: "https://api.flutterwave.com/v3",
  headers: {
    Authorization: `Bearer ${FLW_SECRET_KEY}`,
  },
});

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
  },
});

export const initiatePayment = async (paymentData) => {
  const { amount, email, phoneNumber, paymentMethod, orderRef, customerName } =
    paymentData;

  try {
    if (PAYMENT_PROVIDER === "flutterwave") {
      return await initiateFlutterwavePayment({
        amount,
        email,
        phoneNumber,
        paymentMethod,
        orderRef,
        customerName,
      });
    } else if (PAYMENT_PROVIDER === "paystack") {
      return await initiatePaystackPayment({
        amount,
        email,
        phoneNumber,
        paymentMethod,
        orderRef,
        customerName,
      });
    }
  } catch (err) {
    console.error("Payment initiation error:", err);
    throw new Error(`Payment initiation failed: ${err.message}`);
  }
};

// Flutterwave Mobile Money Payment
const initiateFlutterwavePayment = async (data) => {
  const { amount, email, phoneNumber, paymentMethod, orderRef, customerName } =
    data;

  // Map payment method to Flutterwave currency and network (Rwanda)
  const methodMap = {
    mtn: { currency: "RWF", network: "MTN", country: "RW" },
    airtel: { currency: "RWF", network: "AIRTEL", country: "RW" },
  };

  const method = methodMap[paymentMethod.toLowerCase()];
  if (!method) {
    throw new Error(`Unsupported payment method: ${paymentMethod}`);
  }

  try {
    const response = await flutterwave.post("/charges", {
      type: "mobile_money",
      amount,
      currency: method.currency,
      email,
      phone_number: phoneNumber,
      fullname: customerName,
      tx_ref: orderRef, // Unique transaction reference
      network: method.network,
      country: method.country,
      redirect_url: `${process.env.CLIENT_URL}/payment-confirm`,
    });

    return {
      success: true,
      provider: "flutterwave",
      transactionId: response.data.data.id,
      transactionRef: response.data.data.tx_ref,
      authUrl: response.data.data.meta?.authorization?.redirect || null,
      status: response.data.data.status,
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Flutterwave payment failed",
    );
  }
};

// Paystack Mobile Money Payment
const initiatePaystackPayment = async (data) => {
  const { amount, email, phoneNumber, paymentMethod, orderRef, customerName } =
    data;

  try {
    const response = await paystack.post("/charge", {
      email,
      amount: Math.round(amount * 100), // Paystack uses cents
      metadata: {
        phone_number: phoneNumber,
        payment_method: paymentMethod,
        order_ref: orderRef,
        customer_name: customerName,
      },
      mobile_money: {
        phone: phoneNumber,
        provider: paymentMethod.toUpperCase(), // MTN or AIRTEL
      },
    });

    return {
      success: true,
      provider: "paystack",
      transactionId: response.data.data.id,
      transactionRef: response.data.data.reference,
      authUrl: response.data.data.authorization_url || null,
      status: response.data.data.status,
    };
  } catch (err) {
    throw new Error(err.response?.data?.message || "Paystack payment failed");
  }
};

// Verify payment status
export const verifyPayment = async (transactionRef) => {
  try {
    if (PAYMENT_PROVIDER === "flutterwave") {
      const response = await flutterwave.get(
        `/transactions/verify_by_reference?tx_ref=${transactionRef}`,
      );
      const txn = response.data.data;
      return {
        success: true,
        provider: "flutterwave",
        status: txn.status,
        amount: txn.amount,
        transactionId: txn.id,
        isSuccessful: txn.status === "successful",
      };
    } else if (PAYMENT_PROVIDER === "paystack") {
      const response = await paystack.get(
        `/transaction/verify/${transactionRef}`,
      );
      const txn = response.data.data;
      return {
        success: true,
        provider: "paystack",
        status: txn.status,
        amount: txn.amount / 100, // Convert back to main currency
        transactionId: txn.id,
        isSuccessful: txn.status === "success",
      };
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    throw new Error(`Payment verification failed: ${err.message}`);
  }
};

export { PAYMENT_PROVIDER, FLW_PUBLIC_KEY };
