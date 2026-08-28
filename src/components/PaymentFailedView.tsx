import React, { useState } from 'react';
import { AlertTriangle, Send, Loader2, CheckCircle2, Mail, ArrowRight, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { CartItem, CustomerDetails, AgentResolution } from '../types';
import { formatINR } from '../utils';

interface PaymentFailedViewProps {
  orderId: string;
  errorReason: string;
  failureCode: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  total: number;
  onRetryNormal: () => void;
  onOpenInbox: () => void;
  onResumeOrderDirectly: (orderId: string, token?: string) => void;
}

export const PaymentFailedView: React.FC<PaymentFailedViewProps> = ({
  orderId,
  errorReason,
  failureCode,
  customer,
  items,
  total,
  onRetryNormal,
  onOpenInbox,
  onResumeOrderDirectly,
}) => {
  // Report Form state
  const [selectedIssue, setSelectedIssue] = useState<'payment_failed' | 'card_declined' | 'bank_otp_timeout' | 'gateway_error' | 'other'>('payment_failed');
  const [customerEmail, setCustomerEmail] = useState(customer.email || 'shiluharshil10@gmail.com');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [resolutionResult, setResolutionResult] = useState<AgentResolution | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerEmail.includes('@')) {
      setReportError('Please enter a valid email address.');
      return;
    }

    setIsSubmittingReport(true);
    setReportError(null);

    try {
      const response = await fetch('/api/reports/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerEmail,
          customerName: customer.name || 'Shopper',
          issueType: selectedIssue,
          customerNotes: customerNotes || 'Customer encountered payment failure during checkout.',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process report');
      }

      setResolutionResult(data.resolution);
    } catch (err: any) {
      setReportError(err.message || 'An error occurred while contacting the recovery agent.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-rose-100 shadow-xl overflow-hidden">
      {/* Red Alert Header */}
      <div className="bg-rose-50 border-b border-rose-200 p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-rose-950">Payment Transaction Failed</h2>
            <span className="text-[11px] font-mono bg-rose-200/70 text-rose-800 px-2 py-0.5 rounded font-bold">
              {failureCode || 'PAY_GW_ERROR'}
            </span>
          </div>
          <p className="text-xs text-rose-700 mt-1 leading-relaxed">
            {errorReason || 'Your card issuer or payment gateway interrupted the transaction. No funds were captured.'}
          </p>
          <div className="text-[11px] text-rose-600/90 mt-2 font-medium">
            Order Reference: <span className="font-mono font-bold text-rose-900">{orderId}</span> • Total: {formatINR(total)}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 sm:p-8 space-y-6">
        {!resolutionResult ? (
          /* Report Section */
          <div id="payment-failure-report-section" className="space-y-5">
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  Instant Autonomous AI Recovery Available
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Submit this issue to notify our 24/7 AI Reliability Agent. It will instantly diagnose the failure, reserve your cart items, and dispatch a recovery link to your inbox.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What happened during payment?
                </label>
                <select
                  value={selectedIssue}
                  onChange={(e) => setSelectedIssue(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-800"
                >
                  <option value="payment_failed">General Payment Gateway Interruption</option>
                  <option value="card_declined">Card Declined / Limit Exceeded</option>
                  <option value="bank_otp_timeout">3D-Secure Bank OTP Timeout / Failed</option>
                  <option value="gateway_error">Gateway 504 SSL Handshake Timeout</option>
                  <option value="other">Other checkout friction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Email Address (Recovery destination)
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional details (optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. My bank app didn't send the SMS OTP in time..."
                  className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-800 resize-none"
                />
              </div>

              {reportError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {reportError}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full sm:flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI Agent Analyzing & Generating Solution...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Send to AI Recovery Agent</span>
                      <Send className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onRetryNormal}
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Retry Payment Normally
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Resolution Success State */
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Autonomous Recovery Activated!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                The agent has diagnosed the failure, refreshed your checkout session, and dispatched a resolution email with your recovery link.
              </p>
            </div>

            {/* AI Agent Findings Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="font-bold text-slate-700">Root Cause Diagnostic:</span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Resolved & Reserved
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed italic">
                "{resolutionResult.rootCauseAnalysis}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onOpenInbox}
                className="w-full sm:flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Open Mailbox & View Email</span>
              </button>

              <button
                onClick={() => onResumeOrderDirectly(orderId)}
                className="w-full sm:flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Continue Payment Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
