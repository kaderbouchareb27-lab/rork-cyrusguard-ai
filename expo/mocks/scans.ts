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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUri?: string;
}

export const mockScans: ScanResult[] = [
  {
    id: '1',
    date: '2026-02-23T10:30:00Z',
    riskScore: 87,
    riskLevel: 'high',
    sourceType: 'sms',
    summary: 'Message SMS frauduleux imitant une banque canadienne demandant de vérifier un compte.',
    summaryEn: 'Fraudulent SMS imitating a Canadian bank requesting account verification.',
    explanation: 'Ce message présente plusieurs caractéristiques typiques du phishing bancaire : URL raccourcie suspecte, urgence artificielle, et demande d\'informations personnelles.',
    explanationEn: 'This message presents several typical characteristics of bank phishing: suspicious shortened URL, artificial urgency, and request for personal information.',
    suspiciousElements: [
      'URL raccourcie non officielle',
      'Ton urgent et menaçant',
      'Fautes d\'orthographe',
      'Demande de données personnelles',
    ],
    suspiciousElementsEn: [
      'Unofficial shortened URL',
      'Urgent and threatening tone',
      'Spelling mistakes',
      'Request for personal data',
    ],
    reassuringElements: [
      'Logo de la banque présent',
    ],
    reassuringElementsEn: [
      'Bank logo present',
    ],
    advice: [
      'Ne cliquez pas sur le lien',
      'Contactez votre banque directement',
      'Signalez au CAFC (1-888-495-8501)',
    ],
    adviceEn: [
      'Do not click the link',
      'Contact your bank directly',
      'Report to CAFC (1-888-495-8501)',
    ],
  },
  {
    id: '2',
    date: '2026-02-22T15:45:00Z',
    riskScore: 42,
    riskLevel: 'medium',
    sourceType: 'email',
    summary: 'Email promotionnel avec certains éléments suspects mais provenant d\'un domaine partiellement légitime.',
    summaryEn: 'Promotional email with some suspicious elements but from a partially legitimate domain.',
    explanation: 'L\'email contient des offres trop belles pour être vraies mais le domaine semble légitime. Prudence recommandée.',
    explanationEn: 'The email contains offers too good to be true but the domain seems legitimate. Caution recommended.',
    suspiciousElements: [
      'Offre trop avantageuse',
      'Pression temporelle',
    ],
    suspiciousElementsEn: [
      'Offer too good to be true',
      'Time pressure',
    ],
    reassuringElements: [
      'Domaine email vérifié',
      'Mentions légales présentes',
      'Lien de désabonnement fonctionnel',
    ],
    reassuringElementsEn: [
      'Verified email domain',
      'Legal mentions present',
      'Functional unsubscribe link',
    ],
    advice: [
      'Vérifiez l\'offre sur le site officiel',
      'Ne partagez pas vos informations bancaires',
    ],
    adviceEn: [
      'Check the offer on the official website',
      'Do not share your banking information',
    ],
  },
  {
    id: '3',
    date: '2026-02-21T09:15:00Z',
    riskScore: 12,
    riskLevel: 'low',
    sourceType: 'website',
    summary: 'Site web légitime avec toutes les certifications de sécurité en place.',
    summaryEn: 'Legitimate website with all security certifications in place.',
    explanation: 'Ce site présente tous les indicateurs d\'un site légitime et sécurisé.',
    explanationEn: 'This site presents all indicators of a legitimate and secure website.',
    suspiciousElements: [],
    suspiciousElementsEn: [],
    reassuringElements: [
      'Certificat SSL valide',
      'Mentions légales complètes',
      'Politique de confidentialité détaillée',
      'Adresse physique vérifiable',
    ],
    reassuringElementsEn: [
      'Valid SSL certificate',
      'Complete legal mentions',
      'Detailed privacy policy',
      'Verifiable physical address',
    ],
    advice: [
      'Site sécurisé, vous pouvez naviguer en toute confiance',
    ],
    adviceEn: [
      'Secure site, you can browse with confidence',
    ],
  },
];

export const reportingOrganizations = {
  CA: [
    { name: 'Centre antifraude du Canada (CAFC)', nameEn: 'Canadian Anti-Fraud Centre (CAFC)', url: 'https://www.antifraudcentre-centreantifraude.ca', phone: '1-888-495-8501' },
  ],
  US: [
    { name: 'Federal Trade Commission (FTC)', nameEn: 'Federal Trade Commission (FTC)', url: 'https://reportfraud.ftc.gov', phone: '' },
    { name: 'Internet Crime Complaint Center (IC3)', nameEn: 'Internet Crime Complaint Center (IC3)', url: 'https://www.ic3.gov', phone: '' },
  ],
  FR: [
    { name: 'Cybermalveillance.gouv.fr', nameEn: 'Cybermalveillance.gouv.fr', url: 'https://www.cybermalveillance.gouv.fr', phone: '' },
    { name: 'Signal Spam', nameEn: 'Signal Spam', url: 'https://www.signal-spam.fr', phone: '' },
  ],
};

