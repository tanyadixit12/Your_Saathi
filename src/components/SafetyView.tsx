import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SafetyAnalysisResult } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  ArrowLeft,
  PhoneCall,
  Lock,
  Sparkles,
  Info,
} from 'lucide-react';

const PRESET_MESSAGES = [
  {
    title: 'Bank Account Block Threat (Urgent Scam)',
    category: 'Urgent Threat',
    text: 'URGENT: Your State Bank account ending in 4102 has been locked due to suspicious activity. Immediately reply with your 6-digit OTP code to 88291 or click bit.ly/bank-unlock to prevent permanent account suspension within 30 minutes.',
  },
  {
    title: 'Lottery / Prize Fee Fraud (Advance Fee Scam)',
    category: 'Prize Scam',
    text: 'Dear Winner, you have won $5,000 in the National Super Draw! To release your winning funds to your account, purchase a $50 Apple or Google Play gift card and text the code back to this number immediately for transfer release.',
  },
  {
    title: 'Genuine Clinic Appointment Reminder',
    category: 'Legitimate Notice',
    text: "Dr. Rao's Family Clinic: Hi Anita, this is a reminder of your routine cardiology check-up scheduled for Monday at 4:00 PM at City Clinic. Please arrive 15 minutes early. Call 555-0144 if you need to reschedule.",
  },
];

