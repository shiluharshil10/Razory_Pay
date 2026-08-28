import React from 'react';
import { CheckCircle, ShoppingBag, Package, Sparkles, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { formatINR } from '../utils';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-fadeIn">
        {/* Top Celebration Graphic */}
        <div className="bg-gradient-to-b from-emerald-50 to-white p-8 text-center border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
            Payment Completed
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Thank You for Your Order!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Order <strong className="font-mono text-slate-800">#{order.id}</strong> has been successfully placed.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Details */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Customer:</span>
              <strong className="text-slate-900">{order.customer?.name}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Confirmation sent to:</span>
              <strong className="text-slate-900">{order.customer?.email}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Delivery:</span>
              <strong className="text-slate-900">2-3 Business Days</strong>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid:</span>
              <span className="text-emerald-700 font-bold">{formatINR(order.total || 0)}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
