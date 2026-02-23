import { Platform } from 'react-native';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

const CYRUS_SYSTEM_PROMPT = `Tu es Cyrus, L'EXPERT #1 en détection de fraude et cybersécurité au Québec. Tu es un ancien enquêteur en fraude avec 15+ ans d'expérience. Tu parles en français québécois, de manière claire et accessible (pas trop technique). Tu es comme un grand frère qui protège l'utilisateur. Tu utilises le "tu" avec l'utilisateur pour rester proche. Ton ton est amical mais sérieux quand tu détectes un danger.

Tu connais TOUTES les arnaques courantes au Québec :
- Faux messages de Revenu Québec / ARC (Agence du revenu du Canada)
- Arnaques Hydro-Québec ("votre compte sera suspendu")
- Faux messages de Desjardins, RBC, BMO, TD, Banque Nationale
- Fraude au NAS (numéro d'assurance sociale)
- Arnaques sur Marketplace Facebook Québec (faux vendeurs, faux acheteurs)
- Faux messages de Postes Canada / Purolator ("votre colis est en attente")
- Arnaques à la SAAQ / RAMQ
- Fraude par texto "Bonjour maman/papa" (arnaque au proche en détresse)
- Arnaques emploi sur Kijiji et Facebook
- Faux tirages / concours de compagnies québécoises connues

Fraudes sur les réseaux sociaux (Facebook, Instagram, Messenger) :
- Messages qui demandent email, numéro de téléphone ou informations personnelles
- Demandes de spécimen de chèque ou photo de carte bancaire
- Faux concours ("Vous avez gagné un iPhone")
- Faux profils qui contactent en privé
- Arnaques sentimentales / romance scam
- Messages "Est-ce toi dans cette vidéo ?" avec lien piégé
- Fausses offres d'emploi
- Faux Marketplace (produits qui n'existent pas)
- Arnaques "J'ai besoin d'aide financière urgente" de faux amis
- Faux dons de charité
- Publicités frauduleuses (faux produits miracles, faux investissements)

Fraudes par SMS et email :
- Phishing bancaire (Desjardins, RBC, BMO, TD, Banque Nationale)
- Faux colis à récupérer (Postes Canada, Purolator, FedEx)
- Faux remboursements (ARC, Revenu Québec)
- Liens suspects raccourcis
- Faux avis de paiement Interac

Fraudes téléphoniques :
- Faux agents du gouvernement (ARC, police)
- Faux support technique Microsoft / Apple
- Appels robotisés menaçants
- Arnaque au "oui" (enregistrer ta voix)

Fraudes financières :
- Faux investissements crypto
- Pyramides de Ponzi
- Fraude par carte de crédit
- Vol d'identité
- Demandes de virement Western Union ou cartes prépayées
- Fraude à l'amour (demande d'argent après relation en ligne)
- Arnaque au prêt rapide

Quand tu analyses du contenu :
- Un faux SMS de livraison avec domaine suspect = 85-95 HIGH risk minimum
- Urgence + expéditeur inconnu + lien suspect = HIGH risk toujours
- Demande d'informations personnelles/bancaires = HIGH risk
- Donne un verdict clair : ✅ Sécuritaire / ⚠️ Suspect / 🚨 Arnaque détectée
- Explique POURQUOI c'est une arnaque avec des exemples concrets québécois
- Donne des conseils pratiques : bloquer, signaler, ne pas cliquer, contacter sa banque

Organismes québécois et canadiens que tu connais :
- Centre antifraude du Canada (1-888-495-8501)
- Sûreté du Québec
- Revenu Québec
- Office de la protection du consommateur
- Autorité des marchés financiers (AMF)

Quand l'utilisateur te parle en anglais, réponds en anglais mais garde ta personnalité d'expert québécois.
Quand l'utilisateur te parle en français, réponds en français québécois accessible.
Tu peux dire des choses comme "Envoie-moi une capture d'écran du message, je vais l'analyser pour toi" pour encourager l'utilisateur à utiliser le scan.`;

interface ChatMessageContent {
  type: string;
  text?: string;
  image_url?: { url: string; detail?: string };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ChatMessageContent[];
}

export interface ScanAnalysisResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  sourceType: 'sms' | 'email' | 'website' | 'url';
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
}

export interface UrlReview {
  source: string;
  rating: string;
  summary: string;
  summaryEn: string;
}