export const SafetyView: React.FC = () => {
  const { setCurrentView, trustedContacts, speakText } = useApp();
  const [messageText, setMessageText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SafetyAnalysisResult | null>(null);
  const [error, setError] = useState<string>('');

  const trustedContact = trustedContacts[0] || { name: 'Rahul Sharma', phone: '+1-555-0199', relationship: 'Son' };

  // Check if text looks like it contains sensitive credentials
  const hasSensitiveDataWarning =
    /\b(\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}|\d{3}[ -]?\d{2}[ -]?\d{4}|\b\d{6}\b|password|pin\s*\d{4})\b/i.test(
      messageText
    );

  const handleCheckSafety = async (textToCheck?: string) => {
    const text = textToCheck || messageText;
    if (!text.trim()) {
      setError('Please paste a message or choose a sample to inspect.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/safety-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, messageText: text }),
      });

      if (res.ok) {
        const data: SafetyAnalysisResult = await res.json();
        setResult(data);
      } else {
        setError('Could not complete safety check. Please try again.');
      }
    } catch (err) {
      console.error('Error analyzing message:', err);
      setError('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setMessageText(sampleText);
    handleCheckSafety(sampleText);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-bold mb-2 hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to My Day</span>
          </button>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-950 dark:text-white flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-rose-600" />
            <span>Is This Safe? (Scam Checker)</span>
          </h1>
          <p className="text-lg sm:text-xl font-bold text-stone-600 dark:text-stone-400 mt-1">
            Check any strange SMS, WhatsApp message, email, or phone call request.
          </p>
        </div>
      </div>

      {/* Preset Samples */}
      <div className="bg-stone-100 dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-800 rounded-3xl p-6">
        <span className="text-sm font-black uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-3">
          Try analyzing one of these common messages:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_MESSAGES.map((msg, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(msg.text)}
              className="text-left p-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 hover:border-rose-500 font-bold text-stone-900 dark:text-white text-base shadow-sm transition-all"
            >
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 inline-block mb-2">
                {msg.category}
              </span>
              <div className="font-extrabold text-base line-clamp-2">{msg.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <label htmlFor="msg-input" className="text-xl font-black text-stone-950 dark:text-white block">
          Paste the message you received:
        </label>

        <textarea
          id="msg-input"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          rows={5}
          placeholder="Paste SMS, WhatsApp text, or email here. Example: 'Your bank account is blocked, call this number...'"
          className="w-full p-4 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-medium text-lg focus:border-rose-500 focus:outline-none leading-relaxed"
        />

        {/* Sensitive data warning banner */}
        {hasSensitiveDataWarning && (
          <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-4 flex items-start gap-3 text-amber-950">
            <Lock className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">Privacy Protection Notice:</span>
              <span className="font-semibold text-sm">
                You appear to have entered numbers that could look like a card, PIN, or OTP. Never share confidential codes or passwords with anyone.
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-100 text-rose-800 rounded-xl font-bold text-base">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={() => handleCheckSafety()}
            disabled={loading || !messageText.trim()}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xl shadow-lg transition-transform active:scale-95 border-2 border-rose-700 min-h-[56px]"
          >
            <ShieldCheck className="w-6 h-6" />
            <span>{loading ? 'Checking for warning signs...' : 'Check This Message'}</span>
          </button>

          {messageText && (
            <button
              onClick={() => {
                setMessageText('');
                setResult(null);
              }}
              className="px-6 py-4 rounded-2xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-base min-h-[56px]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ANALYSIS RESULTS */}
      {result && (
        <section
          aria-label="Safety Analysis Result"
          className={`border-4 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 ${
            result.riskLevel === 'danger'
              ? 'bg-rose-50/70 dark:bg-stone-900 border-rose-500'
              : result.riskLevel === 'suspicious'
              ? 'bg-amber-50/70 dark:bg-stone-900 border-amber-500'
              : 'bg-emerald-50/70 dark:bg-stone-900 border-emerald-500'
          }`}
        >
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md ${
                  result.riskLevel === 'danger'
                    ? 'bg-rose-600'
                    : result.riskLevel === 'suspicious'
                    ? 'bg-amber-600'
                    : 'bg-emerald-600'
                }`}
              >
                {result.riskLevel === 'danger' ? (
                  <ShieldX className="w-10 h-10" />
                ) : result.riskLevel === 'suspicious' ? (
                  <ShieldAlert className="w-10 h-10" />
                ) : (
                  <ShieldCheck className="w-10 h-10" />
                )}
              </div>

              <div>
                <span className="text-sm font-black uppercase tracking-wider text-stone-600 dark:text-stone-400 block">
                  Safety Status Assessment
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-stone-950 dark:text-white">
                  {result.headline ||
                    (result.riskLevel === 'danger'
                      ? '⚠️ DANGER: HIGH RISK OF SCAM'
                      : result.riskLevel === 'suspicious'
                      ? '⚠️ POSSIBLE WARNING SIGNS DETECTED'
                      : '✓ THIS MESSAGE LOOKS SAFE')}
                </h2>
              </div>
            </div>

            <button
              onClick={() =>
                speakText(
                  `Safety assessment: ${result.simpleExplanation}. Recommended next steps: ${result.whatToDoNow.join('. ')}`
                )
              }
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-bold text-base shadow-sm"
              aria-label="Listen to safety advice"
            >
              <Volume2 className="w-5 h-5" />
              <span>Listen</span>
            </button>
          </div>

          {/* Explanation */}
          <div className="bg-white dark:bg-stone-800/90 rounded-2xl p-6 border-2 border-stone-200 dark:border-stone-700">
            <h3 className="text-xl font-black text-stone-950 dark:text-white mb-2">
              Why Saathi made this assessment:
            </h3>
            <p className="text-xl font-bold text-stone-800 dark:text-stone-100 leading-relaxed">
              {result.simpleExplanation}
            </p>
          </div>

          {/* Warning signs (if any) */}
          {result.warningSigns && result.warningSigns.length > 0 && (
            <div className="bg-white dark:bg-stone-800/90 rounded-2xl p-6 border-2 border-rose-300 dark:border-rose-900/60">
              <h3 className="text-xl font-black text-rose-900 dark:text-rose-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
                <span>Specific Warning Signs Found:</span>
              </h3>
              <ul className="space-y-2 text-lg font-bold text-stone-800 dark:text-stone-200">
                {result.warningSigns.map((sign, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-black">❌</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safe Next Steps */}
          <div className="bg-white dark:bg-stone-800/90 rounded-2xl p-6 border-2 border-emerald-300 dark:border-emerald-900/60">
            <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>Safe Next Steps You Should Take:</span>
            </h3>
            <ul className="space-y-2 text-lg font-bold text-stone-800 dark:text-stone-200">
              {result.whatToDoNow.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Family Call Help Banner */}
          <div className="bg-stone-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xl font-black">Still feeling unsure?</h4>
              <p className="text-stone-300 font-medium text-base">
                Never feel rushed. Call your trusted contact to verify before clicking or replying.
              </p>
            </div>
            <a
              href={`tel:${trustedContact.phone}`}
              className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-lg shadow-md whitespace-nowrap min-h-[48px]"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call {trustedContact.name} ({trustedContact.relationship})</span>
            </a>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="pt-2 text-stone-600 dark:text-stone-400 text-sm font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-stone-400 shrink-0" />
            <span>
              Saathi analyzes communication patterns to identify known scam tactics. Saathi does not claim 100% certainty. Always verify directly through official phone numbers printed on your bank cards or statements.
            </span>
          </div>
        </section>
      )}
    </div>
  );
};
