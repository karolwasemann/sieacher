import type { Translation } from './pl.ts';

export const de: Translation = {
  picker: {
    title: 'Sprich mit Lulu',
    targetLanguage: 'Sprache',
    level: 'Niveau',
    next: 'Weiter',
  },
  topic: {
    title: 'Worüber möchtest du sprechen?',
    suggestions: 'Vorschläge',
    suggestOthers: 'Andere vorschlagen',
    own: 'Dein Thema',
    start: 'Gespräch beginnen',
    starting: 'Wird gestartet…',
    failed: 'Das Gespräch konnte nicht beginnen. Läuft der Server?',
  },
  targetLanguage: {
    en: 'Englisch',
    de: 'Deutsch',
  },
  level: {
    A1: 'Anfänger',
    A2: 'Grundkenntnisse',
    B1: 'Mittelstufe',
    B2: 'gute Mittelstufe',
    C1: 'fortgeschritten',
    C2: 'nahezu muttersprachlich',
  },
  category: {
    tense: 'Zeitform',
    articles: 'Artikel',
    prepositions: 'Präpositionen',
    'word-order': 'Satzstellung',
    agreement: 'Kongruenz',
    'word-choice': 'Wortwahl',
    spelling: 'Rechtschreibung',
    case: 'Kasus',
    gender: 'Genus',
    'verb-position': 'Verbstellung',
    conjugation: 'Konjugation',
    other: 'Sonstiges',
  },
  chat: {
    newConversation: 'Neues Gespräch',
    placeholder: 'Schreib eine Nachricht… (Enter sendet, Umschalt+Enter für neue Zeile)',
    send: 'Senden',
    typing: 'Lulu schreibt…',
    resend: 'Erneut senden',
    noMistakes: 'Keine Fehler',
  },
  error: {
    'invalid-tutor-reply': 'Lulu hat im falschen Format geantwortet. Versuch es noch einmal.',
    'model-unavailable': 'Lulu ist gerade nicht erreichbar. Versuch es noch einmal.',
    'conversation-not-found':
      'Dieses Gespräch gibt es nicht mehr, weil der Server neu gestartet wurde. Beginne ein neues.',
    network: 'Keine Verbindung zum Server.',
    unexpected: 'Etwas ist schiefgelaufen. Versuch es noch einmal.',
  },
};
