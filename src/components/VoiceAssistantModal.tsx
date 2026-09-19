import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, MicOff, Volume2, X, Send, CornerDownLeft, Sparkles } from 'lucide-react';

export const VoiceAssistantModal: React.FC = () => {
  const {
    isVoiceAssistantOpen,
    setIsVoiceAssistantOpen,
    speakText,
    stopSpeaking,
    isSpeaking,
  } = useApp();

  const [transcript, setTranscript] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, []);

  // When modal opens, set welcoming state
  useEffect(() => {
    if (isVoiceAssistantOpen && !response) {
      const welcome = "Hello! I am Saathi. What would you like to know about your day?";
      setResponse(welcome);
      speakText(welcome);
    }
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [isVoiceAssistantOpen, speakText]);

  const toggleListening = () => {
    if (!speechSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  const handleSendQuery = async (queryText: string) => {
    const textToSend = queryText || transcript;
    if (!textToSend.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data.answer);
        speakText(data.answer);
      } else {
        const errText = "I couldn't hear that clearly. Please try asking again or type below.";
        setResponse(errText);
        speakText(errText);
      }
    } catch (err) {
      console.error('Error asking Saathi:', err);
      const fallbackMsg = "Saathi is currently working offline. Please check your schedule cards on the dashboard.";
      setResponse(fallbackMsg);
      speakText(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVoiceAssistantOpen) return null;

  const quickQuestions = [
    'What do I have today?',
    'What medicines do I take?',
    'What is my next task?',
    'Who is my trusted contact?',
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
    >
      <div className="bg-white dark:bg-stone-900 border-3 border-amber-500 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h2 id="voice-modal-title" className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                Talk to Saathi
              </h2>
              <p className="text-stone-600 dark:text-stone-400 text-base font-semibold">
                Ask a question using your voice or type below
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              setIsVoiceAssistantOpen(false);
            }}
            className="p-3 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors"
            aria-label="Close Voice Assistant"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Central Speech & Response Canvas */}
        <div className="my-6 space-y-6">
          {/* Saathi Spoken Response Box */}
          <div className="bg-amber-50 dark:bg-stone-800 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Saathi's Answer
              </span>
              {isSpeaking && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full animate-pulse">
                  <Volume2 className="w-4 h-4" />
                  Speaking out loud...
                </span>
              )}
            </div>
            <p className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 leading-relaxed">
              {isLoading ? 'Checking your schedule...' : response}
            </p>
          </div>

          {/* User Speech Transcription Display */}
          {transcript && (
            <div className="bg-stone-100 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 rounded-xl p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                You said:
              </span>
              <p className="text-lg font-semibold text-stone-800 dark:text-stone-200">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Big Microphone CTA Button */}
          <div className="flex flex-col items-center justify-center py-2">
            <button
              onClick={toggleListening}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 border-4 ${
                isListening
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse ring-8 ring-rose-200 dark:ring-rose-950'
                  : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-400 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
              }`}
              aria-label={isListening ? 'Listening. Tap to finish speaking.' : 'Tap to speak to Saathi'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-10 h-10 mb-1" />
                  <span className="text-xs font-black uppercase">Listening</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10 mb-1" />
                  <span className="text-xs font-black uppercase">Tap to Speak</span>
                </>
              )}
            </button>
            <p className="text-sm font-bold text-stone-600 dark:text-stone-400 mt-3 text-center">
              {speechSupported
                ? isListening
                  ? 'I am listening... tap again when done.'
                  : 'Tap the green button and speak naturally.'
                : 'Microphone not available in this browser. You can type below!'}
            </p>
          </div>

          {/* Quick 1-Tap Sample Questions */}
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-2">
              Or tap a common question:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setTranscript(q);
                    handleSendQuery(q);
                  }}
                  className="text-left px-4 py-3 rounded-xl bg-stone-100 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 font-bold text-stone-800 dark:text-stone-100 transition-colors text-base"
                >
                  👉 "{q}"
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(transcript);
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Or type your question here..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-semibold text-lg focus:border-amber-500 focus:outline-none"
              aria-label="Type your question for Saathi"
            />
            <button
              type="submit"
              disabled={!transcript.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-lg flex items-center gap-2 transition-colors min-h-[48px]"
              aria-label="Send question"
            >
              <Send className="w-5 h-5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
