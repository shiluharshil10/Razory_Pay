import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Mail, AlertTriangle, ChevronDown, Sparkles, Package, RotateCcw, Bug } from 'lucide-react';
import { ReportCategory } from './ReportIssueModal';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenInbox: () => void;
  emailCount: number;
  onOpenQuickTest: () => void;
  onOpenReport: (category?: ReportCategory) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenInbox,
  emailCount,
  onOpenQuickTest,
  onOpenReport,
}) => {
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const reportMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reportMenuRef.current && !reportMenuRef.current.contains(event.target as Node)) {
        setIsReportMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <span className="font-bold text-lg tracking-wider">D</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">Demo Store</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Report Dropdown Section */}
          <div className="relative" ref={reportMenuRef}>
            <button
              id="report-menu-btn"
              onClick={() => setIsReportMenuOpen(!isReportMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Report</span>
              <ChevronDown className={`w-3.5 h-3.5 text-rose-500 transition-transform ${isReportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isReportMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Report an Issue
                  </span>
                </div>

                {/* Option 1: Failed Payment */}
                <button
                  onClick={() => {
                    setIsReportMenuOpen(false);
                    onOpenReport('failed_payment');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50/80 flex items-start gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5 group-hover:bg-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700">Failed Payment</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">AI Recovery</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Interrupted checkout, card decline, or gateway error
                    </p>
                  </div>
                </button>

                {/* Option 2: Delivery & Shipping */}
                <button
                  onClick={() => {
                    setIsReportMenuOpen(false);
                    onOpenReport('delivery_issue');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900">Delivery & Shipping</span>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Delayed parcel or tracking status issue
                    </p>
                  </div>
                </button>

                {/* Option 3: Product Quality & Returns */}
                <button
                  onClick={() => {
                    setIsReportMenuOpen(false);
                    onOpenReport('product_quality');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900">Product & Returns</span>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Defective item, incorrect item, or return request
                    </p>
                  </div>
                </button>

                {/* Option 4: Website Bug & Feedback */}
                <button
                  onClick={() => {
                    setIsReportMenuOpen(false);
                    onOpenReport('bug_feedback');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                    <Bug className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900">Website Bug / Feedback</span>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Cart glitch, display error, or checkout feedback
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Customer Inbox Viewer */}
          <button
            id="demo-inbox-btn"
            onClick={onOpenInbox}
            className="relative flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Support Mailbox</span>
            {emailCount > 0 && (
              <span className="bg-indigo-600 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {emailCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