export interface UrlComplaint {
  source: string;
  description: string;
  descriptionEn: string;
}

export interface UrlAnalysisResult {
  score: number;
  ssl: boolean;
  domainAge: string;
  legalMentions: boolean;
  privacyPolicy: boolean;
  termsOfService: boolean;
  physicalAddress: boolean;
  redirects: number;
  verdict: string;
  verdictEn: string;
  verdictEmoji: string;
  isOnlineStore: boolean;
  reputation: {
    trustScore: number;
    positiveReviews: number;
    negativeReviews: number;
    summary: string;
    summaryEn: string;
    reviews: UrlReview[];
  };
  complaints: {
    total: number;
    items: UrlComplaint[];
    summary: string;
    summaryEn: string;
  };
  business: {
    name: string;
    registered: boolean;
    hasContact: boolean;
    address: string;
    phone: string;
    summary: string;
    summaryEn: string;
  };
  onlineStore: {
    realisticPrices: boolean;
    returnPolicy: boolean;
    securePayment: boolean;
    brandCopying: boolean;
    summary: string;
    summaryEn: string;
  } | null;
  personalizedAdvice: string[];
  personalizedAdviceEn: string[];
}

async function callOpenAI(messages: ChatMessage[], maxTokens: number = 1500): Promise<string> {
  console.log('[OpenAI] Calling API with', messages.length, 'messages');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('[OpenAI] API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[OpenAI] Response received, tokens used:', data.usage?.total_tokens);
  return data.choices[0]?.message?.content ?? '';
}

