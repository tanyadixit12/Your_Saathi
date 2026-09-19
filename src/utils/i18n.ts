export type SupportedLanguage = 'en' | 'hi' | 'hinglish';

export interface TranslationStrings {
  appName: string;
  appTagline: string;
  myDay: string;
  medicines: string;
  schedule: string;
  understand: string;
  staySafe: string;
  contacts: string;
  settings: string;
  talkToAasra: string;
  iNeedHelp: string;
  listen: string;
  refresh: string;
  goodMorning: string;
  whatMattersToday: string;
  dueToday: string;
  taken: string;
  markAsTaken: string;
  viewAllMedicines: string;
  upcoming: string;
  completed: string;
  thingsToDo: string;
  markDone: string;
  checkAMessage: string;
  helpMeUnderstand: string;
  readAloud: string;
  explainMoreSimply: string;
  wasThisHelpful: string;
  yesHelpful: string;
  simplifiedTitle: string;
  safetyTitle: string;
  warningSigns: string;
  whatToDoNow: string;
  callContact: string;
  emergencyNotice: string;
  proactiveReminder: string;
  yesRemindMe: string;
  notNow: string;
  textSize: string;
  highContrast: string;
  reducedMotion: string;
  language: string;
}

export const translations: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    appName: 'Aasra',
    appTagline: 'Your trusted companion for everyday life',
    myDay: 'My Day',
    medicines: 'Medicines',
    schedule: 'Schedule',
    understand: 'Understand',
    staySafe: 'Stay Safe',
    contacts: 'Contacts',
    settings: 'Settings',
    talkToAasra: 'Talk to Aasra',
    iNeedHelp: 'I Need Help',
    listen: 'Listen',
    refresh: 'Refresh',
    goodMorning: 'GOOD MORNING',
    whatMattersToday: 'Here is what matters today.',
    dueToday: 'Due Today',
    taken: 'Taken',
    markAsTaken: '✓ Mark as taken',
    viewAllMedicines: 'View all medicines',
    upcoming: 'Upcoming',
    completed: 'Completed',
    thingsToDo: 'Things to Do',
    markDone: 'Mark Done',
    checkAMessage: 'Check a Message',
    helpMeUnderstand: 'Help me understand something',
    readAloud: 'Read Aloud',
    explainMoreSimply: 'Explain More Simply',
    wasThisHelpful: 'Was this easy to understand?',
    yesHelpful: 'Yes, I understand',
    simplifiedTitle: 'Plain Language Breakdown',
    safetyTitle: 'Is This Safe? (Scam Checker)',
    warningSigns: 'Possible Warning Signs',
    whatToDoNow: 'What Should I Do Now?',
    callContact: 'Call Trusted Contact',
    emergencyNotice: 'For medical emergencies, please call local emergency services immediately.',
    proactiveReminder: 'Would you like a gentle reminder beforehand?',
    yesRemindMe: 'Yes, remind me',
    notNow: 'Not now',
    textSize: 'Text Size',
    highContrast: 'High Contrast',
    reducedMotion: 'Reduced Motion',
    language: 'Language',
  },
  hi: {
    appName: 'आसरा (Aasra)',
    appTagline: 'दैनिक जीवन के लिए आपका सच्चा साथी',
    myDay: 'मेरा दिन',
    medicines: 'दवाइयां',
    schedule: 'कार्यक्रम',
    understand: 'समझें',
    staySafe: 'सुरक्षित रहें',
    contacts: 'संपर्क',
    settings: 'सेटिंग्स',
    talkToAasra: 'आसरा से बात करें',
    iNeedHelp: 'मुझे मदद चाहिए',
    listen: 'सुनें',
    refresh: 'ताज़ा करें',
    goodMorning: 'सुप्रभात',
    whatMattersToday: 'आज के लिए आपकी मुख्य जानकारी।',
    dueToday: 'आज लेना है',
    taken: 'ले ली गई',
    markAsTaken: '✓ दवाई ले ली',
    viewAllMedicines: 'सभी दवाइयां देखें',
    upcoming: 'आने वाला',
    completed: 'पूर्ण',
    thingsToDo: 'आज के काम',
    markDone: 'पूरा हुआ',
    checkAMessage: 'संदेश की जांच करें',
    helpMeUnderstand: 'कुछ समझने में मदद करें',
    readAloud: 'बोलकर सुनाएं',
    explainMoreSimply: 'और सरल शब्दों में समझाएं',
    wasThisHelpful: 'क्या यह आसानी से समझ आया?',
    yesHelpful: 'हाँ, समझ आ गया',
    simplifiedTitle: 'सरल भाषा में विवरण',
    safetyTitle: 'क्या यह संदेश सुरक्षित है?',
    warningSigns: 'संभावित चेतावनी संकेत',
    whatToDoNow: 'अब मुझे क्या करना चाहिए?',
    callContact: 'परिवार को कॉल करें',
    emergencyNotice: 'किसी आपात स्थिति में कृपया तुरंत आपातकालीन सेवा को कॉल करें।',
    proactiveReminder: 'क्या आप चाहते हैं कि हम आपको पहले याद दिलाएं?',
    yesRemindMe: 'हाँ, याद दिलाएं',
    notNow: 'अभी नहीं',
    textSize: 'अक्षर का आकार',
    highContrast: 'हाई कॉन्ट्रास्ट',
    reducedMotion: 'धीमी गति',
    language: 'भाषा',
  },
  hinglish: {
    appName: 'Aasra',
    appTagline: 'Aapka trusted daily companion',
    myDay: 'Mera Din',
    medicines: 'Medicines',
    schedule: 'Schedule',
    understand: 'Understand',
    staySafe: 'Stay Safe',
    contacts: 'Contacts',
    settings: 'Settings',
    talkToAasra: 'Aasra se baat karein',
    iNeedHelp: 'Help Chahiye',
    listen: 'Sunein',
    refresh: 'Refresh karein',
    goodMorning: 'GOOD MORNING',
    whatMattersToday: 'Aaj ke zaroori kaam aur schedule.',
    dueToday: 'Aaj lena hai',
    taken: 'Le li',
    markAsTaken: '✓ Medicine le li',
    viewAllMedicines: 'Saari medicines dekhein',
    upcoming: 'Aane wala',
    completed: 'Complete',
    thingsToDo: 'Zaroori Kaam',
    markDone: 'Done karein',
    checkAMessage: 'Message check karein',
    helpMeUnderstand: 'Samajhne mein help karein',
    readAloud: 'Bol kar sunayein',
    explainMoreSimply: 'Aur aasan bhasha mein samjhayein',
    wasThisHelpful: 'Kya ye samajh mein aaya?',
    yesHelpful: 'Haan, samajh aa gaya',
    simplifiedTitle: 'Simple Words mein Details',
    safetyTitle: 'Kya ye message safe hai?',
    warningSigns: 'Possible Warning Signs',
    whatToDoNow: 'Ab kya karna chahiye?',
    callContact: 'Trusted Contact ko call karein',
    emergencyNotice: 'Emergency hone par please local emergency number par call karein.',
    proactiveReminder: 'Kya aapko pehle reminder bhejein?',
    yesRemindMe: 'Haan, remind karein',
    notNow: 'Abhi nahi',
    textSize: 'Text Size',
    highContrast: 'High Contrast',
    reducedMotion: 'Reduced Motion',
    language: 'Language',
  },
};
