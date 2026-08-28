import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, ShoppingBag, Loader2, ArrowLeft } from 'lucide-react';
import { Order } from '../types';
import { formatINR } from '../utils';
import confetti from 'canvas-confetti';

interface ResumedCheckoutViewProps {
  orderId: string;
  token?: string;
  onBackToStore: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const ResumedCheckoutView: React.FC<ResumedCheckoutViewProps> = ({
  orderId,
  token,
  onBackToStore,
  onOrderCompleted,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    async function loadResumedOrder() {
      setLoading(true);
      try {
        const query = token ? `?token=${encodeURIComponent(token)}` : '';
        const res = await fetch(`/api/checkout/resume/${orderId}${query}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to retrieve order session.');
        }
        setOrder(data.order);
      } catch (err: any) {
        setError(err.message || 'Unable to load recovered order.');
      } finally {
        setLoading(false);
      }
    }
    loadResumedOrder();
  }, [orderId, token]);

  const handleCompleteResumedPayment = async () => {
    if (!order) return;
    setIsPaying(true);
    try {
      const res = await fetch('/api/checkout/complete-resumed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod: paymentMethod === 'card' ? 'UPI / Visa •••• 8821' : 'Net Banking',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete payment.');
      }

      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      onOrderCompleted(data.order);
    } catch (err: any) {
      alert(err.message || 'Payment completion failed');
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
        <p className="text-slate-700 font-semibold text-sm">
          Autonomous Agent: Verifying order session & restoring cart...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-bold">
          !
        </div>
        <h2 className="text-slate-900 font-bold text-base">Session Link Expired</h2>
        <p className="text-xs text-slate-500">{error || 'Order could not be loaded.'}</p>
        <button
          onClick={onBackToStore}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Return to Demo Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-emerald-950">
              Recovered Checkout Session • Cart Successfully Restored
            </h2>
            <span className="text-[10px] font-bold uppercase bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">
              Active
            </span>
          </div>
          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
            Welcome back, <strong>{order.customer?.name}</strong>! The autonomous AI agent has unlocked your previous failed checkout ({order.id}) and securely restored your reserved items.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Saved Items */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-700" />
              <span>Restored Items ({order.items.reduce((a, b) => a + b.quantity, 0)})</span>
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-500">#{order.id}</span>
          </div>

          <div className="divide-y divide-slate-100 space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    {formatINR(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Customer delivery reminder */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1 mt-4">
            <div className="font-semibold text-slate-700">Delivery Address:</div>
            <div className="text-slate-600">
              {order.customer?.name} • {order.customer?.address}, {order.customer?.city}
            </div>
            <div className="text-[11px] text-slate-400">Email: {order.customer?.email}</div>
          </div>
        </div>

        {/* Right: Payment Completion */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Summary & Payment</h3>

            <div className="space-y-2 text-xs border-b border-slate-100 pb-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Express Shipping</span>
                <span>{order.shipping === 0 ? <strong className="text-emerald-700">Free</strong> : formatINR(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-slate-900 font-bold">{formatINR(order.total)}</span>
              </div>
            </div>

            {/* Quick Payment Select */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Select Instant Payment</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  UPI / Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Net Banking
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleCompleteResumedPayment}
              disabled={isPaying}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isPaying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Recovered Order...</span>
                </>
              ) : (
                <>
                  <span>Complete Order ({formatINR(order.total)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={onBackToStore}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to store</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
