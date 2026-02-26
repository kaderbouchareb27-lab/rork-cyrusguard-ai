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

interface FetchedSiteData {
  homepage: string | null;
  legalMentions: string | null;
  privacyPolicy: string | null;
  terms: string | null;
  contact: string | null;
  ssl: boolean;
  redirectCount: number;
  fetchError: string | null;
}

interface SafeFetchResult {
  success: boolean;
  statusCode: number | null;
  redirectCount: number;
  hasSSL: boolean;
  finalUrl: string;
  contentSnippet: string | null;
  error: string | null;
}

async function fetchUrlSafely(url: string): Promise<SafeFetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    console.log('[Fetch] Fetching safely:', normalizedUrl);
    const response = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    const text = await response.text();
    const stripped = text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const snippet = stripped.substring(0, 3000);
    console.log('[Fetch] Got content, length:', snippet.length, 'status:', response.status);

    return {
      success: true,
      statusCode: response.status,
      redirectCount: response.redirected ? 1 : 0,
      hasSSL: normalizedUrl.startsWith('https'),
      finalUrl: response.url,
      contentSnippet: snippet,
      error: null,
    };
  } catch (err: any) {
    clearTimeout(timeout);
    console.log('[Fetch] Error:', err?.message);
    return {
      success: false,
      statusCode: null,
      redirectCount: 0,
      hasSSL: url.includes('https'),
      finalUrl: url,
      contentSnippet: null,
      error: err?.message || 'Fetch failed',
    };
  }
}

async function fetchPageContent(pageUrl: string, maxLength: number = 3000): Promise<string | null> {
  const result = await fetchUrlSafely(pageUrl);
  if (!result.success || !result.contentSnippet) return null;
  return result.contentSnippet.substring(0, maxLength);
}

interface EnhancedSiteData extends FetchedSiteData {
  homepageFetch: SafeFetchResult;
  statusCode: number | null;
  finalUrl: string;
}