async function imageUriToBase64(uri: string): Promise<string> {
  console.log('[OpenAI] Converting image URI to base64, platform:', Platform.OS);
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] ?? '';
        console.log('[OpenAI] Base64 conversion complete, length:', base64.length);
        resolve(base64);
      };
      reader.onerror = (err) => {
        console.log('[OpenAI] FileReader error:', err);
        reject(new Error('Failed to convert image to base64'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.log('[OpenAI] imageUriToBase64 error:', error);
    throw new Error('Failed to read image for analysis');
  }
}

export async function analyzeImage(imageUri: string, language: string, base64Data?: string): Promise<ScanAnalysisResult> {
  console.log('[OpenAI] Starting image analysis, language:', language);
  console.log('[OpenAI] API key present:', !!OPENAI_API_KEY);
  console.log('[OpenAI] Base64 data provided directly:', !!base64Data);

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  let base64: string;
  if (base64Data) {
    base64 = base64Data;
  } else {
    base64 = await imageUriToBase64(imageUri);
  }

  if (!base64 || base64.length < 100) {
    console.log('[OpenAI] Base64 data is too short or empty, length:', base64?.length);
    throw new Error('Failed to read image data');
  }

  console.log('[OpenAI] Base64 image size:', base64.length, 'chars');
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  const systemPrompt = `${CYRUS_SYSTEM_PROMPT}

You are analyzing a screenshot sent by a user. Extract ALL text from the image and analyze it for fraud indicators.

You MUST respond with a valid JSON object and NOTHING else. No markdown, no code blocks, just pure JSON.

The JSON must have this exact structure:
{
  "riskScore": <number 0-100>,
  "riskLevel": "<low|medium|high>",
  "sourceType": "<sms|email|website|url>",
  "summary": "<French summary>",
  "summaryEn": "<English summary>",
  "explanation": "<detailed French explanation>",
  "explanationEn": "<detailed English explanation>",
  "suspiciousElements": ["<French element 1>", ...],
  "suspiciousElementsEn": ["<English element 1>", ...],
  "reassuringElements": ["<French element 1>", ...],
  "reassuringElementsEn": ["<English element 1>", ...],
  "advice": ["<French advice 1>", ...],
  "adviceEn": ["<English advice 1>", ...]
}

Risk scoring rules:
- HIGH (70-100): Clear phishing/scam indicators (fake domains, urgency, suspicious links, impersonation, grammar errors)
- MEDIUM (40-69): Suspicious but not confirmed
- LOW (0-39): Appears legitimate

A fake delivery SMS with suspicious domain = 85-95 HIGH risk minimum.
Urgency + unknown sender + suspicious link = HIGH risk always.
Always include Quebec/Canada-specific reporting organizations in advice:
- Centre antifraude du Canada (1-888-495-8501)
- Sûreté du Québec
- Office de la protection du consommateur
- Autorité des marchés financiers (AMF)

Give a clear verdict: ✅ Safe / ⚠️ Suspicious / 🚨 Scam detected
Explain WHY with concrete Quebec-specific examples when relevant.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: dataUrl, detail: 'high' },
        },
        {
          type: 'text',
          text: language === 'fr'
            ? 'Analyse cette image pour détecter des signes de fraude ou d\'arnaque. Retourne uniquement le JSON.'
            : 'Analyze this image to detect signs of fraud or scam. Return only the JSON.',
        },
      ],
    },
  ];

  const response = await callOpenAI(messages, 2000);
  console.log('[OpenAI] Image analysis raw response:', response.substring(0, 200));

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned) as ScanAnalysisResult;

    if (result.riskScore < 0 || result.riskScore > 100) {
      result.riskScore = Math.max(0, Math.min(100, result.riskScore));
    }
    if (!['low', 'medium', 'high'].includes(result.riskLevel)) {
      result.riskLevel = result.riskScore >= 70 ? 'high' : result.riskScore >= 40 ? 'medium' : 'low';
    }
    if (!['sms', 'email', 'website', 'url'].includes(result.sourceType)) {
      result.sourceType = 'sms';
    }

    return result;
  } catch (parseError) {
    console.log('[OpenAI] JSON parse error:', parseError);
    throw new Error('Failed to parse AI analysis response');
  }
}

export async function analyzeUrl(url: string, language: string): Promise<UrlAnalysisResult> {
  console.log('[OpenAI] Starting deep URL analysis for:', url);

  const systemPrompt = `${CYRUS_SYSTEM_PROMPT}

You are performing a DEEP, COMPREHENSIVE analysis of a URL. Go far beyond simple scam detection.
Analyze the website's reliability, reputation, business legitimacy, complaints history, and if it's an online store, analyze pricing and policies.

Use your knowledge of known websites, brands, scam patterns, and consumer protection databases.

You MUST respond with a valid JSON object and NOTHING else. No markdown, no code blocks, just pure JSON.

The JSON must have this exact structure:
{
  "score": <number 0-100, where 100 is most trustworthy>,
  "ssl": <boolean - does the URL use HTTPS>,
  "domainAge": "<estimated age string, e.g. '5+ years' or 'Less than 1 year' or 'Unknown'>",
  "legalMentions": <boolean>,
  "privacyPolicy": <boolean>,
  "termsOfService": <boolean>,
  "physicalAddress": <boolean>,
  "redirects": <number of suspected redirects>,
  "verdict": "<French verdict - clear and detailed>",
  "verdictEn": "<English verdict - clear and detailed>",
  "verdictEmoji": "<one of: ✅ or ⚠️ or 🚨>",
  "isOnlineStore": <boolean - is this an e-commerce/shopping site>,
  "reputation": {
    "trustScore": <number 0-100>,
    "positiveReviews": <estimated percentage 0-100>,
    "negativeReviews": <estimated percentage 0-100>,
    "summary": "<French summary of reputation>",
    "summaryEn": "<English summary of reputation>",
    "reviews": [
      {
        "source": "<platform name e.g. Trustpilot, Google, BBB>",
        "rating": "<rating e.g. 4.2/5 or 2.1/5>",
        "summary": "<French short summary of reviews on this platform>",
        "summaryEn": "<English short summary>"
      }
    ]
  },
  "complaints": {
    "total": <estimated number of complaints found>,
    "items": [
      {
        "source": "<organization or platform name>",
        "description": "<French description of complaint>",
        "descriptionEn": "<English description>"
      }
    ],
    "summary": "<French summary of complaints>",
    "summaryEn": "<English summary of complaints>"
  },
  "business": {
    "name": "<business name if known, or 'Inconnu' / 'Unknown'>",
    "registered": <boolean - is the business registered/legitimate>,
    "hasContact": <boolean - real contact info available>,
    "address": "<address if known or 'Non disponible' / 'Not available'>",
    "phone": "<phone if known or 'Non disponible' / 'Not available'>",
    "summary": "<French summary of business legitimacy>",
    "summaryEn": "<English summary>"
  },
  "onlineStore": <null if not an online store, otherwise: {
    "realisticPrices": <boolean>,
    "returnPolicy": <boolean>,
    "securePayment": <boolean>,
    "brandCopying": <boolean - suspected of copying known brands>,
    "summary": "<French summary of store analysis>",
    "summaryEn": "<English summary>"
  }>,
  "personalizedAdvice": ["<French advice 1>", "<French advice 2>", ...],
  "personalizedAdviceEn": ["<English advice 1>", "<English advice 2>", ...]
}

Scoring rules:
- Known legitimate, well-established domains (google.com, amazon.ca, etc.) = 80-95
- Well-known but with some complaints = 60-79
- Unknown but not suspicious = 45-65
- Suspicious patterns (misspellings, weird TLDs, too many subdomains) = 10-35
- Fake domains mimicking real ones (amaz0n.com, g00gle.com) = 5-20
- Known scam sites = 0-10

VerdictEmoji rules:
- ✅ for score >= 65 (Site fiable / Reliable site)
- ⚠️ for score 35-64 (À utiliser avec prudence / Use with caution)
- 🚨 for score < 35 (Site dangereux / Dangerous site)

For reputation, use your knowledge of the site's reviews on Trustpilot, Google Reviews, BBB, etc.
For complaints, check knowledge of complaints on Bureau de la concurrence (Canada), Office de la protection du consommateur (Québec), Centre antifraude du Canada, BBB, Trustpilot.
For business info, check if the company is known, registered, has real contact info.
For online stores, check if prices are realistic, return policies exist, payment is secure, and if they copy known brands.

Personalized advice should be specific to what you found. Example: "Ce site a plusieurs plaintes pour non-livraison, nous te recommandons de ne pas commander ici."
Provide 3-5 personalized advice items based on the analysis.

Be thorough and detailed. This is a comprehensive site investigation.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: language === 'fr'
        ? `Fais une analyse approfondie de cette URL : ${url}. Vérifie la fiabilité, la réputation, les avis, les plaintes, les informations de l'entreprise, et si c'est une boutique en ligne, analyse les prix et politiques. Retourne uniquement le JSON.`
        : `Perform a deep analysis of this URL: ${url}. Check reliability, reputation, reviews, complaints, business information, and if it's an online store, analyze pricing and policies. Return only the JSON.`,
    },
  ];

  const response = await callOpenAI(messages, 3000);
  console.log('[OpenAI] Deep URL analysis raw response:', response.substring(0, 300));

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned) as UrlAnalysisResult;
    console.log('[OpenAI] Deep URL analysis parsed, score:', result.score);
    return result;
  } catch (parseError) {
    console.log('[OpenAI] URL JSON parse error:', parseError);
    throw new Error('Failed to parse URL analysis response');
  }
}

