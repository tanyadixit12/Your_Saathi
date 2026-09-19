import React from 'react';
import { VoiceAvatarState } from '../types';
import { useApp } from '../context/AppContext';

interface AasraAvatarProps {
  state: VoiceAvatarState;
}

export const AasraAvatar: React.FC<AasraAvatarProps> = ({ state }) => {
  const { preferences } = useApp();
  const isReducedMotion = preferences.reducedMotion === 'reduced';

  const stateInfo: Record<
    VoiceAvatarState,
    { label: string; bgGradient: string; ringColor: string; eyeColor: string }
  > = {
    idle: {
      label: 'Aasra is ready to help',
      bgGradient: 'from-amber-400 to-amber-500',
      ringColor: 'ring-amber-200 dark:ring-amber-950',
      eyeColor: '#451a03',
    },
    listening: {
      label: 'Aasra is listening...',
      bgGradient: 'from-emerald-400 to-emerald-500',
      ringColor: 'ring-emerald-300 dark:ring-emerald-900',
      eyeColor: '#064e3b',
    },
    thinking: {
      label: 'Aasra is thinking...',
      bgGradient: 'from-blue-400 to-indigo-500',
      ringColor: 'ring-blue-300 dark:ring-blue-900',
      eyeColor: '#1e1b4b',
    },
    speaking: {
      label: 'Aasra is speaking...',
      bgGradient: 'from-amber-500 to-orange-500',
      ringColor: 'ring-amber-300 dark:ring-orange-950',
      eyeColor: '#431407',
    },
    error: {
      label: 'Aasra encountered an issue',
      bgGradient: 'from-rose-400 to-rose-500',
      ringColor: 'ring-rose-300 dark:ring-rose-950',
      eyeColor: '#4c0519',
    },
  };

  const current = stateInfo[state] || stateInfo.idle;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Visual Avatar SVG */}
      <div
        className={`relative w-28 h-28 rounded-full bg-gradient-to-b ${current.bgGradient} p-2 shadow-xl ring-8 ${current.ringColor} transition-all duration-300 flex items-center justify-center ${
          !isReducedMotion && state === 'listening' ? 'animate-pulse' : ''
        }`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-24 h-24 text-stone-900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gentle Cheeks */}
          <circle cx="28" cy="56" r="8" fill="#fb7185" opacity="0.35" />
          <circle cx="72" cy="56" r="8" fill="#fb7185" opacity="0.35" />

          {/* Eyes */}
          {state === 'thinking' ? (
            // Looking up / thoughtful
            <>
              <circle cx="34" cy="40" r="5" fill={current.eyeColor} />
              <circle cx="66" cy="40" r="5" fill={current.eyeColor} />
              <path d="M28 32 C34 30, 40 32, 40 32" stroke={current.eyeColor} strokeWidth="3" strokeLinecap="round" />
              <path d="M60 32 C66 30, 72 32, 72 32" stroke={current.eyeColor} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : state === 'listening' ? (
            // Attentive wide bright eyes
            <>
              <circle cx="34" cy="44" r="6" fill={current.eyeColor} />
              <circle cx="66" cy="44" r="6" fill={current.eyeColor} />
              <circle cx="36" cy="42" r="2" fill="white" />
              <circle cx="68" cy="42" r="2" fill="white" />
            </>
          ) : state === 'error' ? (
            // Gentle caring expression
            <>
              <circle cx="34" cy="45" r="5" fill={current.eyeColor} />
              <circle cx="66" cy="45" r="5" fill={current.eyeColor} />
              <path d="M28 36 C34 39, 40 36, 40 36" stroke={current.eyeColor} strokeWidth="3" strokeLinecap="round" />
              <path d="M60 36 C66 39, 72 36, 72 36" stroke={current.eyeColor} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            // Calm smiling gentle eyes
            <>
              <path d="M28 44 Q34 38 40 44" stroke={current.eyeColor} strokeWidth="4" strokeLinecap="round" />
              <path d="M60 44 Q66 38 72 44" stroke={current.eyeColor} strokeWidth="4" strokeLinecap="round" />
            </>
          )}

          {/* Mouth */}
          {state === 'speaking' ? (
            // Animated/open speaking mouth
            <path
              d="M38 62 Q50 78 62 62 Z"
              fill={current.eyeColor}
              className={!isReducedMotion ? 'animate-bounce' : ''}
            />
          ) : state === 'error' ? (
            // Neutral caring mouth
            <path d="M42 66 Q50 63 58 66" stroke={current.eyeColor} strokeWidth="3.5" strokeLinecap="round" />
          ) : (
            // Warm friendly smile
            <path d="M36 60 Q50 74 64 60" stroke={current.eyeColor} strokeWidth="4" strokeLinecap="round" fill="none" />
          )}

          {/* Sound waves when speaking */}
          {state === 'speaking' && !isReducedMotion && (
            <>
              <path d="M12 40 Q8 50 12 60" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              <path d="M88 40 Q92 50 88 60" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            </>
          )}

          {/* Listening sound waves */}
          {state === 'listening' && (
            <>
              <path d="M14 44 Q10 50 14 56" stroke="#bbf7d0" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M86 44 Q90 50 86 56" stroke="#bbf7d0" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      </div>

      {/* Accessible Text Status Badge (Screen reader friendly) */}
      <div
        aria-live="polite"
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm font-black tracking-wide"
      >
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            state === 'listening'
              ? 'bg-emerald-500 animate-ping'
              : state === 'thinking'
              ? 'bg-blue-500 animate-pulse'
              : state === 'speaking'
              ? 'bg-amber-500'
              : state === 'error'
              ? 'bg-rose-500'
              : 'bg-stone-400'
          }`}
        />
        <span>{current.label}</span>
      </div>
    </div>
  );
};