async function fetchSiteData(url: string): Promise<EnhancedSiteData> {
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  let baseUrl: string;
  try {
    const parsed = new URL(normalizedUrl);
    baseUrl = `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    baseUrl = normalizedUrl;
  }

  console.log('[SiteData] Fetching site data for:', baseUrl);

  const homepageFetch = await fetchUrlSafely(normalizedUrl);

  const legalPaths = [
    '/mentions-legales', '/legal', '/legal-notice', '/mentions_legales',
  ];
  const privacyPaths = [
    '/politique-de-confidentialite', '/privacy', '/privacy-policy', '/politique-confidentialite',
  ];
  const termsPaths = [
    '/conditions-utilisation', '/terms', '/terms-of-service', '/tos', '/cgu', '/conditions-generales',
  ];
  const contactPaths = [
    '/contact', '/a-propos', '/about', '/about-us', '/nous-contacter', '/contactez-nous',
  ];

  async function tryPaths(paths: string[]): Promise<string | null> {
    for (const path of paths) {
      const content = await fetchPageContent(baseUrl + path, 2000);
      if (content && content.length > 50) return content;
    }
    return null;
  }

  const [legalMentions, privacyPolicy, terms, contact] = await Promise.all([
    tryPaths(legalPaths),
    tryPaths(privacyPaths),
    tryPaths(termsPaths),
    tryPaths(contactPaths),
  ]);

  return {
    homepage: homepageFetch.contentSnippet,
    legalMentions,
    privacyPolicy,
    terms,
    contact,
    ssl: homepageFetch.hasSSL,
    redirectCount: homepageFetch.redirectCount,
    fetchError: homepageFetch.error,
    homepageFetch,
    statusCode: homepageFetch.statusCode,
    finalUrl: homepageFetch.finalUrl,
  };
}

export async function analyzeUrl(url: string, language: string): Promise<UrlAnalysisResult> {
  console.log('[OpenAI] Starting deep URL analysis for:', url);

  const siteData = await fetchSiteData(url);
  console.log('[OpenAI] Site data fetched - success:', siteData.homepageFetch.success, 'status:', siteData.statusCode, 'homepage:', !!siteData.homepage, 'legal:', !!siteData.legalMentions, 'privacy:', !!siteData.privacyPolicy, 'terms:', !!siteData.terms, 'contact:', !!siteData.contact);

  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  let parsedDomain = '';
  let parsedTld = '';
  try {
    const parsed = new URL(normalizedUrl);
    parsedDomain = parsed.hostname;
    const parts = parsed.hostname.split('.');
    parsedTld = parts.length > 1 ? '.' + parts[parts.length - 1] : '';
  } catch {
    parsedDomain = normalizedUrl;
  }

  const urlLength = normalizedUrl.length;
  const subdomainCount = parsedDomain.split('.').length;
  const hasExcessiveDashes = (parsedDomain.match(/-/g) || []).length > 3;
  const hasDigitsInDomain = /\d/.test(parsedDomain.replace(/\.[^.]+$/, ''));
  const suspiciousTlds = ['.xyz', '.top', '.click', '.buzz', '.tk', '.ml', '.ga', '.cf', '.gq', '.pw', '.cc', '.icu'];
  const isSuspiciousTld = suspiciousTlds.includes(parsedTld.toLowerCase());
  const suspiciousKeywords = ['login', 'verify', 'secure', 'update', 'confirm', 'free', 'winner', 'prize', 'urgent', 'account-verify', 'signin'];
  const hasSuspiciousKeywords = suspiciousKeywords.some(kw => normalizedUrl.toLowerCase().includes(kw));

  const knownDomains = [
    'desjardins.com', 'td.com', 'bmo.com', 'rbc.com', 'bnc.ca', 'scotiabank.com',
    'canada.ca', 'quebec.ca', 'gouv.qc.ca', 'gc.ca',
    'google.com', 'apple.com', 'microsoft.com', 'amazon.ca', 'amazon.com',
    'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'tiktok.com',
    'paypal.com', 'netflix.com', 'spotify.com', 'youtube.com', 'github.com',
    'wikipedia.org', 'reddit.com', 'whatsapp.com',
  ];
  const isKnownDomain = knownDomains.some(d => parsedDomain === d || parsedDomain.endsWith('.' + d));

  const typosquatTargets = [
    'amazon', 'google', 'facebook', 'paypal', 'microsoft', 'apple', 'netflix',
    'desjardins', 'scotiabank', 'instagram', 'twitter', 'linkedin',
  ];
  let typosquatSimilarTo: string | null = null;
  if (!isKnownDomain) {
    const domainBase = parsedDomain.replace(/\.[^.]+$/, '').replace(/\./g, '');
    for (const target of typosquatTargets) {
      if (domainBase !== target && domainBase.includes(target.substring(0, target.length - 1))) {
        typosquatSimilarTo = target + '.com';
        break;
      }
      const replaced = domainBase.replace(/0/g, 'o').replace(/1/g, 'l').replace(/3/g, 'e');
      if (replaced === target && domainBase !== target) {
        typosquatSimilarTo = target + '.com';
        break;
      }
    }
  }

  const urlAnalysisSection = `
=== STEP 1: URL STRUCTURAL ANALYSIS (pre-computed) ===
Full URL: ${normalizedUrl}
Protocol: ${normalizedUrl.startsWith('https') ? 'HTTPS (secure)' : 'HTTP (NOT secure)'}
Domain: ${parsedDomain}
TLD: ${parsedTld}
URL length: ${urlLength} characters ${urlLength > 80 ? '(SUSPICIOUS - very long)' : '(normal)'}
Subdomain levels: ${subdomainCount} ${subdomainCount > 3 ? '(SUSPICIOUS - too many subdomains)' : ''}
Excessive dashes in domain: ${hasExcessiveDashes ? 'YES (SUSPICIOUS)' : 'No'}
Digits in domain name: ${hasDigitsInDomain ? 'YES (potentially suspicious)' : 'No'}
Suspicious TLD: ${isSuspiciousTld ? 'YES (' + parsedTld + ')' : 'No'}
Suspicious keywords in URL: ${hasSuspiciousKeywords ? 'YES' : 'No'}
Known/trusted domain: ${isKnownDomain ? 'YES' : 'No'}
Typosquatting detected: ${typosquatSimilarTo ? 'POSSIBLE - similar to ' + typosquatSimilarTo : 'No'}
=== END STEP 1 ===

=== STEP 2: FETCH RESULTS ===
Fetch success: ${siteData.homepageFetch.success}
HTTP Status: ${siteData.statusCode ?? 'N/A'}
SSL: ${siteData.ssl ? 'Yes (HTTPS)' : 'No (HTTP only)'}
Redirects detected: ${siteData.redirectCount}
Final URL after redirects: ${siteData.finalUrl}
Fetch error: ${siteData.fetchError ?? 'None'}

Homepage content (first ~3000 chars):
${siteData.homepage ? siteData.homepage : '[FAILED TO FETCH - site may be down or blocking requests]'}

Legal mentions page found: ${siteData.legalMentions ? 'YES' : 'NO'}
${siteData.legalMentions ? 'Content: ' + siteData.legalMentions : ''}

Privacy policy page found: ${siteData.privacyPolicy ? 'YES' : 'NO'}
${siteData.privacyPolicy ? 'Content: ' + siteData.privacyPolicy : ''}

Terms of service page found: ${siteData.terms ? 'YES' : 'NO'}
${siteData.terms ? 'Content: ' + siteData.terms : ''}

Contact/About page found: ${siteData.contact ? 'YES' : 'NO'}
${siteData.contact ? 'Content: ' + siteData.contact : ''}
=== END STEP 2 ===
`;

  const systemPrompt = `Tu es Cyrus, expert en cybersécurité et détection de fraude intégré dans CyrusGuard.

You are performing a DEEP analysis of a URL. We have pre-computed structural analysis and fetched real site content for you.

${urlAnalysisSection}

=== STEP 3: YOUR ANALYSIS TASK ===
Based on the STRUCTURAL ANALYSIS (Step 1) and FETCH RESULTS (Step 2) above, analyze and score the site.

SCORING RULES:
90-100: Known official domain + HTTPS + all pages verified
75-89: Legitimate site with HTTPS + legal pages + contact info
60-74: HTTPS + some pages present, no red flags
40-59: Missing info OR some suspicious elements (neutral, caution)
20-39: Multiple red flags (no SSL, typosquatting possible, suspicious domain)
0-19: Clear phishing, confirmed typosquatting, obvious scam

CRITICAL: An UNKNOWN site is NOT automatically dangerous.
- Unknown + HTTPS + no red flags = 50-60 (neutral)
- Unknown + red flags = lower based on severity
- Known trusted domain (exact match) = 80-90 automatic
- Domain SIMILAR to known but NOT exact = ALERT typosquatting, very low score

=== ABSOLUTE RULES ===
- reputation.dataAvailable = ALWAYS false (we did NOT check reviews)
- reputation.trustScore = ALWAYS null
- reputation.positiveReviews = ALWAYS null
- reputation.negativeReviews = ALWAYS null  
- reputation.reviews = ALWAYS empty array []
- complaints.dataAvailable = ALWAYS false (we did NOT check complaints)
- complaints.total = ALWAYS 0
- complaints.items = ALWAYS empty array []
- NEVER invent Trustpilot scores, Google reviews, or complaint data
- If content was NOT fetched (site down), content fields = null/false but don't assume it's dangerous
- Extract business info ONLY from fetched content (legal page, contact page, homepage)
- If a page was NOT found, do NOT claim it exists

VerdictEmoji rules:
- ✅ for score >= 65
- ⚠️ for score 35-64
- 🚨 for score < 35

You MUST respond with a valid JSON object and NOTHING else. No markdown, no code blocks, just pure JSON.

{
  "score": <0-100>,
  "ssl": <boolean>,
  "domainAge": "Inconnu",
  "legalMentions": <boolean>,
  "privacyPolicy": <boolean>,
  "termsOfService": <boolean>,
  "physicalAddress": <boolean>,
  "redirects": <number>,
  "verdict": "<French verdict>",
  "verdictEn": "<English verdict>",
  "verdictEmoji": "<emoji>",
  "isOnlineStore": <boolean>,
  "reputation": {
    "dataAvailable": false,
    "trustScore": null,
    "positiveReviews": null,
    "negativeReviews": null,
    "summary": "Aucune donnée de réputation vérifiable — vérifiez manuellement sur Trustpilot et Google.",
    "summaryEn": "No verifiable reputation data — check Trustpilot and Google manually.",
    "reviews": []
  },
  "complaints": {
    "dataAvailable": false,
    "total": 0,
    "items": [],
    "summary": "Aucune recherche de plaintes effectuée — vérifiez le Centre antifraude du Canada.",
    "summaryEn": "No complaint search performed — check the Canadian Anti-Fraud Centre."
  },
  "business": {
    "dataAvailable": <boolean>,
    "name": "<from content or 'Inconnu'>",
    "registered": null,
    "hasContact": <boolean>,
    "address": "<from content or 'Non disponible'>",
    "phone": "<from content or 'Non disponible'>",
    "summary": "<French>",
    "summaryEn": "<English>"
  },
  "onlineStore": null or { "realisticPrices": <bool>, "returnPolicy": <bool>, "securePayment": <bool>, "brandCopying": <bool>, "summary": "<FR>", "summaryEn": "<EN>" },
  "personalizedAdvice": ["<3-5 French tips based ONLY on verified data>"],
  "personalizedAdviceEn": ["<3-5 English tips based ONLY on verified data>"]
}

Always include advice to check Trustpilot/Google Reviews manually.
Always include advice about Centre antifraude du Canada (antifraudcentre.ca) if relevant.
Provide 3-5 advice items. Both FR and EN versions.`;

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
