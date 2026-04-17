import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import OrderTimeline from '../components/orders/OrderTimeline';
import PaymentCard from '../components/orders/PaymentCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { STATUS_LABELS, formatCurrency } from '../utils/orderStatus';

export default function Chat() {
  const socket = useSocket();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [typing, setTyping] = useState('');
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => {
      const active = data.filter((o) => o.status !== 'rejected' && o.designer);
      setOrders(active);
      const paramId = searchParams.get('order');
      const initial = paramId ? active.find((o) => o._id === paramId) : active[0];
      if (initial) setSelectedOrder(initial);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedOrder) return;
    api.get(`/messages/order/${selectedOrder._id}`).then(({ data }) => setMessages(data));
    socket?.emit('join_order', selectedOrder._id);
    return () => socket?.emit('leave_order', selectedOrder._id);
  }, [selectedOrder?._id, socket]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (msg) => {
      if (msg.order === selectedOrder?._id || msg.order?._id === selectedOrder?._id || msg.order === selectedOrder?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    const onTyping = ({ name, isTyping }) => {
      setTyping(isTyping ? `${name} is typing...` : '');
    };
    socket.on('new_message', onMessage);
    socket.on('user_typing', onTyping);
    return () => {
      socket.off('new_message', onMessage);
      socket.off('user_typing', onTyping);
    };
  }, [socket, selectedOrder?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (imageUrl = '') => {
    if (!text.trim() && !imageUrl) return;
    socket?.emit(
      'send_message',
      { orderId: selectedOrder._id, content: text.trim(), imageUrl },
      (res) => {
        if (res?.message) setMessages((prev) => [...prev, res.message]);
      }
    );
    setText('');
    socket?.emit('typing', { orderId: selectedOrder._id, isTyping: false });
  };

  const handleImageShare = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      sendMessage(data.url);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-7xl flex-col px-4 py-4 sm:px-6 lg:flex-row lg:gap-6 lg:px-8">
      <aside className="mb-4 w-full shrink-0 overflow-hidden rounded-2xl bg-card shadow-card lg:mb-0 lg:w-72">
        <h2 className="border-b border-primary/10 px-4 py-3 font-display font-semibold text-primary">Active Orders</h2>
        <ul className="max-h-48 overflow-y-auto lg:max-h-[calc(100vh-140px)]">
          {orders.map((o) => (
            <li key={o._id}>
              <button
                type="button"
                onClick={() => setSelectedOrder(o)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                  selectedOrder?._id === o._id ? 'bg-primary/10' : 'hover:bg-white/50'
                }`}
              >
                <img src={o.designImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">#{o._id.slice(-6)}</p>
                  <p className="text-xs text-charcoal/50">{STATUS_LABELS[o.status]}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
        {orders.length === 0 && (
          <p className="p-4 text-sm text-charcoal/50">No active orders with assigned designers</p>
        )}
      </aside>

      <main className="flex min-h-0 flex-1 flex-col rounded-2xl bg-white shadow-card lg:flex-row">
        {!selectedOrder ? (
          <div className="flex flex-1 items-center justify-center text-charcoal/50">
            Select an order to start chatting
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col">
              <header className="border-b border-primary/10 px-4 py-3">
                <h3 className="font-display font-semibold text-primary">
                  Chat — Order #{selectedOrder._id.slice(-6)}
                </h3>
                <p className="text-xs text-charcoal/50">
                  {user?.role === 'customer'
                    ? `Designer: ${selectedOrder.designer?.name}`
                    : `Customer: ${selectedOrder.customer?.name}`}
                </p>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMine ? 'bg-primary text-white' : 'bg-card text-charcoal'
                        }`}
                      >
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="Shared" className="mb-2 max-h-48 rounded-lg" />
                        )}
                        {msg.content && <p className="text-sm">{msg.content}</p>}
                        <p className={`mt-1 text-xs ${isMine ? 'text-white/60' : 'text-charcoal/40'}`}>
                          {format(new Date(msg.createdAt), 'p')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {typing && <p className="px-4 text-xs text-charcoal/40">{typing}</p>}

              <footer className="border-t border-primary/10 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      socket?.emit('typing', { orderId: selectedOrder._id, isTyping: !!e.target.value });
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageShare(e.target.files[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="btn-outline px-3"
                    title="Share image"
                  >
                    📷
                  </button>
                  <button type="button" onClick={() => sendMessage()} className="btn-primary px-4">
                    Send
                  </button>
                </div>
              </footer>
            </div>

            <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-primary/10 p-4 xl:flex">
              <div className="card-surface !p-4">
                <img src={selectedOrder.designImage} alt="" className="h-24 w-full rounded-lg object-cover" />
                <p className="mt-2 text-sm font-medium">{STATUS_LABELS[selectedOrder.status]}</p>
                {selectedOrder.totalPrice > 0 && (
                  <p className="text-sm text-charcoal/60">{formatCurrency(selectedOrder.totalPrice)}</p>
                )}
              </div>
              <OrderTimeline status={selectedOrder.status} />
              {selectedOrder.totalPrice > 0 && (
                <PaymentCard order={selectedOrder} />
              )}
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
