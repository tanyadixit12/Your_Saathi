import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentSimplificationResult } from '../types';
import {
  FileQuestion,
  Sparkles,
  Volume2,
  PlusCircle,
  AlertCircle,
  FileText,
  Upload,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  DollarSign,
  HelpCircle,
  Printer,
  Layers,
  ChevronDown,
} from 'lucide-react';

const PRESET_SAMPLES = [
  {
    title: 'Overdue Electricity Bill Notice',
    text: `URGENT NOTICE OF DISCONNECTION - METRO ELECTRIC CO.
Account Number: 9482-1102-48
Customer Name: Anita Sharma
Service Address: 42 Pine Road, Apt 3B

Final Demand Notice: Your account is currently overdue by 14 days. An outstanding balance of $128.50 must be remitted by October 22, 2026 to avoid interruption of electric utility services and a mandatory $45 reconnection fee. 

Payments can be executed online at metro-electric.gov/pay or in-person at authorized municipal kiosks. Failure to resolve this delinquent balance will result in immediate termination of power supply without further notice.`,
  },
  {
    title: 'Clinic Pre-Checkup Fasting Instructions',
    text: `CITY CLINIC - PRE-APPOINTMENT PATIENT INSTRUCTIONS
Patient: Anita Sharma | Ref: Dr. Rao Cardio-Metabolic Evaluation
Date of Visit: Monday, October 19, 2026 at 4:00 PM

Please adhere strictly to the following pre-procedural guidelines:
1. Complete fasting is required for 8 hours preceding your appointment. Water is permitted in moderate quantities.
2. Continue morning antihypertensive medications unless specifically instructed otherwise.
3. Bring all previous diagnostic electrocardiogram (ECG) tracings, lipid panel lab work, and a physical list of current medications.
4. Report to the Reception Desk 15 minutes prior to appointment time for registration check-in.`,
  },
  {
    title: 'Insurance Policy Renewal & Premium Adjustment',
    text: `SENIOR HEALTH DIRECT - POLICY RENEWAL MEMORANDUM
Policyholder: Anita Sharma | Policy #: SHD-882190

Notice of Annual Benefit Adjustment & Premium Schedule:
Your comprehensive health coverage renewal date is November 1, 2026. Your revised monthly premium will be $84.00, reflecting a statutory 3% cost-of-living adjustment. 

Action required: If you wish to maintain auto-debit payments under the updated schedule, no manual intervention is required. To review alternative deductible tiers or update your primary beneficiary designation, contact customer claims assistance at 1-800-555-0144 before October 25, 2026.`,
  },
];