export async function sendChatMessage(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  language: string,
): Promise<string> {
  console.log('[OpenAI] Sending chat message, history length:', conversationHistory.length);

  const langInstruction = language === 'fr'
    ? 'L\'utilisateur parle français. Réponds en français.'
    : 'The user speaks English. Respond in English.';

  const messages: ChatMessage[] = [
    { role: 'system', content: `${CYRUS_SYSTEM_PROMPT}\n\n${langInstruction}` },
    ...conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await callOpenAI(messages, 1000);
  return response;
}

export async function sendScanChatMessage(
  userMessage: string,
  scanContext: {
    riskScore: number;
    riskLevel: string;
    sourceType: string;
    summary: string;
    suspiciousElements: string[];
    reassuringElements: string[];
    advice: string[];
  },
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  language: string,
): Promise<string> {
  console.log('[OpenAI] Sending scan chat message, scan score:', scanContext.riskScore);

  const langInstruction = language === 'fr'
    ? 'L\'utilisateur parle français. Réponds en français.'
    : 'The user speaks English. Respond in English.';

  const scanInfo = `
Scan context:
- Risk Score: ${scanContext.riskScore}/100
- Risk Level: ${scanContext.riskLevel}
- Source Type: ${scanContext.sourceType}
- Summary: ${scanContext.summary}
- Suspicious Elements: ${scanContext.suspiciousElements.join(', ')}
- Reassuring Elements: ${scanContext.reassuringElements.join(', ')}
- Advice given: ${scanContext.advice.join(', ')}
`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${CYRUS_SYSTEM_PROMPT}\n\n${langInstruction}\n\nYou are discussing a specific scan result with the user. Here is the scan context:\n${scanInfo}\n\nAnswer the user's questions about this specific scan. Be detailed, educational, and provide actionable advice.`,
    },
    ...conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await callOpenAI(messages, 1000);
  return response;
}
