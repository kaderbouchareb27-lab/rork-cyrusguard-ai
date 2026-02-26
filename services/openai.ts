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
    trustScore: number | null;
    positiveReviews: number | null;
    negativeReviews: number | null;
    summary: string;
    summaryEn: string;
    reviews: UrlReview[];
    dataAvailable: boolean;
  } | null;
  complaints: {
    total: number;
    items: UrlComplaint[];
    summary: string;
    summaryEn: string;
    dataAvailable: boolean;
  } | null;
  business: {
    name: string;
    registered: boolean | null;
    hasContact: boolean;
    address: string;
    phone: string;
    summary: string;
    summaryEn: string;
    dataAvailable: boolean;
  } | null;
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

You are performing a DEEP, COMPREHENSIVE analysis of a URL.

=== CRITICAL ANTI-HALLUCINATION RULES ===
You MUST NEVER invent, fabricate, estimate, or hallucinate ANY data.
If you do not have CONFIRMED, VERIFIABLE information about something, you MUST indicate it is unavailable.
A false accusation against a legitimate site is as dangerous as missing a real scam.

ELEMENTS YOU CAN VERIFY WITH CERTAINTY (analyze these):
- SSL certificate: check if URL starts with https://
- Domain structure: check for suspicious patterns (misspellings, weird TLDs, excessive subdomains, typosquatting)
- Whether the site is a well-known, established brand or not
- Presence of standard pages (privacy policy, terms, legal mentions) — ONLY if you actually know the site
- Redirects: suspicious redirect patterns in the URL itself

ELEMENTS YOU MUST NEVER FABRICATE:
- Trustpilot ratings or scores (unless you are 100% certain the site has a Trustpilot profile and you know the real rating)
- Google Reviews ratings or counts
- BBB ratings or complaints
- Complaints to Bureau de la concurrence, Office de la protection du consommateur, Centre antifraude du Canada
- Percentage of positive/negative reviews without a real source
- Business registration status (unless you are certain)
- Physical addresses or phone numbers you don't actually know
- Domain age (unless you are certain — otherwise say "Inconnu" / "Unknown")

WHEN DATA IS NOT AVAILABLE:
- Set "dataAvailable": false in reputation, complaints, and business sections
- Set trustScore to null, positiveReviews to null, negativeReviews to null
- Set reviews to empty array []
- Set complaints total to 0 and items to empty array []
- Write in summary: "Aucune donnée vérifiable disponible" / "No verifiable data available"
- For business registered: use null if unknown
- NEVER invent a score, rating, or complaint count

SCORING RULES (score must reflect ONLY what you can verify):
- Well-known, established, legitimate domains (google.com, amazon.ca, desjardins.com, etc.) = 75-90
- Known sites with verified real complaints = 50-74 (adjust based on severity)
- Unknown sites with no suspicious technical indicators = 50-60 (neutral, not penalized for being unknown)
- Unknown sites with some suspicious indicators (new-looking domain, weird TLD) = 30-49
- Clearly suspicious patterns (typosquatting, impersonation, phishing indicators) = 10-30
- Known scam/phishing sites = 0-10

IMPORTANT: An unknown site is NOT automatically dangerous. Do NOT lower the score just because you have no data.
Lack of data = neutral, not negative. Only lower the score for ACTUAL red flags.

VerdictEmoji rules:
- ✅ for score >= 65 (Site fiable / Reliable site)
- ⚠️ for score 35-64 (À utiliser avec prudence / Use with caution)  
- 🚨 for score < 35 (Site dangereux / Dangerous site)

You MUST respond with a valid JSON object and NOTHING else. No markdown, no code blocks, just pure JSON.

The JSON must have this exact structure:
{
  "score": <number 0-100>,
  "ssl": <boolean>,
  "domainAge": "<ONLY if you are certain, otherwise 'Inconnu' / 'Unknown'>",
  "legalMentions": <boolean - ONLY true if you are certain the site has them>,
  "privacyPolicy": <boolean - ONLY true if you are certain>,
  "termsOfService": <boolean - ONLY true if you are certain>,
  "physicalAddress": <boolean - ONLY true if you are certain>,
  "redirects": <number - 0 if you cannot determine>,
  "verdict": "<French verdict - FACTUAL, based on what you actually know>",
  "verdictEn": "<English verdict - FACTUAL>",
  "verdictEmoji": "<✅ or ⚠️ or 🚨>",
  "isOnlineStore": <boolean>,
  "reputation": {
    "dataAvailable": <boolean - true ONLY if you have REAL verified review data>,
    "trustScore": <number or null if no real data>,
    "positiveReviews": <number or null if no real data>,
    "negativeReviews": <number or null if no real data>,
    "summary": "<French - state clearly if no data is available>",
    "summaryEn": "<English - state clearly if no data is available>",
    "reviews": [<ONLY include reviews from platforms where you KNOW the site has a REAL profile with REAL ratings. Empty array if unknown.>]
  },
  "complaints": {
    "dataAvailable": <boolean - true ONLY if you have REAL verified complaint data>,
    "total": <number - ONLY real complaints you are certain about, 0 if unknown>,
    "items": [<ONLY real, verified complaints. Empty array if none confirmed.>],
    "summary": "<French - state clearly if no data is available>",
    "summaryEn": "<English>"
  },
  "business": {
    "dataAvailable": <boolean - true ONLY if you have REAL verified business data>,
    "name": "<ONLY if you actually know it, otherwise 'Inconnu' / 'Unknown'>",
    "registered": <boolean or null if unknown>,
    "hasContact": <boolean - ONLY true if you are certain>,
    "address": "<ONLY if you actually know it, otherwise 'Non disponible' / 'Not available'>",
    "phone": "<ONLY if you actually know it, otherwise 'Non disponible' / 'Not available'>",
    "summary": "<French - state clearly what is known vs unknown>",
    "summaryEn": "<English>"
  },
  "onlineStore": <null if not an online store, otherwise: {
    "realisticPrices": <boolean>,
    "returnPolicy": <boolean>,
    "securePayment": <boolean>,
    "brandCopying": <boolean>,
    "summary": "<French>",
    "summaryEn": "<English>"
  }>,
  "personalizedAdvice": ["<French advice based ONLY on verified facts>"],
  "personalizedAdviceEn": ["<English advice based ONLY on verified facts>"]
}

Personalized advice should reflect what you ACTUALLY found. If you found nothing concerning, say so honestly.
If data is unavailable, advise the user to do their own research (check Trustpilot, Google Reviews, etc.) rather than making claims.
Provide 3-5 advice items.`;

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
