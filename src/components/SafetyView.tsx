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
  const { setCurrentView, trustedContacts, speakText, language, t } = useApp();
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
      setError(language === 'hi' ? 'कृपया पहले कोई संदेश पेस्ट करें या चुनें।' : 'Please paste a message or choose a sample to inspect.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/safety-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, messageText: text, language }),
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
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-bold mb-2 hover:underline focus-visible:ring-2 ring-rose-500 rounded p-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to {t.myDay}</span>
          </button>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-950 dark:text-white flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-rose-600" />
            <span>{t.staySafe}: {t.checkAMessage}</span>
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
              className="text-left p-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 hover:border-rose-500 font-bold text-stone-900 dark:text-white text-base shadow-sm transition-all focus-visible:ring-4 ring-rose-500"
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
      <section className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <label
            htmlFor="scam-input"
            className="block text-xl font-black text-stone-900 dark:text-white mb-2"
          >
            Paste the suspicious message or describe the phone call:
          </label>
          <textarea
            id="scam-input"
            rows={5}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Paste the SMS, WhatsApp text, or email here..."
            className="w-full p-4 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-semibold text-lg focus:border-rose-500 focus:outline-none focus-visible:ring-4 ring-rose-400"
          />
        </div>

        {/* Privacy Guard Notice */}
        {hasSensitiveDataWarning && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <Lock className="w-6 h-6 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <div className="font-black text-base">Privacy Reminder:</div>
              <div className="text-sm font-semibold">
                Never enter your actual banking passwords, card PINs, or real OTP numbers into any website.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={() => handleCheckSafety()}
          disabled={loading || !messageText.trim()}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-2xl shadow-lg transition-all active:scale-95 focus-visible:ring-4 ring-rose-400 min-h-[64px]"
        >
          <ShieldCheck className={`w-7 h-7 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Checking Safety with Aasra...' : 'Is This Message Safe? Check Now'}</span>
        </button>
      </section>

      {/* Loading indicator */}
      {loading && (
        <div className="p-8 rounded-3xl bg-rose-50 dark:bg-stone-900 border-3 border-rose-400 text-center space-y-4 animate-pulse">
          <Sparkles className="w-12 h-12 text-rose-600 mx-auto animate-spin" />
          <h2 className="text-2xl font-black text-stone-900 dark:text-white">
            Aasra is inspecting this message for fraud signals...
          </h2>
          <p className="text-stone-600 dark:text-stone-400 font-bold">
            Checking for urgency traps, fake links, threats, and credential theft patterns.
          </p>
        </div>
      )}

      {/* Result Display */}
      {result && !loading && (
        <section
          aria-label="Safety Analysis Result"
          className={`rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border-4 ${
            result.riskLevel === 'danger'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-600 text-rose-950 dark:text-rose-50'
              : result.riskLevel === 'suspicious'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-50'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-950 dark:text-emerald-50'
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
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-bold text-base shadow-sm focus-visible:ring-4 ring-stone-500 min-h-[48px]"
              aria-label="Listen to safety advice"
            >
              <Volume2 className="w-5 h-5" />
              <span>{t.listen}</span>
            </button>
          </div>

          {/* Explanation */}
          <div className="bg-white dark:bg-stone-800/90 rounded-2xl p-6 border-2 border-stone-200 dark:border-stone-700">
            <h3 className="text-xl font-black text-stone-950 dark:text-white mb-2">
              Why Aasra made this assessment:
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
              className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-lg shadow-md whitespace-nowrap min-h-[48px] focus-visible:ring-4 ring-emerald-400"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call {trustedContact.name} ({trustedContact.relationship})</span>
            </a>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="pt-2 text-stone-600 dark:text-stone-400 text-sm font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-stone-400 shrink-0" />
            <span>
              Aasra analyzes communication patterns to identify known scam tactics. Aasra does not claim 100% certainty. Always verify directly through official phone numbers printed on your bank cards or statements.
            </span>
          </div>
        </section>
      )}
    </div>
  );
};
