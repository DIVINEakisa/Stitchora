import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import OrderTimeline from "../components/orders/OrderTimeline";
import PaymentCard from "../components/orders/PaymentCard";
import PaymentModal from "../components/orders/PaymentModal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";
import { STATUS_LABELS } from "../utils/orderStatus";
import { getImageUrl } from "../utils/imageUrl";

export default function OrderDetail() {
  const { id } = useParams();
  const { user, isCustomer } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState(null);

  const fetchOrder = () => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleOpenPaymentModal = (type) => {
    setPaymentType(type);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (updatedOrder) => {
    setOrder(updatedOrder);
    setPaymentModalOpen(false);
    const msg =
      paymentType === "deposit"
        ? "Deposit paid successfully! Production will begin soon."
        : "Final payment complete! Your order will be delivered soon.";
    setMessage(msg);
  };

  const markDelivered = async () => {
    try {
      const { data } = await api.post(`/orders/${id}/mark-delivered`);
      setOrder(data);
      setMessage("Order marked as delivered. Thank you!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update");
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p>Order not found</p>
        <Link to="/dashboard" className="btn-primary mt-4 inline-flex">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to={user?.role === "designer" ? "/designer" : "/dashboard"}
        className="text-sm text-primary hover:underline"
      >
        ← Back
      </Link>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="card-surface">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <img
                src={getImageUrl(order.designImage)}
                alt="Design"
                className="h-48 w-48 rounded-xl object-cover"
              />
              <div>
                <h1 className="font-display text-2xl font-bold text-primary">
                  Order #{order._id.slice(-6)}
                </h1>
                <p className="mt-1 text-sm text-charcoal/60">
                  Status:{" "}
                  <span className="font-medium text-primary">
                    {STATUS_LABELS[order.status]}
                  </span>
                </p>
                {order.designer && (
                  <p className="mt-2 text-sm">
                    Designer: {order.designer.name}
                  </p>
                )}
                {order.estimatedCompletionDate && (
                  <p className="text-sm text-charcoal/60">
                    Est. completion:{" "}
                    {format(new Date(order.estimatedCompletionDate), "PPP")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {message && (
            <Alert
              type="success"
              message={message}
              onClose={() => setMessage("")}
            />
          )}

          {order.status === "rejected" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h3 className="font-semibold text-red-800">Order Rejected</h3>
              <p className="mt-2 text-sm text-red-700">{order.rejectReason}</p>
              {order.rejectSuggestions && (
                <p className="mt-2 text-sm text-red-600">
                  Suggestions: {order.rejectSuggestions}
                </p>
              )}
            </div>
          )}

          <div className="card-surface">
            <h2 className="font-display text-lg font-semibold text-primary">
              Order Timeline
            </h2>
            <div className="mt-6">
              <OrderTimeline status={order.status} />
            </div>
          </div>

          <div className="card-surface">
            <h2 className="font-display text-lg font-semibold text-primary">
              Measurements
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {order.measurements &&
                Object.entries(order.measurements).map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-white px-3 py-2">
                    <dt className="text-xs capitalize text-charcoal/50">{k}</dt>
                    <dd className="font-medium">{v}&quot;</dd>
                  </div>
                ))}
            </dl>
          </div>

          <Link
            to={`/chat?order=${order._id}`}
            className="btn-outline inline-flex"
          >
            Open Chat
          </Link>
        </div>

        <div className="w-full space-y-6 lg:max-w-sm">
          {order.totalPrice > 0 && (
            <PaymentCard
              order={order}
              onOpenPaymentModal={
                isCustomer ? handleOpenPaymentModal : undefined
              }
              loading={payLoading}
            />
          )}

          {isCustomer &&
            order.paymentStatus === "fully_paid" &&
            order.status !== "delivered" && (
              <button
                type="button"
                onClick={markDelivered}
                className="btn-primary w-full"
              >
                Confirm Delivery
              </button>
            )}
        </div>
      </div>

      {order && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          order={order}
          paymentType={paymentType}
          onSuccess={handlePaymentSuccess}
          loading={payLoading}
        />
      )}
    </div>
  );
}