export const UnderstandView: React.FC = () => {
  const { setCurrentView, addTask, speakText, showActionNotice, language, explainMoreSimply, t } = useApp();
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [simplifyingMore, setSimplifyingMore] = useState<boolean>(false);
  const [result, setResult] = useState<DocumentSimplificationResult | null>(null);
  const [superSimple, setSuperSimple] = useState<{ superSimpleSummary: string; easySteps: string[] } | null>(null);
  const [error, setError] = useState<string>('');

  const handleSimplify = async (textToUse?: string) => {
    const text = textToUse || inputText;
    if (!text.trim()) {
      setError(language === 'hi' ? 'कृपया पहले कुछ टेक्स्ट लिखें या चुनें।' : 'Please paste or select some text first.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    setSuperSimple(null);

    try {
      const res = await fetch('/api/ai/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, documentText: text, language }),
      });

      if (res.ok) {
        const data: DocumentSimplificationResult = await res.json();
        setResult(data);
      } else {
        setError('Could not process this document. Please try again.');
      }
    } catch (err) {
      console.error('Error simplifying document:', err);
      setError('An error occurred. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainMoreSimply = async () => {
    if (!result) return;
    try {
      setSimplifyingMore(true);
      const combined = `${result.whatIsThis} ${result.whatNeedToDo} Due: ${result.whenNeedToDoIt}. Cost: ${result.howMuchCost}`;
      const simplified = await explainMoreSimply(combined);
      setSuperSimple(simplified);
      speakText(`${simplified.superSimpleSummary}. Step 1: ${simplified.easySteps[0] || ''}`);
    } catch (err) {
      console.error('Failed to simplify more:', err);
    } finally {
      setSimplifyingMore(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    handleSimplify(sampleText);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setInputText(content);
        handleSimplify(content);
      }
    };
    reader.readAsText(file);
  };

  const handleAddExtractedTask = async () => {
    if (!result) return;
    await addTask({
      title: result.whatNeedToDo,
      dueDate: result.whenNeedToDoIt || 'Soon',
      priority: 'high',
    });
    showActionNotice(`Added task: "${result.whatNeedToDo}"`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-bold mb-2 hover:underline focus-visible:ring-2 ring-amber-500 rounded p-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to {t.myDay}</span>
          </button>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-950 dark:text-white flex items-center gap-3">
            <FileQuestion className="w-10 h-10 text-amber-600" />
            <span>{t.helpMeUnderstand}</span>
          </h1>
          <p className="text-lg sm:text-xl font-bold text-stone-600 dark:text-stone-400 mt-1">
            Turn confusing bills, hospital discharge forms, or government letters into plain language.
          </p>
        </div>
      </div>

      {/* Input Form & Sample Selector */}
      <section className="bg-white dark:bg-stone-900 border-3 border-amber-300 dark:border-stone-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <label
            htmlFor="doc-input"
            className="block text-xl font-black text-stone-900 dark:text-white mb-2"
          >
            Paste the text of the letter, notice, or bill:
          </label>
          <textarea
            id="doc-input"
            rows={6}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text from the letter here... e.g. 'Final notice for water bill account #4829...'"
            className="w-full p-4 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-semibold text-lg focus:border-amber-500 focus:outline-none focus-visible:ring-4 ring-amber-400"
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons: Simplify & File Upload */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => handleSimplify()}
            disabled={loading || !inputText.trim()}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xl shadow-md transition-all active:scale-95 focus-visible:ring-4 ring-amber-400 min-h-[56px]"
          >
            <Sparkles className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Reading & Simplifying...' : 'Explain This in Plain English'}</span>
          </button>

          <label
            htmlFor="file-upload"
            className="cursor-pointer flex items-center gap-2 px-5 py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border-2 border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-base transition-colors min-h-[56px] focus-within:ring-4 ring-amber-500"
          >
            <Upload className="w-5 h-5 text-amber-600" />
            <span>Upload Document (.txt)</span>
            <input
              id="file-upload"
              type="file"
              accept=".txt,.doc,.text"
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>
        </div>

        {/* 1-Tap Sample Documents */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
          <span className="text-sm font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-3">
            Or try one of these real sample documents:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESET_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample.text)}
                className="text-left p-4 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-750 border-2 border-amber-200 dark:border-stone-700 font-bold text-stone-900 dark:text-white transition-colors text-base flex flex-col justify-between focus-visible:ring-4 ring-amber-500"
              >
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-extrabold text-sm mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Sample {idx + 1}</span>
                </div>
                <div className="text-base font-bold">{sample.title}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-8 rounded-3xl bg-amber-50 dark:bg-stone-900 border-3 border-amber-400 text-center space-y-4 animate-pulse">
          <Sparkles className="w-12 h-12 text-amber-600 mx-auto animate-spin" />
          <h2 className="text-2xl font-black text-stone-900 dark:text-white">
            Aasra is breaking this down into plain answers...
          </h2>
          <p className="text-stone-600 dark:text-stone-400 font-bold">
            Extracting what it is, what you must do, deadlines, and cost.
          </p>
        </div>
      )}

      {/* Plain Language Results Section */}
      {result && !loading && (
        <section
          aria-label="Plain-Language Explanation"
          className="bg-white dark:bg-stone-900 border-3 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8"
        >
          {/* Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
            <div>
              <span className="text-sm font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                Plain-Language Explanation
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-950 dark:text-white">
                Here is what this document means:
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 print:hidden">
              {/* Explain More Simply Button */}
              <button
                onClick={handleExplainMoreSimply}
                disabled={simplifyingMore}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-sm transition-all active:scale-95 focus-visible:ring-4 ring-blue-400 min-h-[48px]"
                aria-label="Explain even more simply"
              >
                <Layers className={`w-5 h-5 ${simplifyingMore ? 'animate-spin' : ''}`} />
                <span>{simplifyingMore ? 'Simplifying...' : t.explainMoreSimply}</span>
              </button>

              <button
                onClick={() =>
                  speakText(
                    `What is this? ${result.whatIsThis}. What do you need to do? ${result.whatNeedToDo}. When? ${result.whenNeedToDoIt}. Cost: ${result.howMuchCost}.`
                  )
                }
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow-sm focus-visible:ring-4 ring-amber-400 min-h-[48px]"
                aria-label="Listen to explanation"
              >
                <Volume2 className="w-5 h-5" />
                <span>{t.listen}</span>
              </button>

              <button
                onClick={handlePrint}
                className="p-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 focus-visible:ring-2 ring-stone-400 min-h-[48px]"
                aria-label="Print this explanation"
                title="Print"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SUPER SIMPLE HIGHLIGHT CARD (When requested by user) */}
          {superSimple && (
            <div className="bg-blue-50 dark:bg-blue-950/60 border-3 border-blue-400 dark:border-blue-600 rounded-2xl p-6 shadow-sm animate-fade-in space-y-3">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-black text-lg">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <span>SUPER-SIMPLE EXPLANATION (ELI5):</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-blue-950 dark:text-blue-100 leading-snug">
                "{superSimple.superSimpleSummary}"
              </p>
              {superSimple.easySteps && superSimple.easySteps.length > 0 && (
                <div className="pt-2">
                  <span className="text-sm font-black uppercase tracking-wider text-blue-800 dark:text-blue-300 block mb-1">
                    Direct Steps:
                  </span>
                  <ul className="space-y-1.5 text-lg font-bold text-stone-900 dark:text-stone-100">
                    {superSimple.easySteps.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-black">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* THE 6 MANDATORY SECTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. WHAT IS THIS? */}
            <div className="bg-amber-50/70 dark:bg-stone-800/80 border-2 border-amber-200 dark:border-stone-700 rounded-2xl p-6 md:col-span-2">
              <div className="flex items-center gap-3 text-amber-900 dark:text-amber-300 font-black text-xl mb-2">
                <FileText className="w-6 h-6 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>1. WHAT IS THIS?</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white leading-relaxed">
                {result.whatIsThis}
              </p>
            </div>

            {/* 2. WHAT DO I NEED TO DO? */}
            <div className="bg-emerald-50/70 dark:bg-stone-800/80 border-2 border-emerald-200 dark:border-stone-700 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 text-emerald-900 dark:text-emerald-300 font-black text-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>2. WHAT DO I NEED TO DO?</span>
                </div>
              </div>
              <p className="text-xl font-bold text-stone-900 dark:text-white leading-relaxed mb-4">
                {result.whatNeedToDo}
              </p>
              <button
                onClick={handleAddExtractedTask}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-sm print:hidden focus-visible:ring-4 ring-emerald-400"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add this to my To-Do List</span>
              </button>
            </div>

            {/* 3. WHEN DO I NEED TO DO IT? */}
            <div className="bg-blue-50/70 dark:bg-stone-800/80 border-2 border-blue-200 dark:border-stone-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 text-blue-900 dark:text-blue-300 font-black text-xl mb-2">
                <Calendar className="w-6 h-6 text-blue-700 dark:text-blue-400 shrink-0" />
                <span>3. WHEN DO I NEED TO DO IT?</span>
              </div>
              <p className="text-xl font-bold text-stone-900 dark:text-white leading-relaxed">
                {result.whenNeedToDoIt}
              </p>
            </div>

            {/* 4. HOW MUCH DOES IT COST? */}
            <div className="bg-stone-50 dark:bg-stone-800/80 border-2 border-stone-300 dark:border-stone-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 text-stone-900 dark:text-stone-100 font-black text-xl mb-2">
                <DollarSign className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>4. HOW MUCH DOES IT COST?</span>
              </div>
              <p className="text-xl font-bold text-stone-900 dark:text-white leading-relaxed">
                {result.howMuchCost}
              </p>
            </div>

            {/* 5. IMPORTANT THINGS TO NOTICE */}
            <div className="bg-rose-50/70 dark:bg-stone-800/80 border-2 border-rose-200 dark:border-stone-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 text-rose-900 dark:text-rose-300 font-black text-xl mb-2">
                <AlertCircle className="w-6 h-6 text-rose-700 dark:text-rose-400 shrink-0" />
                <span>5. IMPORTANT THINGS TO NOTICE</span>
              </div>
              <ul className="space-y-2 text-lg font-bold text-stone-900 dark:text-stone-200">
                {result.importantThingsToNotice.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-black">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. QUESTIONS I SHOULD ASK */}
            <div className="bg-purple-50/70 dark:bg-stone-800/80 border-2 border-purple-200 dark:border-stone-700 rounded-2xl p-6 md:col-span-2">
              <div className="flex items-center gap-3 text-purple-900 dark:text-purple-300 font-black text-xl mb-2">
                <HelpCircle className="w-6 h-6 text-purple-700 dark:text-purple-400 shrink-0" />
                <span>6. QUESTIONS YOU CAN ASK</span>
              </div>
              <ul className="space-y-2 text-lg font-bold text-stone-900 dark:text-stone-200">
                {result.questionsToAsk.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-700 dark:text-purple-400 font-black">👉</span>
                    <span>"{q}"</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mandatory AI Disclaimer */}
          <div className="border-t-2 border-stone-200 dark:border-stone-800 pt-6 text-stone-600 dark:text-stone-400 text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-stone-500 shrink-0" />
            <span>
              <strong>Note:</strong> This is an AI-generated explanation created to help you understand complex wording. Always confirm critical dates and payment amounts directly with the original bill or service provider before taking action.
            </span>
          </div>
        </section>
      )}
    </div>
  );
};
