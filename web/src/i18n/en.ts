import type { Translation } from './pl.ts';

export const en: Translation = {
  picker: {
    title: 'Talk with Lulu',
    targetLanguage: 'Language',
    level: 'Level',
    next: 'Next',
  },
  topic: {
    title: 'What do you want to talk about?',
    suggestions: 'Suggestions',
    suggestOthers: 'Suggest others',
    own: 'Your topic',
    start: 'Start the conversation',
    starting: 'Starting…',
    failed: "Couldn't start the conversation. Is the server running?",
  },
  targetLanguage: {
    en: 'English',
    de: 'German',
  },
  level: {
    A1: 'beginner',
    A2: 'elementary',
    B1: 'intermediate',
    B2: 'upper intermediate',
    C1: 'advanced',
    C2: 'proficient',
  },
  category: {
    tense: 'tense',
    articles: 'articles',
    prepositions: 'prepositions',
    'word-order': 'word order',
    agreement: 'agreement',
    'word-choice': 'word choice',
    spelling: 'spelling',
    case: 'case',
    gender: 'gender',
    'verb-position': 'verb position',
    conjugation: 'conjugation',
    other: 'other',
  },
  chat: {
    newConversation: 'New conversation',
    placeholder: 'Write a message… (Enter sends, Shift+Enter adds a new line)',
    send: 'Send',
    typing: 'Lulu is typing…',
    resend: 'Send again',
    noMistakes: 'No mistakes',
  },
  error: {
    'invalid-tutor-reply': 'Lulu replied in the wrong format. Try again.',
    'model-unavailable': "Couldn't reach Lulu. Try again.",
    'conversation-not-found':
      'This conversation no longer exists because the server was restarted. Start a new one.',
    network: 'No connection to the server.',
    unexpected: 'Something went wrong. Try again.',
  },
};
