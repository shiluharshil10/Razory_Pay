import React, { useState } from 'react';
import { X, AlertTriangle, Package, RotateCcw, Bug, Send, Loader2, CheckCircle2, Mail, Sparkles, ArrowRight } from 'lucide-react';

export type ReportCategory = 'failed_payment' | 'delivery_issue' | 'product_quality' | 'bug_feedback';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: ReportCategory;
  onReportSubmittedSuccess?: () => void;
  onOpenInbox?: () => void;
  onResumeOrder?: (orderId: string) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'failed_payment',
  onReportSubmittedSuccess,
  onOpenInbox,
  onResumeOrder,
}) => {
  const [category, setCategory] = useState<ReportCategory>(initialCategory);
  const [orderId, setOrderId] = useState(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [customerName, setCustomerName] = useState('Harshil');
  const [customerEmail, setCustomerEmail] = useState('shiluharshil10@gmail.com');
  const [issueDetails, setIssueDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync category if initialCategory changes when opened
  React.useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory);
      setSubmissionResult(null);
      setErrorMsg(null);
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (category === 'failed_payment') {
        // Trigger autonomous payment recovery workflow
        const res = await fetch('/api/reports/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
            customerEmail,
            customerName,
            issueType: 'payment_failed',
            customerNotes: issueDetails || 'Customer reported a failed payment during checkout.',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to submit payment failure report');
        }

        setSubmissionResult({
          type: 'payment_recovered',
          resolution: data.resolution,
          orderId: orderId,
        });
      } else {
        // General Support / Delivery / Return Report
        setSubmissionResult({
          type: 'ticket_created',
          ticketId: `TICK-${Math.floor(10000 + Math.random() * 90000)}`,
          category,
          customerEmail,
        });
      }

      if (onReportSubmittedSuccess) {
        onReportSubmittedSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportOptions = [
    {
      id: 'failed_payment' as ReportCategory,
      title: 'Failed Payment',
      badge: 'AI Autonomous Recovery',
      desc: 'Payment was declined, interrupted, timed out, or charged without confirmation.',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      id: 'delivery_issue' as ReportCategory,
      title: 'Delivery & Shipping',
      badge: 'Support',
      desc: 'Package delayed, wrong shipping address, or tracking status not updating.',
      icon: Package,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'product_quality' as ReportCategory,
      title: 'Product & Returns',
      badge: 'Returns',
      desc: 'Damaged item, received incorrect color/size, or request return label.',
      icon: RotateCcw,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'bug_feedback' as ReportCategory,
      title: 'Website Bug / Feedback',
      badge: 'Feedback',
      desc: 'Cart glitch, display rendering error, or general checkout suggestions.',
      icon: Bug,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Customer Report Center</h3>
              <p className="text-[11px] text-slate-400">Submit an issue for instant autonomous assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!submissionResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selector Grid */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Report Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {reportOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = category === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setCategory(opt.id)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                            : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-700'}`} />
                            <span className="font-bold text-xs">{opt.title}</span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200/80 text-slate-700'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] leading-relaxed ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special notice for Failed Payment */}
              {category === 'failed_payment' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
                  <Sparkles className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-[11px] text-rose-950">Autonomous Payment Recovery Guarantee</p>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      Our automated backend AI agent will diagnose your payment gateway lock, hold your items for 48 hours, and dispatch a 1-click continuation link to your email.
                    </p>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Order / Session Reference</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. ORD-982142"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address for Resolution & Updates
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Issue Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={issueDetails}
                  onChange={(e) => setIssueDetails(e.target.value)}
                  placeholder={
                    category === 'failed_payment'
                      ? 'e.g. Payment gateway timed out while authenticating with my bank card.'
                      : 'Provide any additional details or context...'
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Report & Dispatching Recovery...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {category === 'failed_payment' ? 'Submit Failed Payment Report' : 'Submit Support Report'}
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Result View */
            <div className="space-y-4 animate-fadeIn">
              {submissionResult.type === 'payment_recovered' ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Payment Issue Automatically Resolved!</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Our autonomous recovery agent processed your payment failure report for <strong>#{submissionResult.orderId}</strong>. A personalized email and 1-click continuation link has been dispatched to <strong>{customerEmail}</strong>.
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Status:</span>
                      <strong className="text-emerald-700 font-bold">Session Unlocked</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Cart & Inventory:</span>
                      <strong className="text-slate-800 font-medium">Locked for 48 Hours</strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenInbox) onOpenInbox();
                      }}
                      className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Mail className="w-4 h-4" />
                      <span>View in Mailbox</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span>Report Ticket Created Successfully</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ticket <strong className="font-mono text-slate-900">#{submissionResult.ticketId}</strong> has been logged for our support team. We sent a receipt to <strong>{submissionResult.customerEmail}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer mt-2"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
