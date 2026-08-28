import React, { useState } from 'react';
import { X, Mail, Sparkles, Inbox, ArrowRight, Trash2 } from 'lucide-react';
import { SentEmail } from '../types';

interface EmailInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: SentEmail[];
  onRefreshEmails: () => void;
  onClearEmails?: () => Promise<void> | void;
  onTriggerTestEmail?: (email: string) => Promise<void>;
  onResumeFromEmail?: (url: string) => void;
  defaultEmail?: string;
}

export const EmailInboxModal: React.FC<EmailInboxModalProps> = ({
  isOpen,
  onClose,
  emails,
  onClearEmails,
  onResumeFromEmail,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  if (!isOpen) return null;

  const activeEmail = selectedEmail || (emails.length > 0 ? emails[0] : null);

  const handleClearAll = async () => {
    if (emails.length === 0) return;
    setIsClearing(true);
    try {
      if (onClearEmails) {
        await onClearEmails();
      }
      setSelectedEmail(null);
    } catch (err) {
      console.error('Error clearing emails:', err);
    } finally {
      setIsClearing(false);
    }
  };

  // Directly transform HTML without unnecessary hooks
  const sanitizedHtml = activeEmail?.html
    ? activeEmail.html.replace(/https?:\/\/localhost(:\d+)?/gi, '')
    : '';

  // Intercept click on any link inside the email body to resume payment in-app
  const handleEmailBodyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a') || (target.tagName === 'A' ? (target as HTMLAnchorElement) : null);
    if (anchor) {
      e.preventDefault();
      e.stopPropagation();
      const rawHref = anchor.getAttribute('href') || activeEmail?.resumeUrl || '';
      triggerResume(rawHref);
    }
  };

  const triggerResume = (urlToParse?: string) => {
    const targetUrl = urlToParse || activeEmail?.resumeUrl || '';
    if (onResumeFromEmail) {
      if (targetUrl) {
        onResumeFromEmail(targetUrl);
      } else if (activeEmail?.orderId) {
        onResumeFromEmail(`/?resumeOrder=${activeEmail.orderId}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[88vh] max-h-[800px] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Demo Customer Mailbox</h3>
              <p className="text-[11px] text-slate-400">Live preview of autonomous emails sent to customers</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {emails.length > 0 && (
              <button
                id="header-clear-all-emails-btn"
                onClick={handleClearAll}
                disabled={isClearing}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Clear all emails"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearing ? 'Clearing...' : 'Clear All Mails'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Email List */}
          <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
            <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Inbox ({emails.length})
              </span>
              {emails.length > 0 && (
                <button
                  id="clear-all-emails-btn"
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200/80 disabled:opacity-50"
                  title="Clear all emails in mailbox"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isClearing ? 'Clearing...' : 'Clear All'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {emails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center">
                  <Inbox className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300" />
                  <p className="text-xs font-medium">No recovery emails yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                    Simulate a failed checkout or submit an issue report to generate one.
                  </p>
                </div>
              ) : (
                emails.map((email) => {
                  const isSelected = activeEmail?.id === email.id;
                  return (
                    <button
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`w-full text-left p-3.5 transition-colors cursor-pointer border-l-2 ${
                        isSelected
                          ? 'bg-white border-indigo-600 shadow-xs'
                          : 'hover:bg-slate-100/70 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {email.from.split('<')[0] || 'Support'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 truncate mb-1">
                        {email.subject}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-medium">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>Order #{email.orderId || 'Recovered'}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Email Preview */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {activeEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Email Metadata */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{activeEmail.subject}</h4>
                    <div className="text-xs text-slate-500">
                      To: <strong className="text-slate-800">{activeEmail.to}</strong> • From: {activeEmail.from}
                    </div>
                  </div>
                  
                  {/* Quick Action to resume directly */}
                  <button
                    id="resume-from-email-header-btn"
                    onClick={() => triggerResume()}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Resume Payment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Rendered HTML Email Body container */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                  <div
                    onClick={handleEmailBodyClick}
                    className="max-w-2xl mx-auto bg-white rounded-xl shadow-xs overflow-hidden cursor-pointer"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Select an email from the left to view preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