export const trendingScams = {
  CA: {
    fr: [
      'Faux messages Desjardins - "Activité suspecte sur votre compte"',
      'Arnaque Postes Canada - "Votre colis est en attente de frais"',
      'Fraude Hydro-Québec - "Votre compte sera suspendu"',
    ],
    en: [
      'Fake Desjardins messages - "Suspicious activity on your account"',
      'Canada Post scam - "Your package is pending fees"',
      'Hydro-Québec fraud - "Your account will be suspended"',
    ],
  },
  US: {
    fr: [
      'Arnaque IRS par téléphone',
      'Fraude aux cartes cadeaux',
      'Arnaque romance sur les apps de rencontre',
    ],
    en: [
      'IRS phone scam',
      'Gift card fraud',
      'Romance scam on dating apps',
    ],
  },
  FR: {
    fr: [
      'Arnaque au CPF (Compte Personnel de Formation)',
      'Faux conseillers bancaires par téléphone',
      'Arnaque à la vignette Crit\'Air',
    ],
    en: [
      'CPF scam (Personal Training Account)',
      'Fake bank advisors by phone',
      'Crit\'Air sticker scam',
    ],
  },
};

export interface AlertItem {
  id: string;
  date: string;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  severity: 'high' | 'medium';
  category: string;
}

export const quebecAlerts: AlertItem[] = [
  {
    id: 'alert-1',
    date: '2026-02-23',
    titleFr: 'Faux textos Desjardins en circulation',
    titleEn: 'Fake Desjardins texts circulating',
    descFr: 'Des SMS frauduleux imitant Desjardins demandent de "vérifier votre identité" via un lien suspect. Ne cliquez pas!',
    descEn: 'Fraudulent SMS imitating Desjardins asking to "verify your identity" via a suspicious link. Do not click!',
    severity: 'high',
    category: 'sms',
  },
  {
    id: 'alert-2',
    date: '2026-02-22',
    titleFr: 'Arnaque "Bonjour maman" par texto',
    titleEn: '"Hi mom" text scam',
    descFr: 'Des fraudeurs envoient des textos se faisant passer pour votre enfant depuis un nouveau numéro, demandant un virement urgent.',
    descEn: 'Scammers send texts pretending to be your child from a new number, requesting an urgent transfer.',
    severity: 'high',
    category: 'sms',
  },
  {
    id: 'alert-3',
    date: '2026-02-21',
    titleFr: 'Faux concours Tim Hortons sur Facebook',
    titleEn: 'Fake Tim Hortons contest on Facebook',
    descFr: 'Un faux concours promet une carte-cadeau de 500$ Tim Hortons. Le lien mène à un site de phishing qui vole vos données.',
    descEn: 'A fake contest promises a $500 Tim Hortons gift card. The link leads to a phishing site that steals your data.',
    severity: 'medium',
    category: 'social',
  },
  {
    id: 'alert-4',
    date: '2026-02-20',
    titleFr: 'Fausse facture Hydro-Québec par courriel',
    titleEn: 'Fake Hydro-Québec invoice by email',
    descFr: 'Des courriels frauduleux menacent de couper l\'électricité si vous ne payez pas immédiatement via un lien.',
    descEn: 'Fraudulent emails threaten to cut electricity if you don\'t pay immediately via a link.',
    severity: 'high',
    category: 'email',
  },
  {
    id: 'alert-5',
    date: '2026-02-19',
    titleFr: 'Arnaque Marketplace Facebook - faux PS5',
    titleEn: 'Facebook Marketplace scam - fake PS5',
    descFr: 'Des vendeurs frauduleux offrent des PS5 à prix cassés sur Marketplace. Ils demandent un virement Interac et disparaissent.',
    descEn: 'Fraudulent sellers offer PS5 at bargain prices on Marketplace. They request an Interac transfer and disappear.',
    severity: 'medium',
    category: 'social',
  },
];

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

export interface ReportedScam {
  id: string;
  type: string;
  description: string;
  date: string;
  location: string;
}

export const securityTipsByType = {
  employment: {
    fr: 'Ne payez jamais pour obtenir un emploi. Les vrais employeurs ne demandent pas d\'argent.',
    en: 'Never pay to get a job. Real employers don\'t ask for money.',
  },
  delivery: {
    fr: 'Vérifiez toujours le numéro de suivi directement sur le site officiel du transporteur.',
    en: 'Always verify the tracking number directly on the carrier\'s official website.',
  },
  banking: {
    fr: 'Votre banque ne vous demandera jamais votre mot de passe par SMS ou email.',
    en: 'Your bank will never ask for your password by SMS or email.',
  },
  government: {
    fr: 'Les organismes gouvernementaux ne menacent jamais par téléphone. Raccrochez et appelez le numéro officiel.',
    en: 'Government agencies never threaten by phone. Hang up and call the official number.',
  },
  crypto: {
    fr: 'Aucun investissement ne garantit des rendements fixes. Méfiez-vous des promesses de gains rapides.',
    en: 'No investment guarantees fixed returns. Beware of promises of quick gains.',
  },
  romance: {
    fr: 'N\'envoyez jamais d\'argent à quelqu\'un que vous n\'avez jamais rencontré en personne.',
    en: 'Never send money to someone you\'ve never met in person.',
  },
  giftcard: {
    fr: 'Aucune entreprise ou organisme légitime n\'accepte de paiement par cartes cadeaux.',
    en: 'No legitimate business or organization accepts payment by gift cards.',
  },
  techsupport: {
    fr: 'Microsoft, Apple et Google ne vous appellent jamais pour des problèmes techniques.',
    en: 'Microsoft, Apple and Google never call you about technical problems.',
  },
};
