import React, { useState } from 'react';
import { X, CreditCard, Lock, ShieldCheck, AlertCircle, Sparkles, Check, ChevronRight } from 'lucide-react';
import { CartItem, CustomerDetails } from '../types';
import { formatINR } from '../utils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedDiscount: number;
  discountCode?: string;
  onProcessPayment: (payload: {
    customer: CustomerDetails;
    simulateFailure: boolean;
    failureType: string;
    discount: number;
  }) => Promise<void>;
  isProcessing: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedDiscount,
  discountCode,
  onProcessPayment,
  isProcessing,
}) => {
  if (!isOpen) return null;

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: 'Harshil Shilu',
    email: 'shiluharshil10@gmail.com',
    phone: '+91 98765 43210',
    address: 'B-402, Skyline Residency, Ring Road',
    city: 'Ahmedabad',
    postalCode: '380015',
    country: 'India',
  });

  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('742');

  // Simulation controls (to test failure & agent recovery)
  const [simulateFailure, setSimulateFailure] = useState(true); // default to true so user can test the agent
  const [failureType, setFailureType] = useState('card_declined');

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 2000;
  const shipping = subtotal >= freeShippingThreshold ? 0 : 99;
  const total = Math.max(0, subtotal - appliedDiscount + shipping);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProcessPayment({
      customer,
      simulateFailure,
      failureType,
      discount: appliedDiscount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-base">Secure Checkout</h2>
            <span className="text-[11px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
              256-Bit SSL
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Summary banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-medium">Order Items:</span>
              <strong className="text-slate-900 ml-1.5">{items.reduce((a, b) => a + b.quantity, 0)} products</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium">Total to Pay:</span>
              <strong className="text-slate-900 text-sm ml-1.5">{formatINR(total)}</strong>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Email (Receives Recovery Email)
                </label>
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Payment Method
            </h3>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-800">Credit / Debit Card (UPI / 3DS)</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold">Live Simulation</span>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Simulation & Autonomous Recovery Testing Toggle */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">Payment Simulation Scenario</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {simulateFailure ? (
              <div className="space-y-2 text-xs">
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Trigger an intentional payment interruption to test our <strong>Autonomous AI Recovery Agent</strong>.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFailureType('card_declined')}
                    className={`p-2 rounded-lg text-left border text-[11px] transition-all cursor-pointer ${
                      failureType === 'card_declined'
                        ? 'border-amber-500 bg-white font-bold text-amber-900 shadow-2xs'
                        : 'border-amber-200 bg-amber-50/50 text-amber-800'
                    }`}
                  >
                    3D Secure OTP Timeout
                  </button>
                  <button
                    type="button"
                    onClick={() => setFailureType('timeout')}
                    className={`p-2 rounded-lg text-left border text-[11px] transition-all cursor-pointer ${
                      failureType === 'timeout'
                        ? 'border-amber-500 bg-white font-bold text-amber-900 shadow-2xs'
                        : 'border-amber-200 bg-amber-50/50 text-amber-800'
                    }`}
                  >
                    Gateway 504 Timeout
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-emerald-700 text-[11px] font-medium">
                Standard successful payment simulation enabled.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay {formatINR(total)}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
