import { useState } from "react";
import api from "../../api/axios";
import Modal from "../ui/Modal";
import Alert from "../ui/Alert";

export default function PaymentModal({
  isOpen,
  onClose,
  order,
  paymentType,
  onSuccess,
  loading: parentLoading,
}) {
  const [paymentMethod, setPaymentMethod] = useState("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("method"); // method, confirm, processing
  const [transactionRef, setTransactionRef] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const amount =
    paymentType === "deposit" ? order?.depositAmount : order?.remainingAmount;
  const endpoint =
    paymentType === "deposit"
      ? "pay-deposit-initiate"
      : "pay-remaining-initiate";
  const confirmEndpoint =
    paymentType === "deposit" ? "pay-deposit-confirm" : "pay-remaining-confirm";

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate phone number
      if (!phoneNumber || phoneNumber.length < 9) {
        throw new Error("Please enter a valid phone number");
      }

      const { data } = await api.post(`/orders/${order._id}/${endpoint}`, {
        paymentMethod,
        phoneNumber,
      });

      if (data.success) {
        setTransactionRef(data.transactionRef);
        setTransactionId(data.transactionId);
        setStep("processing");

        // If there's an auth URL, redirect user (for some payment providers)
        if (data.authUrl) {
          window.open(data.authUrl, "_blank");
        }
      } else {
        throw new Error(data.message || "Failed to initiate payment");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post(
        `/orders/${order._id}/${confirmEndpoint}`,
        {
          transactionRef,
        },
      );

      if (data.success) {
        onSuccess(data.order);
        handleClose();
      } else {
        throw new Error(data.message || "Failed to confirm payment");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setStep("processing"); // Stay on processing screen to retry
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber("");
    setPaymentMethod("mtn");
    setError("");
    setStep("method");
    setTransactionRef("");
    setTransactionId("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Complete Payment">
      <div className="space-y-4">
        {error && <Alert type="error" message={error} />}

        {step === "method" && (
          <form onSubmit={handleInitiatePayment} className="space-y-4">
            <div>
              <p className="mb-3 text-sm font-medium text-charcoal">
                Amount to Pay:{" "}
                <span className="text-lg font-bold text-primary">
                  {amount ? `GH₵${amount.toFixed(2)}` : "Loading..."}
                </span>
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Payment Method
              </label>
              <div className="space-y-2">
                {["mtn", "airtel"].map((method) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 cursor-pointer"
                    />
                    <span className="ml-3 cursor-pointer text-sm capitalize text-charcoal">
                      {method === "mtn" ? "MTN Mobile Money" : "Airtel Money"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-2 block text-sm font-medium text-charcoal"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., +233 5XX XXX XXX or 05XX XXX XXX"
                className="input-field"
                disabled={loading || parentLoading}
              />
              <p className="mt-1 text-xs text-charcoal/60">
                Include country code or use local format
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex-1"
                disabled={loading || parentLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-accent flex-1"
                disabled={loading || parentLoading || !phoneNumber}
              >
                {loading ? "Initiating..." : "Continue to Payment"}
              </button>
            </div>
          </form>
        )}

        {step === "processing" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
              <p className="mb-2 font-medium text-charcoal">
                Payment Instructions
              </p>
              <ol className="space-y-2 text-sm text-charcoal/70">
                <li>
                  1. You will receive a USSD prompt on your{" "}
                  {paymentMethod === "mtn" ? "MTN" : "Airtel"} phone
                </li>
                <li>
                  2. Follow the on-screen instructions to confirm the payment
                </li>
                <li>3. Enter your PIN when prompted</li>
                <li>
                  4. You'll receive a confirmation message once payment is
                  successful
                </li>
              </ol>
            </div>

            <div className="rounded-lg bg-charcoal/5 p-4">
              <p className="text-xs text-charcoal/60">
                Transaction ID: {transactionId}
              </p>
            </div>

            <Alert
              type="info"
              message="Payment confirmation can take a few seconds. Don't close this window until confirmed."
            />

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="btn-accent flex-1"
                disabled={loading}
              >
                {loading ? "Confirming..." : "I've Completed Payment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
