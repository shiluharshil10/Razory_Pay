import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

interface QuickTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTestEmail: (email: string, name: string) => Promise<any>;
  onOpenInbox: () => void;
}

export const QuickTestModal: React.FC<QuickTestModalProps> = ({
  isOpen,
  onClose,
  onSendTestEmail,
  onOpenInbox,
}) => {
  const [email, setEmail] = useState('shiluharshil10@gmail.com');
  const [name, setName] = useState('Harshil');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await onSendTestEmail(email, name);
      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm">Test Backend Recovery Agent</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Give your email address below to simulate a live customer payment failure. The autonomous backend agent will detect it, diagnose the session, and send an apology email with the 1-click continue payment link to your mailbox.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Your Email Address (Demo Destination)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. shiluharshil10@gmail.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autonomous Agent Processing & Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Demo Apology Email Now</span>
                </>
              )}
            </button>
          </form>

          {result && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-fadeIn text-xs">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Demo Apology Email Dispatched!</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                The agent resolved the simulated payment failure and generated a recovery session with your saved items.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenInbox();
                }}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer text-center block mt-2"
              >
                Open Mailbox to View Rendered Email & Test Resume Link →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
