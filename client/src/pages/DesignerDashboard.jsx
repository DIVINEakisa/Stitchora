import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';
import { STATUS_LABELS } from '../utils/orderStatus';

export default function DesignerDashboard() {
  const [incoming, setIncoming] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSuggestions, setRejectSuggestions] = useState('');
  const [acceptModal, setAcceptModal] = useState(null);
  const [totalPrice, setTotalPrice] = useState('500');
  const [estDate, setEstDate] = useState('');
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [inc, mine] = await Promise.all([
        api.get('/orders/incoming'),
        api.get('/orders/my'),
      ]);
      setIncoming(inc.data);
      setMyOrders(mine.data.filter((o) => o.status !== 'requested'));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAccept = async () => {
    if (!acceptModal) return;
    setActionLoading(true);
    try {
      await api.patch(`/orders/${acceptModal._id}/accept`, {
        totalPrice: parseFloat(totalPrice),
        estimatedCompletionDate: estDate || undefined,
      });
      setMessage('Order accepted');
      setAcceptModal(null);
      fetchAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to accept');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      await api.patch(`/orders/${rejectModal._id}/reject`, {
        rejectReason,
        rejectSuggestions,
      });
      setMessage('Order rejected');
      setRejectModal(null);
      setRejectReason('');
      setRejectSuggestions('');
      fetchAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusModal || !newStatus) return;
    setActionLoading(true);
    try {
      await api.patch(`/orders/${statusModal._id}/status`, {
        status: newStatus,
        estimatedCompletionDate: estDate || undefined,
      });
      setMessage('Status updated');
      setStatusModal(null);
      fetchAll();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  const statusOptions = ['reviewed', 'deposit_paid', 'in_production', 'ready', 'delivered'];

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-primary">Designer Dashboard</h1>
      <p className="mt-1 text-charcoal/60">Manage incoming requests and active orders</p>

      {message && <Alert type="success" message={message} className="mt-4" onClose={() => setMessage('')} />}

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-primary">Incoming Requests</h2>
        {incoming.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal/50">No pending requests</p>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {incoming.map((order) => (
              <div key={order._id} className="card-surface flex flex-col gap-4 sm:flex-row">
                <img src={order.designImage} alt="" className="h-32 w-32 shrink-0 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{order.customer?.name}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-1 text-xs text-charcoal/60">
                    {order.measurements &&
                      Object.entries(order.measurements).map(([k, v]) => (
                        <div key={k}>
                          <span className="capitalize">{k}</span>: {v}&quot;
                        </div>
                      ))}
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAcceptModal(order)}
                      className="btn-accent py-2 text-sm"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectModal(order)}
                      className="btn-outline py-2 text-sm"
                    >
                      Reject
                    </button>
                    <Link to={`/orders/${order._id}`} className="btn-outline py-2 text-sm">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold text-primary">Active Orders</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-primary/10 text-charcoal/50">
                <th className="pb-3 pr-4">Design</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map((order) => (
                <tr key={order._id} className="border-b border-primary/5">
                  <td className="py-4 pr-4">
                    <img src={order.designImage} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  </td>
                  <td className="py-4 pr-4">{order.customer?.name}</td>
                  <td className="py-4 pr-4">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStatusModal(order);
                          setNewStatus(order.status);
                        }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Update Status
                      </button>
                      <Link to={`/chat?order=${order._id}`} className="text-xs font-medium text-accent hover:underline">
                        Chat
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={!!acceptModal} onClose={() => setAcceptModal(null)} title="Accept Order">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Total Price ($)</label>
            <input
              type="number"
              className="input-field mt-1"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Estimated Completion</label>
            <input type="date" className="input-field mt-1" value={estDate} onChange={(e) => setEstDate(e.target.value)} />
          </div>
          <button type="button" onClick={handleAccept} disabled={actionLoading} className="btn-accent w-full">
            {actionLoading ? 'Accepting...' : 'Accept & Set Price'}
          </button>
        </div>
      </Modal>

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Order">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Reason</label>
            <textarea
              required
              rows={3}
              className="input-field mt-1"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this order cannot be fulfilled..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Suggestions (optional)</label>
            <textarea
              rows={2}
              className="input-field mt-1"
              value={rejectSuggestions}
              onChange={(e) => setRejectSuggestions(e.target.value)}
              placeholder="Alternative ideas for the customer..."
            />
          </div>
          <button type="button" onClick={handleReject} disabled={actionLoading || !rejectReason} className="btn-outline w-full border-red-300 text-red-700">
            {actionLoading ? 'Rejecting...' : 'Reject Order'}
          </button>
        </div>
      </Modal>

      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title="Update Order Status">
        <div className="space-y-4">
          <select className="input-field" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <div>
            <label className="text-sm font-medium">Estimated Completion (optional)</label>
            <input type="date" className="input-field mt-1" value={estDate} onChange={(e) => setEstDate(e.target.value)} />
          </div>
          <button type="button" onClick={handleStatusUpdate} disabled={actionLoading} className="btn-primary w-full">
            {actionLoading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
