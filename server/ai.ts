import { GoogleGenAI, Type } from '@google/genai';
import {
  DailyBriefingResult,
  DocumentSimplificationResult,
  SafetyAnalysisResult,
  Medicine,
  Appointment,
  Task
} from '../src/types';

let genAIClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

const SYSTEM_INSTRUCTION = `You are Saathi, an intelligent, accessible and trustworthy daily companion designed specifically for senior citizens.
Your core principle: Never make the senior user feel like they are using a complicated computer system.
- Use simple, calm, supportive and respectful language.
- Never invent facts. Only use information provided by the user or application context.
- If information is missing or unavailable, explicitly and gently say so.
- For medical, financial, legal or safety-sensitive topics, provide general informational assistance only and clearly recommend verifying with the doctor, clinic, bank or trusted family member.
- Never request passwords, OTPs, PINs, card numbers or authentication credentials.
- Never claim 100% certainty when analyzing potentially suspicious messages. Use balanced terms like "Possible warning signs", "This may be suspicious", and "Verify independently".
- Prefer short sentences, clear bullet points, and plain everyday words.
- Do not overwhelm the user with unnecessary jargon or long paragraphs.`;

/**
 * FEATURE 6 — AI Daily Briefing
 */
export async function generateDailyBriefing(params: {
  userName: string;
  medicines: Medicine[];
  appointments: Appointment[];
  tasks: Task[];
}): Promise<DailyBriefingResult> {
  const { userName, medicines, appointments, tasks } = params;
  const ai = getGemini();

  const pendingMeds = medicines.filter((m) => m.status === 'pending');
  const pendingApts = appointments.filter((a) => !a.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Fallback / deterministic grounding
  const fallbackGreeting = `Good morning, ${userName || 'Anita'}.`;
  const medText = pendingMeds.length === 1
    ? `You have 1 medicine scheduled: ${pendingMeds[0].name} (${pendingMeds[0].time}).`
    : pendingMeds.length > 1
    ? `You have ${pendingMeds.length} medicines scheduled today.`
    : 'No medicines pending today.';

  const aptText = pendingApts.length > 0
    ? `You have an appointment: ${pendingApts[0].title} at ${pendingApts[0].dateTime}.`
    : 'No appointments scheduled today.';

  const taskText = pendingTasks.length > 0
    ? `Your key task is to ${pendingTasks[0].title.toLowerCase()}.`
    : 'No urgent tasks on your list.';

  const fallbackResult: DailyBriefingResult = {
    greeting: fallbackGreeting,
    summary: `${medText} ${aptText} ${taskText}`,
    highlights: [
      medText,
      aptText,
      taskText
    ].filter((s) => !s.startsWith('No ')),
    closingMessage: "That is all you need to focus on today. Take things easy and have a wonderful day.",
  };

  if (!ai) {
    return fallbackResult;
  }

  try {
    const prompt = `Current user data for today:
User Name: ${userName}
Pending Medicines (${pendingMeds.length}): ${pendingMeds.map((m) => `${m.name} ${m.dosage} at ${m.time} (${m.frequency})`).join(', ') || 'None'}
Appointments today (${pendingApts.length}): ${pendingApts.map((a) => `${a.title} at ${a.dateTime} (${a.location})`).join(', ') || 'None'}
Pending Tasks (${pendingTasks.length}): ${pendingTasks.map((t) => `${t.title} (Due: ${t.dueDate}, Priority: ${t.priority})`).join(', ') || 'None'}

Generate a short, calm, supportive morning briefing strictly based on this data.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            summary: { type: Type.STRING },
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            closingMessage: { type: Type.STRING },
          },
          required: ['greeting', 'summary', 'highlights', 'closingMessage'],
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return parsed;
    }
  } catch (err) {
    console.error('Error calling Gemini for daily briefing:', err);
  }

  return fallbackResult;
}

/**
 * FEATURE 4 — Understand This (Document / Message Simplifier)
 */
export async function simplifyDocument(text: string): Promise<DocumentSimplificationResult> {
  const trimmed = (text || '').trim();

  // Basic rule-based extraction for fallback
  const hasAmountMatch = trimmed.match(/(?:₹|\$|€|rs\.?|inr|usd)\s*([0-9,]+(?:\.[0-9]{2})?)/i);
  const costExtracted = hasAmountMatch ? hasAmountMatch[0] : 'No cost mentioned in the document.';

  const fallbackResult: DocumentSimplificationResult = {
    whatIsThis: trimmed.length > 0
      ? `This is a notice regarding: ${trimmed.slice(0, 100)}...`
      : 'No text provided.',
    whatNeedToDo: 'Review the details carefully. If this requires payment or reply, verify the official contact number.',
    whenNeedToDoIt: 'Check the date printed on your original letter or bill.',
    howMuchCost: costExtracted,
    importantThingsToNotice: [
      'Keep your original document safely for your records.',
      'Never share OTP, PIN or banking passwords with anyone asking about this.',
    ],
    questionsToAsk: [
      'Is there an official customer service number I can call to confirm?',
      'Has this already been paid or processed automatically?',
    ],
  };

  const ai = getGemini();
  if (!ai || trimmed.length < 5) {
    return fallbackResult;
  }

  try {
    const prompt = `Please analyze and simplify this document or message for an elderly senior citizen:

--- BEGIN DOCUMENT ---
${trimmed}
--- END DOCUMENT ---

Transform into 6 simple, unambiguous sections:
1. WHAT IS THIS? (1-2 clear, simple sentences)
2. WHAT DO I NEED TO DO? (Direct, simple action, or "Nothing to do right now")
3. WHEN DO I NEED TO DO IT? (Clear deadline, date, or "No deadline specified")
4. HOW MUCH DOES IT COST? (Only if explicitly stated in text with currency, otherwise "No payment mentioned")
5. IMPORTANT THINGS TO NOTICE (2-3 crucial bullet points)
6. QUESTIONS I SHOULD ASK (1-3 questions to ask family or provider)

Do not invent dates, amounts, or requirements not in the text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatIsThis: { type: Type.STRING },
            whatNeedToDo: { type: Type.STRING },
            whenNeedToDoIt: { type: Type.STRING },
            howMuchCost: { type: Type.STRING },
            importantThingsToNotice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            questionsToAsk: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'whatIsThis',
            'whatNeedToDo',
            'whenNeedToDoIt',
            'howMuchCost',
            'importantThingsToNotice',
            'questionsToAsk',
          ],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (err) {
    console.error('Error calling Gemini for document simplification:', err);
  }

  return fallbackResult;
}

/**
 * FEATURE 5 — Scam / Suspicious Message Check
 */
export async function analyzeSuspiciousMessage(message: string): Promise<SafetyAnalysisResult> {
  const trimmed = (message || '').trim();

  // Check for sensitive credential leakage in the input itself
  const containsSensitiveData =
    /\b(?:password|passwd|otp\b|one\s*time\s*password|cvv\b|pin\b|credit\s*card|\d{16}|\d{4}\s\d{4}\s\d{4}\s\d{4})/i.test(
      trimmed
    );

  const lower = trimmed.toLowerCase();
  const asksOtp = lower.includes('otp') || lower.includes('one time password');
  const asksUrgent =
    lower.includes('immediately') ||
    lower.includes('urgent') ||
    lower.includes('blocked') ||
    lower.includes('suspended') ||
    lower.includes('act now') ||
    lower.includes('within 24 hours') ||
    lower.includes('account suspended') ||
    lower.includes('disconnection');
  const hasLink = lower.includes('http://') || lower.includes('https://') || lower.includes('bit.ly') || lower.includes('.link') || lower.includes('click here');
  const mentionsBank = lower.includes('bank') || lower.includes('account') || lower.includes('kyc') || lower.includes('card');

  const warningSignsDetected: string[] = [];
  if (asksOtp) warningSignsDetected.push('Asks for an OTP or security code (banks never ask for OTPs)');
  if (asksUrgent) warningSignsDetected.push('Creates false urgency or threatens that an account will be blocked');
  if (hasLink) warningSignsDetected.push('Contains an unverified web link or asks you to click');
  if (mentionsBank && (asksOtp || asksUrgent)) warningSignsDetected.push('Impersonates a bank or official organization');

  const isSuspicious = warningSignsDetected.length > 0 || (asksOtp && mentionsBank);

  const fallbackResult: SafetyAnalysisResult = {
    riskLevel: isSuspicious ? (asksOtp ? 'danger' : 'suspicious') : 'safe',
    headline: isSuspicious
      ? 'Possible Warning Signs Detected'
      : 'No Obvious Warning Signs Detected',
    warningSigns: warningSignsDetected.length > 0
      ? warningSignsDetected
      : ['No common scam patterns like asking for OTP or passwords were found.'],
    simpleExplanation: isSuspicious
      ? 'This message asks you to act urgently or provide private information. Banks and government agencies do not ask for OTPs or passwords over text messages.'
      : 'This looks like an ordinary message, but always stay cautious if anyone asks for money or personal details.',
    whatToDoNow: [
      'Do not reply with any private details, passwords or OTPs.',
      'Do not click on links in the message.',
      'If you have concerns, call your bank using the phone number printed directly on the back of your bank card or on your passbook.',
    ],
    sensitiveDataWarning: containsSensitiveData,
  };

  const ai = getGemini();
  if (!ai || trimmed.length < 5) {
    return fallbackResult;
  }

  try {
    const prompt = `Analyze this message sent to a senior citizen to evaluate safety and warn about potential scam patterns:

--- MESSAGE ---
${trimmed}
--- END MESSAGE ---

Identify possible warning signs such as:
- Asks for OTP, PIN, or password
- False urgency or threats to block accounts
- Requests for money transfers or gift cards
- Suspicious links
- Impersonating banks or authorities

Rules:
- Never claim 100% certainty. Use terms like "Possible warning signs", "This may be suspicious", "Verify independently".
- Provide clear, safe next actions in plain language.
- If user included sensitive personal information in the text, note that.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              description: 'safe, suspicious, or danger',
            },
            headline: { type: Type.STRING },
            warningSigns: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            simpleExplanation: { type: Type.STRING },
            whatToDoNow: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sensitiveDataWarning: { type: Type.BOOLEAN },
          },
          required: [
            'riskLevel',
            'headline',
            'warningSigns',
            'simpleExplanation',
            'whatToDoNow',
          ],
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      // Enforce valid risk level
      const riskLevel = ['safe', 'suspicious', 'danger'].includes(parsed.riskLevel)
        ? parsed.riskLevel
        : isSuspicious ? 'danger' : 'safe';

      return {
        ...parsed,
        riskLevel,
        sensitiveDataWarning: parsed.sensitiveDataWarning || containsSensitiveData,
      };
    }
  } catch (err) {
    console.error('Error calling Gemini for suspicious message analysis:', err);
  }

  return fallbackResult;
}

/**
 * FEATURE 3 — Generate Appointment / Task Preparation Checklist
 */
export async function generateTaskPreparation(params: {
  title: string;
  location?: string;
  notes?: string;
}): Promise<string[]> {
  const { title, location, notes } = params;
  const isDoctor = /doctor|clinic|hospital|checkup|dr\.|health|physician|cardio/i.test(title + ' ' + (notes || ''));
  const isBank = /bank|branch|cheque|passbook|account/i.test(title + ' ' + (notes || ''));
  const isBill = /bill|electricity|water|gas|tax/i.test(title + ' ' + (notes || ''));

  const defaultChecklist: string[] = isDoctor
    ? [
        'Carry your previous blood test and health reports',
        'Carry your current list of medicines',
        'Carry your reading glasses and health card',
        'Reach 15 minutes before your scheduled appointment time',
        'Ask your clinic if you need to bring anything else',
      ]
    : isBank
    ? [
        'Carry your original government ID card',
        'Carry your bank passbook or checkbook',
        'Carry your reading glasses and a pen',
        'Ask your branch counter if you need any specific form filled',
      ]
    : isBill
    ? [
        'Keep your customer account number handy',
        'Check the exact amount before payment',
        'Save the receipt or payment confirmation message',
      ]
    : [
        'Keep any relevant documents or notes ready',
        'Check the exact time and location in advance',
        'Ask your family or contact if you need any assistance',
      ];

  const ai = getGemini();
  if (!ai) {
    return defaultChecklist;
  }

  try {
    const prompt = `Appointment/Task Title: "${title}"
Location: "${location || 'None specified'}"
Notes: "${notes || 'None specified'}"

Generate a 3-4 item practical preparation checklist for a senior citizen.
Do NOT invent medical requirements or specific clinical mandates.
If information is unavailable or specific to the clinic, include: "Ask your clinic or provider if you need to bring anything else."`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['items'],
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed.items;
      }
    }
  } catch (err) {
    console.error('Error generating task preparation with Gemini:', err);
  }

  return defaultChecklist;
}

/**
 * FEATURE 7 — Voice Companion Q&A ("Talk to Saathi")
 */
export async function answerCompanionQuestion(params: {
  question: string;
  userName: string;
  medicines: Medicine[];
  appointments: Appointment[];
  tasks: Task[];
  trustedContact?: { name: string; relationship: string; phone: string };
}): Promise<string> {
  const { question, userName, medicines, appointments, tasks, trustedContact } = params;
  const q = question.toLowerCase().trim();

  const pendingMeds = medicines.filter((m) => m.status === 'pending');
  const pendingApts = appointments.filter((a) => !a.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Fast direct intent matching for zero-latency responses
  if (q.includes('what do i have today') || q.includes('today') || q.includes('my day') || q.includes('schedule')) {
    const parts: string[] = [];
    if (pendingMeds.length > 0) {
      parts.push(`You have ${pendingMeds.length} medicine scheduled: ${pendingMeds.map((m) => `${m.name} at ${m.time}`).join(' and ')}.`);
    } else {
      parts.push('You have no pending medicines today.');
    }
    if (pendingApts.length > 0) {
      parts.push(`You have ${pendingApts[0].title} at ${pendingApts[0].dateTime}.`);
    }
    if (pendingTasks.length > 0) {
      parts.push(`You have a task to ${pendingTasks[0].title}.`);
    }
    return parts.join(' ') || 'You have nothing scheduled right now. Everything is clear!';
  }

  if (q.includes('medicine') || q.includes('medication') || q.includes('pill') || q.includes('tablet')) {
    if (pendingMeds.length === 0) {
      return 'All your medicines for today have already been marked as taken. Good job!';
    }
    return `Your upcoming medicine is ${pendingMeds[0].name} ${pendingMeds[0].dosage} at ${pendingMeds[0].time}. ${pendingMeds[0].instructions || ''}`;
  }

  if (q.includes('appointment') || q.includes('doctor') || q.includes('visit')) {
    if (pendingApts.length === 0) {
      return 'You have no doctor visits or appointments scheduled for today.';
    }
    return `You have ${pendingApts[0].title} at ${pendingApts[0].dateTime} at ${pendingApts[0].location}.`;
  }

  if (q.includes('task') || q.includes('to do') || q.includes('bill') || q.includes('chore')) {
    if (pendingTasks.length === 0) {
      return 'You have no pending tasks right now.';
    }
    return `Your next task is: ${pendingTasks[0].title}, due ${pendingTasks[0].dueDate}.`;
  }

  if (q.includes('call') || q.includes('contact') || q.includes('son') || q.includes('daughter') || q.includes('family') || q.includes('help')) {
    if (trustedContact) {
      return `Your trusted contact is ${trustedContact.name} (${trustedContact.relationship}) at ${trustedContact.phone}. You can tap the Call button to dial them directly.`;
    }
    return 'You can reach your trusted contact or call local emergency services if you need immediate help.';
  }

  const ai = getGemini();
  if (!ai) {
    return `Hello ${userName}. You have ${pendingMeds.length} pending medicines and ${pendingApts.length} appointments today. How else can I help you?`;
  }

  try {
    const prompt = `Context:
User: ${userName}
Pending medicines: ${pendingMeds.map((m) => `${m.name} at ${m.time}`).join(', ') || 'None'}
Appointments: ${pendingApts.map((a) => `${a.title} at ${a.dateTime} (${a.location})`).join(', ') || 'None'}
Tasks: ${pendingTasks.map((t) => `${t.title} (${t.dueDate})`).join(', ') || 'None'}
Trusted contact: ${trustedContact ? `${trustedContact.name} (${trustedContact.relationship}) - ${trustedContact.phone}` : 'None'}

User voice query: "${question}"

Provide a direct, warm, concise 1-2 sentence spoken answer suitable for text-to-speech for an elderly person.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    if (response.text) {
      return response.text.trim();
    }
  } catch (err) {
    console.error('Error answering voice companion query with Gemini:', err);
  }

  return `I heard your question. You currently have ${pendingMeds.length} medicines and ${pendingApts.length} appointments on your schedule today.`;
}
