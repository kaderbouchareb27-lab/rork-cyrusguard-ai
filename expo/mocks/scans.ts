export type RiskLevel = 'low' | 'medium' | 'high';
export type SourceType = 'sms' | 'email' | 'website' | 'url' | 'phone' | 'social';

export interface ScanResult {
  id: string;
  date: string;
  riskScore: number;
  riskLevel: RiskLevel;
  sourceType: SourceType;
  summary: string;
  summaryEn: string;
  explanation: string;
  explanationEn: string;
  suspiciousElements: string[];
  suspiciousElementsEn: string[];
  reassuringElements: string[];
  reassuringElementsEn: string[];
  advice: string[];
  adviceEn: string[];
  imageUri?: string;
  url?: string;
}

export interface QuizQuestion {
  id: string;
  questionFr: string;
  questionEn: string;
  options: { fr: string; en: string; isCorrect: boolean }[];
  explanationFr: string;
  explanationEn: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    questionFr: 'Tu reçois un texto de Desjardins disant "Activité suspecte sur votre compte. Cliquez ici pour vérifier." Que fais-tu?',
    questionEn: 'You receive a text from Desjardins saying "Suspicious activity on your account. Click here to verify." What do you do?',
    options: [
      { fr: 'Je clique sur le lien pour vérifier', en: 'I click the link to verify', isCorrect: false },
      { fr: 'J\'appelle Desjardins directement au numéro officiel', en: 'I call Desjardins directly at the official number', isCorrect: true },
      { fr: 'Je réponds au texto pour demander plus d\'infos', en: 'I reply to the text asking for more info', isCorrect: false },
    ],
    explanationFr: 'Les banques ne demandent JAMAIS de cliquer sur un lien par texto. Appelle toujours ta banque au numéro au dos de ta carte.',
    explanationEn: 'Banks NEVER ask you to click a link via text. Always call your bank at the number on the back of your card.',
  },
  {
    id: 'q2',
    questionFr: 'Quelqu\'un sur Facebook Marketplace te demande de payer par virement Interac avant de voir le produit. C\'est normal?',
    questionEn: 'Someone on Facebook Marketplace asks you to pay by Interac transfer before seeing the product. Is this normal?',
    options: [
      { fr: 'Oui, c\'est courant et sécuritaire', en: 'Yes, it\'s common and safe', isCorrect: false },
      { fr: 'Non, c\'est un signe d\'arnaque classique', en: 'No, it\'s a classic scam sign', isCorrect: true },
      { fr: 'Ça dépend du montant', en: 'It depends on the amount', isCorrect: false },
    ],
    explanationFr: 'Ne paie JAMAIS avant d\'avoir vu et inspecté le produit en personne. Les virements Interac sont irréversibles!',
    explanationEn: 'NEVER pay before seeing and inspecting the product in person. Interac transfers are irreversible!',
  },
  {
    id: 'q3',
    questionFr: 'Tu reçois un appel de l\'"ARC" disant que tu as une dette et que la police va t\'arrêter. Que fais-tu?',
    questionEn: 'You receive a call from the "CRA" saying you have a debt and police will arrest you. What do you do?',
    options: [
      { fr: 'Je paie immédiatement pour éviter les problèmes', en: 'I pay immediately to avoid problems', isCorrect: false },
      { fr: 'Je demande leur numéro de badge', en: 'I ask for their badge number', isCorrect: false },
      { fr: 'Je raccroche. L\'ARC ne menace jamais par téléphone', en: 'I hang up. The CRA never threatens by phone', isCorrect: true },
    ],
    explanationFr: 'L\'ARC ne menace JAMAIS d\'arrestation par téléphone et ne demande jamais de paiement par cartes-cadeaux ou crypto.',
    explanationEn: 'The CRA NEVER threatens arrest by phone and never asks for payment by gift cards or crypto.',
  },
  {
    id: 'q4',
    questionFr: 'Un "ami" sur Messenger te demande ton numéro de téléphone pour "t\'inscrire à un concours". C\'est sûr?',
    questionEn: 'A "friend" on Messenger asks for your phone number to "sign you up for a contest." Is it safe?',
    options: [
      { fr: 'Oui, c\'est juste un concours', en: 'Yes, it\'s just a contest', isCorrect: false },
      { fr: 'Non, son compte est probablement piraté', en: 'No, their account is probably hacked', isCorrect: true },
      { fr: 'Oui si c\'est un vrai ami', en: 'Yes if it\'s a real friend', isCorrect: false },
    ],
    explanationFr: 'Les comptes piratés sont utilisés pour voler les infos de la liste d\'amis. Appelle ton ami directement pour vérifier.',
    explanationEn: 'Hacked accounts are used to steal info from the friends list. Call your friend directly to verify.',
  },
  {
    id: 'q5',
    questionFr: 'Tu reçois un texto : "Bonjour maman, j\'ai perdu mon cell. Mon nouveau numéro est le 438-xxx. Peux-tu m\'envoyer 200$?" Que fais-tu?',
    questionEn: 'You receive a text: "Hi mom, I lost my phone. My new number is 438-xxx. Can you send me $200?" What do you do?',
    options: [
      { fr: 'J\'envoie l\'argent, mon enfant a besoin d\'aide', en: 'I send the money, my child needs help', isCorrect: false },
      { fr: 'J\'appelle mon enfant à son ancien numéro pour vérifier', en: 'I call my child at their old number to verify', isCorrect: true },
      { fr: 'Je demande une preuve par photo', en: 'I ask for photo proof', isCorrect: false },
    ],
    explanationFr: 'C\'est l\'arnaque "Bonjour maman/papa" très répandue au Québec. Appelle TOUJOURS ton proche à son ancien numéro.',
    explanationEn: 'This is the "Hi mom/dad" scam very common in Quebec. ALWAYS call your loved one at their old number.',
  },
];
