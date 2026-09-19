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
  const { setCurrentView, addTask, speakText, showActionNotice } = useApp();
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DocumentSimplificationResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleSimplify = async (textToUse?: string) => {
    const text = textToUse || inputText;
    if (!text.trim()) {
      setError('Please paste or select some text first.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, documentText: text }),
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
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-bold mb-2 hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to My Day</span>
          </button>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-950 dark:text-white flex items-center gap-3">
            <FileQuestion className="w-10 h-10 text-amber-600" />
            <span>Understand Something</span>
          </h1>
          <p className="text-lg sm:text-xl font-bold text-stone-600 dark:text-stone-400 mt-1">
            Turn confusing bills, letters, notices, or bank messages into plain, simple answers.
          </p>
        </div>
      </div>

      {/* Preset Quick Samples Section */}
      <div className="bg-stone-100 dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-800 rounded-3xl p-6">
        <span className="text-sm font-black uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-3">
          Or try one of these realistic sample documents:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_SAMPLES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(s.text)}
              className="text-left p-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 hover:border-amber-500 font-bold text-stone-900 dark:text-white text-base shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-1 text-amber-700 dark:text-amber-400">
                <FileText className="w-5 h-5" />
                <span className="font-extrabold text-sm">Sample {idx + 1}</span>
              </div>
              <div className="line-clamp-2">{s.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box and Upload Area */}
      <div className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label htmlFor="doc-input" className="text-xl font-black text-stone-950 dark:text-white">
            Paste the text of your letter or bill here:
          </label>

          {/* File Upload Helper */}
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-sm border border-stone-300 dark:border-stone-600 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Upload Text File (.txt)</span>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <textarea
          id="doc-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={6}
          placeholder="Paste anything confusing here — an electricity bill, a letter from your bank, or clinic instructions..."
          className="w-full p-4 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-medium text-lg focus:border-amber-500 focus:outline-none leading-relaxed"
        />

        {error && (
          <div className="p-3 bg-rose-100 text-rose-800 rounded-xl font-bold text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={() => handleSimplify()}
            disabled={loading || !inputText.trim()}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xl shadow-lg transition-transform active:scale-95 border-2 border-amber-700 min-h-[56px]"
          >
            <Sparkles className="w-6 h-6" />
            <span>{loading ? 'Reading and simplifying...' : 'Explain in Simple Words'}</span>
          </button>

          {inputText && (
            <button
              onClick={() => {
                setInputText('');
                setResult(null);
              }}
              className="px-6 py-4 rounded-2xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-base min-h-[56px]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* RESULTS DISPLAY: THE 6 STRUCTURED SECTIONS */}
      {result && (
        <section
          aria-label="Simplified Document Explanation"
          className="bg-white dark:bg-stone-900 border-4 border-amber-400 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 print:p-0 print:border-none"
        >
          {/* Header with audio and print */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-amber-200 dark:border-stone-800 pb-6">
            <div>
              <span className="text-sm font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                Plain-Language Explanation
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-950 dark:text-white">
                Here is what this document means:
              </h2>
            </div>

            <div className="flex items-center gap-3 print:hidden">
              <button
                onClick={() =>
                  speakText(
                    `What is this? ${result.whatIsThis}. What do you need to do? ${result.whatNeedToDo}. When? ${result.whenNeedToDoIt}. Cost: ${result.howMuchCost}.`
                  )
                }
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow-sm"
                aria-label="Listen to explanation"
              >
                <Volume2 className="w-5 h-5" />
                <span>Listen to Summary</span>
              </button>

              <button
                onClick={handlePrint}
                className="p-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700"
                aria-label="Print this explanation"
                title="Print"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>

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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-sm print:hidden"
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
