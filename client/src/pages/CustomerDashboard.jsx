import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { STATUS_LABELS } from "../utils/orderStatus";
import { getImageUrl } from "../utils/imageUrl";
import { format } from "date-fns";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/my")
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">
            My Orders
          </h1>
          <p className="mt-1 text-charcoal/60">
            Track and manage your custom tailoring requests
          </p>
        </div>
        <Link to="/orders/new" className="btn-accent shrink-0">
          + New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="card-surface mt-12 text-center">
          <p className="text-charcoal/60">
            No orders yet. Start your first custom design!
          </p>
          <Link to="/orders/new" className="btn-primary mt-6 inline-flex">
            Create Order
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card-surface overflow-hidden p-0 transition hover:shadow-soft"
            >
              <img
                src={getImageUrl(order.designImage)}
                alt="Design"
                className="h-40 w-full object-cover"
              />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="text-xs text-charcoal/40">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                {order.designer && (
                  <p className="mt-3 text-sm text-charcoal/60">
                    Designer:{" "}
                    <span className="font-medium text-primary">
                      {order.designer.name}
                    </span>
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
