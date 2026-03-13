
import { generateText } from '@rork-ai/toolkit-sdk';
import type { Country } from '@/contexts/AppContext';
import { countryConfigs } from '@/constants/countries';

export type ContentType = 'sms' | 'url' | 'email' | 'phone' | 'social';

export interface ScanAnalysisResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  sourceType: 'sms' | 'email' | 'website' | 'url' | 'phone' | 'social';
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

export interface TextAnalysisInput {
  contentType: ContentType;
  text: string;
  phoneNumber?: string;
  platform?: string;
}

type TextPart = { type: 'text'; text: string };
type ImagePart = { type: 'image'; image: string };
type UserMessage = { role: 'user'; content: string | (TextPart | ImagePart)[] };
type AssistantMessage = { role: 'assistant'; content: string | TextPart[] };
type ToolkitMessage = UserMessage | AssistantMessage;

const CYRUS_BASE_PROMPT = `Tu es Cyrus, un EXPERT mondial en détection de fraude et cybersécurité. Tu as 15+ ans d'expérience en enquête de fraude. Tu es comme un grand frère qui protège l'utilisateur. Ton ton est amical mais sérieux quand tu détectes un danger.

Fraudes sur les réseaux sociaux (Facebook, Instagram, Messenger, TikTok) :
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

Fraudes financières universelles :
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
- Explique POURQUOI c'est une arnaque avec des exemples concrets
- Donne des conseils pratiques : bloquer, signaler, ne pas cliquer, contacter sa banque`;

const COUNTRY_PROMPTS: Record<Country, string> = {
  CA: `
Tu es spécialisé pour le CANADA (Québec). Tu parles en français québécois, de manière claire et accessible. Tu utilises le "tu".

Arnaques courantes au Canada :
- Faux messages de Revenu Québec / ARC (Agence du revenu du Canada)
- Arnaques Hydro-Québec ("votre compte sera suspendu")
- Faux messages de Desjardins, RBC, BMO, TD, Banque Nationale
- Fraude au NAS (numéro d'assurance sociale)
- Arnaques sur Marketplace Facebook Québec
- Faux messages de Postes Canada / Purolator
- Arnaques à la SAAQ / RAMQ
- Fraude par texto "Bonjour maman/papa"
- Arnaques emploi sur Kijiji et Facebook
- Faux tirages de compagnies québécoises connues
- Phishing bancaire (Desjardins, RBC, BMO, TD, Banque Nationale)
- Faux avis de paiement Interac
- Faux agents du gouvernement (ARC, police)
- Faux support technique Microsoft / Apple

Organismes de signalement :
- Centre antifraude du Canada (1-888-495-8501)
- Sûreté du Québec
- Revenu Québec
- Office de la protection du consommateur
- Autorité des marchés financiers (AMF)`,

  US: `
You specialize in the UNITED STATES. You speak clear, friendly American English. Use "you" and be approachable.

Common scams in the USA:
- IRS phone scams ("You owe back taxes, pay now or face arrest")
- Social Security number compromise scams
- Fake USPS / FedEx / UPS delivery texts
- Amazon account suspension emails
- Medicare/Medicaid fraud calls
- Student loan forgiveness scams
- Tech support scams (Microsoft, Apple, Geek Squad)
- Fake charity scams
- Romance scams on dating apps
- Cryptocurrency investment scams
- Gift card payment scams
- Fake job offers (work from home scams)
- Zelle/Venmo/CashApp payment scams
- Utility company threat scams (power shutoff)
- Car warranty extension robocalls
- Fake bank alerts (Chase, Bank of America, Wells Fargo, Citi)
- FBI/DEA impersonation calls

Reporting organizations:
- Federal Trade Commission (FTC) — ReportFraud.ftc.gov — 1-877-382-4357
- FBI Internet Crime Complaint Center (IC3) — ic3.gov
- AARP Fraud Watch Network — 877-908-3360
- State Attorney General's office
- Better Business Bureau (BBB)`,

  FR: `
Tu es spécialisé pour la FRANCE. Tu parles en français standard, de manière claire et accessible. Tu utilises le "vous" par défaut.

Arnaques courantes en France :
- Arnaque au CPF (Compte Personnel de Formation) — "Votre solde expire bientôt"
- Faux mails Ameli / Assurance Maladie — "Mettez à jour votre carte Vitale"
- Arnaque vignette Crit'Air — Faux sites officiels
- Faux conseillers bancaires par téléphone (spoofing)
- Arnaques impots.gouv.fr — "Remboursement en attente"
- Fausses factures EDF / Engie / Total
- Arnaque La Poste / Colissimo — "Votre colis est en attente de frais"
- Faux SMS de la CAF
- Arnaque au faux support technique
- Arnaques sur Le Bon Coin / Vinted
- Fraude aux virements bancaires SEPA
- Arnaque au faux RIB
- Faux PV de stationnement par SMS
- Arnaque au QR code (quishing)
- Faux concours de marques connues

Organismes de signalement :
- Cybermalveillance.gouv.fr
- Signal Spam (signal-spam.fr)
- Pharos (internet-signalement.gouv.fr)
- Info Escroqueries — 0 805 805 817 (appel gratuit)
- DGCCRF (Direction générale de la concurrence)`,
};

function getCyrusPrompt(country: Country): string {
  return CYRUS_BASE_PROMPT + COUNTRY_PROMPTS[country];
}

function getReportingAdvice(country: Country): string {
  const orgs = countryConfigs[country].reportingOrganizations;
  return orgs.map(o => `- ${o.name}${o.phone ? ' (' + o.phone + ')' : ''}`).join('\n');
}

export function cancelActiveRequests() {
  console.log('[AI] cancelActiveRequests called (no-op with toolkit)');
}

export async function pingOpenAI(): Promise<{ success: boolean; status?: number; error?: string; message?: string }> {
  console.log('[AI] === PING TEST START (via Rork Toolkit) ===');
  try {
    const result = await generateText({
      messages: [{ role: 'user', content: 'Say OK' }],
    });
    console.log('[AI] Ping result:', result?.substring(0, 50));
    return { success: true, message: 'Toolkit API is working' };
  } catch (err: any) {
    console.error('[AI] Ping failed:', err?.message);
    return { success: false, error: 'TOOLKIT_ERROR', message: err?.message };
  }
}

function parseJsonResponse<T>(response: string): T {
  const cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[AI] No JSON object found in response:', cleaned.substring(0, 200));
    throw new Error('No valid JSON found in AI response');
  }

  return JSON.parse(jsonMatch[0]) as T;
}

async function imageUriToBase64(uri: string): Promise<string> {
  console.log('[AI] Converting image to base64, uri prefix:', uri.substring(0, 30));
  try {
    if (uri.startsWith('data:')) {
      const parts = uri.split(',');
      if (parts[1] && parts[1].length > 100) {
        console.log('[AI] URI is already a data URL, extracting base64');
        return parts[1];
      }
    }

    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Failed to fetch image: HTTP ' + response.status);
    }
    const blob = await response.blob();
    console.log('[AI] Blob size:', blob.size, 'type:', blob.type);

    if (blob.size === 0) {
      throw new Error('Image blob is empty');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] ?? '';
        console.log('[AI] Base64 conversion complete, length:', base64.length);
        if (base64.length < 100) {
          reject(new Error('Base64 conversion produced empty result'));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert image to base64'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    console.error('[AI] imageUriToBase64 error:', error?.message);
    throw new Error('Failed to read image: ' + (error?.message || 'Unknown error'));
  }
}

export async function analyzeImage(
  imageUri: string,
  language: string,
  base64Data?: string,
  country: Country = 'CA',
  _mimeType?: string,
): Promise<ScanAnalysisResult> {
  console.log('[AI] Starting image analysis via Rork Toolkit');
  console.log('[AI] hasBase64:', !!base64Data, 'base64Len:', base64Data?.length ?? 0);

  let base64: string;
  if (base64Data && base64Data.length > 100) {
    base64 = base64Data;
    console.log('[AI] Using provided base64 data, length:', base64.length);
  } else {
    console.log('[AI] Converting from URI...');
    try {
      base64 = await imageUriToBase64(imageUri);
    } catch (convErr: any) {
      console.error('[AI] URI conversion failed:', convErr?.message);
      throw new Error('Failed to read image data: ' + (convErr?.message || 'Unknown'));
    }
  }

  if (!base64 || base64.length < 100) {
    throw new Error('Failed to read image data - image appears empty');
  }

  const MAX_BASE64_LENGTH = 1_500_000;
  if (base64.length > MAX_BASE64_LENGTH) {
    throw new Error('Image is too large for analysis. Please try with a smaller image.');
  }

  const reportingOrgs = getReportingAdvice(country);
  const systemPrompt = `${getCyrusPrompt(country)}

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
  "suspiciousElements": ["<French element 1>"],
  "suspiciousElementsEn": ["<English element 1>"],
  "reassuringElements": ["<French element 1>"],
  "reassuringElementsEn": ["<English element 1>"],
  "advice": ["<French advice 1>"],
  "adviceEn": ["<English advice 1>"]
}

Risk scoring rules:
- HIGH (70-100): Clear phishing/scam indicators (fake domains, urgency, suspicious links, impersonation, grammar errors)
- MEDIUM (40-69): Suspicious but not confirmed
- LOW (0-39): Appears legitimate

A fake delivery SMS with suspicious domain = 85-95 HIGH risk minimum.
Urgency + unknown sender + suspicious link = HIGH risk always.
Always include country-specific reporting organizations in advice:
${reportingOrgs}

Give a clear verdict: ✅ Safe / ⚠️ Suspicious / 🚨 Scam detected
Explain WHY with concrete country-specific examples when relevant.`;

  const userText = language === 'fr'
    ? 'Analyse cette image pour détecter des signes de fraude ou d\'arnaque. Retourne uniquement le JSON.'
    : 'Analyze this image to detect signs of fraud or scam. Return only the JSON.';

  const messages: ToolkitMessage[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: systemPrompt + '\n\n' + userText },
        { type: 'image', image: base64 },
      ],
    },
  ];

  console.log('[AI] Sending image analysis request to toolkit...');
  try {
    const response = await generateText({ messages });
    console.log('[AI] Image analysis response received, length:', response?.length);

    if (!response) {
      throw new Error('Empty response from AI service');
    }

    const result = parseJsonResponse<ScanAnalysisResult>(response);

    if (result.riskScore < 0 || result.riskScore > 100) {
      result.riskScore = Math.max(0, Math.min(100, result.riskScore));
    }
    if (!['low', 'medium', 'high'].includes(result.riskLevel)) {
      result.riskLevel = result.riskScore >= 70 ? 'high' : result.riskScore >= 40 ? 'medium' : 'low';
    }
    if (!['sms', 'email', 'website', 'url', 'phone', 'social'].includes(result.sourceType)) {
      result.sourceType = 'sms';
    }

    console.log('[AI] Image analysis complete, score:', result.riskScore, 'level:', result.riskLevel);
    return result;
  } catch (error: any) {
    console.error('[AI] Image analysis failed:', error?.message);
    throw error;
  }
}

function getContentTypePrompt(contentType: ContentType, language: string): string {
  const prompts: Record<ContentType, { fr: string; en: string }> = {
    sms: {
      fr: 'Analyse ce message SMS/texto pour détecter des signes de fraude ou d\'arnaque.',
      en: 'Analyze this SMS/text message for signs of fraud or scam.',
    },
    url: {
      fr: 'Analyse ce lien/URL pour détecter des signes de fraude.',
      en: 'Analyze this link/URL for signs of fraud.',
    },
    email: {
      fr: 'Analyse ce contenu d\'email pour détecter des signes de fraude ou de phishing.',
      en: 'Analyze this email content for signs of fraud or phishing.',
    },
    phone: {
      fr: 'Analyse cette description d\'appel téléphonique pour détecter des signes de fraude.',
      en: 'Analyze this phone call description for signs of fraud.',
    },
    social: {
      fr: 'Analyse ce message de réseau social pour détecter des signes de fraude.',
      en: 'Analyze this social media message for signs of fraud.',
    },
  };
  return prompts[contentType]?.[language === 'fr' ? 'fr' : 'en'] ?? prompts.sms.en;
}

export async function analyzeText(
  input: TextAnalysisInput,
  language: string,
  country: Country = 'CA',
): Promise<ScanAnalysisResult> {
  console.log('[AI] Starting text analysis via Rork Toolkit, type:', input.contentType);

  const typeInstruction = getContentTypePrompt(input.contentType, language);

  let contentDescription = '';
  switch (input.contentType) {
    case 'sms':
      contentDescription = `SMS/Text message content:\n"${input.text}"`;
      break;
    case 'url':
      contentDescription = `URL/Link to analyze:\n${input.text}`;
      break;
    case 'email':
      contentDescription = `Email content (subject + body):\n"${input.text}"`;
      break;
    case 'phone':
      contentDescription = `Phone call description:\n"${input.text}"${input.phoneNumber ? `\nCaller number: ${input.phoneNumber}` : ''}`;
      break;
    case 'social':
      contentDescription = `Social media message${input.platform ? ` (${input.platform})` : ''}:\n"${input.text}"`;
      break;
  }

  const sourceTypeMap: Record<ContentType, string> = {
    sms: 'sms',
    url: 'url',
    email: 'email',
    phone: 'phone',
    social: 'social',
  };

  const reportingOrgs = getReportingAdvice(country);
  const systemPrompt = `${getCyrusPrompt(country)}

${typeInstruction}

You MUST respond with a valid JSON object and NOTHING else. No markdown, no code blocks, just pure JSON.

The JSON must have this exact structure:
{
  "riskScore": <number 0-100>,
  "riskLevel": "<low|medium|high>",
  "sourceType": "${sourceTypeMap[input.contentType]}",
  "summary": "<French summary>",
  "summaryEn": "<English summary>",
  "explanation": "<detailed French explanation>",
  "explanationEn": "<detailed English explanation>",
  "suspiciousElements": ["<French element 1>"],
  "suspiciousElementsEn": ["<English element 1>"],
  "reassuringElements": ["<French element 1>"],
  "reassuringElementsEn": ["<English element 1>"],
  "advice": ["<French advice 1>"],
  "adviceEn": ["<English advice 1>"]
}

Risk scoring rules:
- HIGH (70-100): Clear phishing/scam indicators
- MEDIUM (40-69): Suspicious but not confirmed
- LOW (0-39): Appears legitimate

Always include country-specific reporting organizations in advice:
${reportingOrgs}

Give a clear verdict: ✅ Safe / ⚠️ Suspicious / 🚨 Scam detected`;

  const messages: ToolkitMessage[] = [
    {
      role: 'user',
      content: `${systemPrompt}\n\n${contentDescription}\n\n${language === 'fr' ? 'Retourne uniquement le JSON.' : 'Return only the JSON.'}`,
    },
  ];

  console.log('[AI] Sending text analysis request to toolkit...');
  try {
    const response = await generateText({ messages });
    console.log('[AI] Text analysis response received, length:', response?.length);

    if (!response) {
      throw new Error('Empty response from AI service');
    }

    const result = parseJsonResponse<ScanAnalysisResult>(response);

    if (result.riskScore < 0 || result.riskScore > 100) {
      result.riskScore = Math.max(0, Math.min(100, result.riskScore));
    }
    if (!['low', 'medium', 'high'].includes(result.riskLevel)) {
      result.riskLevel = result.riskScore >= 70 ? 'high' : result.riskScore >= 40 ? 'medium' : 'low';
    }
    result.sourceType = sourceTypeMap[input.contentType] as ScanAnalysisResult['sourceType'];

    console.log('[AI] Text analysis complete, score:', result.riskScore);
    return result;
  } catch (error: any) {
    console.error('[AI] Text analysis failed:', error?.message);
    throw error;
  }
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

async function fetchSiteData(url: string) {
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

  const homepageFetch = await fetchUrlSafely(normalizedUrl);

  const legalPaths = ['/mentions-legales', '/legal', '/legal-notice'];
  const privacyPaths = ['/politique-de-confidentialite', '/privacy', '/privacy-policy'];
  const termsPaths = ['/conditions-utilisation', '/terms', '/terms-of-service', '/tos', '/cgu'];
  const contactPaths = ['/contact', '/a-propos', '/about', '/about-us'];

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

export async function analyzeUrl(
  url: string,
  language: string,
  country: Country = 'CA',
): Promise<UrlAnalysisResult> {
  console.log('[AI] Starting deep URL analysis for:', url);

  const siteData = await fetchSiteData(url);
  console.log('[AI] Site data fetched, success:', siteData.homepageFetch.success);

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

  const knownEcommerce = ['shein.com', 'temu.com', 'amazon.com', 'amazon.ca', 'amazon.fr', 'ebay.com', 'walmart.ca', 'walmart.com', 'aliexpress.com', 'etsy.com'];
  const knownBanks = ['desjardins.com', 'td.com', 'bmo.com', 'rbc.com', 'bnc.ca', 'scotiabank.com', 'paypal.com'];
  const knownGov = ['canada.ca', 'quebec.ca', 'gouv.qc.ca', 'gc.ca', 'service-public.fr'];
  const knownTech = ['google.com', 'apple.com', 'microsoft.com', 'facebook.com', 'instagram.com', 'youtube.com', 'netflix.com'];
  const knownDomains = [...knownEcommerce, ...knownBanks, ...knownGov, ...knownTech];
  const isKnownDomain = knownDomains.some(d => parsedDomain === d || parsedDomain.endsWith('.' + d));
  const isKnownEcommerce = knownEcommerce.some(d => parsedDomain === d || parsedDomain.endsWith('.' + d));

  let knownSiteCategory = '';
  if (knownGov.some(d => parsedDomain === d || parsedDomain.endsWith('.' + d))) knownSiteCategory = 'government';
  else if (knownBanks.some(d => parsedDomain === d || parsedDomain.endsWith('.' + d))) knownSiteCategory = 'bank/finance';
  else if (knownTech.some(d => parsedDomain === d || parsedDomain.endsWith('.' + d))) knownSiteCategory = 'tech/service';
  else if (isKnownEcommerce) knownSiteCategory = 'e-commerce';

  const urlAnalysisSection = `
=== URL STRUCTURAL ANALYSIS ===
Full URL: ${normalizedUrl}
Protocol: ${normalizedUrl.startsWith('https') ? 'HTTPS (secure)' : 'HTTP (NOT secure)'}
Domain: ${parsedDomain}
TLD: ${parsedTld}
URL length: ${urlLength} characters
Subdomain levels: ${subdomainCount}
Excessive dashes: ${hasExcessiveDashes ? 'YES' : 'No'}
Digits in domain: ${hasDigitsInDomain ? 'YES' : 'No'}
Suspicious TLD: ${isSuspiciousTld ? 'YES (' + parsedTld + ')' : 'No'}
Known/trusted domain: ${isKnownDomain ? 'YES — category: ' + knownSiteCategory : 'No'}

=== FETCH RESULTS ===
Fetch success: ${siteData.homepageFetch.success}
HTTP Status: ${siteData.statusCode ?? 'N/A'}
SSL: ${siteData.ssl ? 'Yes' : 'No'}
Redirects: ${siteData.redirectCount}
Final URL: ${siteData.finalUrl}
Fetch error: ${siteData.fetchError ?? 'None'}

Homepage content (first ~3000 chars):
${siteData.homepage ? siteData.homepage.substring(0, 2000) : '[FAILED TO FETCH]'}

Legal mentions found: ${siteData.legalMentions ? 'YES' : 'NO'}
Privacy policy found: ${siteData.privacyPolicy ? 'YES' : 'NO'}
Terms of service found: ${siteData.terms ? 'YES' : 'NO'}
Contact page found: ${siteData.contact ? 'YES' : 'NO'}
`;

  const reportingOrgs = getReportingAdvice(country);
  const systemPrompt = `${getCyrusPrompt(country)}

You are an expert in cybersecurity performing a DEEP analysis of a URL.

${urlAnalysisSection}

SCORING RULES:
- Known government: 85-95
- Known banks: 80-90
- Known tech: 80-90
- Known e-commerce (good reputation): 75-85
- Unknown + HTTPS + no red flags = 50-60
- FETCH FAILURE MUST NEVER lower the score

ABSOLUTE RULES:
- reputation.dataAvailable = ALWAYS false
- reputation.trustScore = ALWAYS null
- reputation.positiveReviews = ALWAYS null
- reputation.negativeReviews = ALWAYS null
- reputation.reviews = ALWAYS empty array []
- complaints.dataAvailable = ALWAYS false
- complaints.total = ALWAYS 0
- complaints.items = ALWAYS empty array []

VerdictEmoji: ✅ for score >= 65, ⚠️ for 35-64, 🚨 for < 35

You MUST respond with a valid JSON object and NOTHING else.

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
  "reputation": { "dataAvailable": false, "trustScore": null, "positiveReviews": null, "negativeReviews": null, "summary": "Aucune donnée de réputation vérifiable.", "summaryEn": "No verifiable reputation data.", "reviews": [] },
  "complaints": { "dataAvailable": false, "total": 0, "items": [], "summary": "Vérifiez manuellement.", "summaryEn": "Check manually." },
  "business": { "dataAvailable": <boolean>, "name": "<string>", "registered": null, "hasContact": <boolean>, "address": "<string>", "phone": "<string>", "summary": "<FR>", "summaryEn": "<EN>" },
  "onlineStore": null,
  "personalizedAdvice": ["<French tips>"],
  "personalizedAdviceEn": ["<English tips>"]
}

Include reporting organizations:
${reportingOrgs}`;

  const messages: ToolkitMessage[] = [
    {
      role: 'user',
      content: language === 'fr'
        ? `${systemPrompt}\n\nFais une analyse approfondie de cette URL : ${url}. Retourne uniquement le JSON.`
        : `${systemPrompt}\n\nPerform a deep analysis of this URL: ${url}. Return only the JSON.`,
    },
  ];

  console.log('[AI] Sending URL analysis request to toolkit...');
  try {
    const response = await generateText({ messages });
    console.log('[AI] URL analysis response received, length:', response?.length);

    if (!response) {
      throw new Error('Empty response from AI service');
    }

    const result = parseJsonResponse<UrlAnalysisResult>(response);
    console.log('[AI] URL analysis complete, score:', result.score);
    return result;
  } catch (error: any) {
    console.error('[AI] URL analysis failed:', error?.message);
    throw error;
  }
}

export async function sendChatMessage(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  language: string,
  country: Country = 'CA',
): Promise<string> {
  console.log('[AI] Sending chat message via Rork Toolkit');

  const langInstruction = language === 'fr'
    ? 'L\'utilisateur parle français. Réponds en français.'
    : 'The user speaks English. Respond in English.';

  const systemContent = `${getCyrusPrompt(country)}\n\n${langInstruction}`;

  const messages: ToolkitMessage[] = [
    { role: 'user', content: systemContent + '\n\nUser: ' + (conversationHistory.length > 0 ? conversationHistory[0].content : userMessage) },
  ];

  for (let i = 0; i < conversationHistory.length; i++) {
    const msg = conversationHistory[i];
    if (i === 0) continue;
    messages.push({ role: msg.role, content: msg.content });
  }

  if (conversationHistory.length > 0) {
    messages.push({ role: 'user', content: userMessage });
  }

  const response = await generateText({ messages });
  return response || '';
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
  country: Country = 'CA',
): Promise<string> {
  console.log('[AI] Sending scan chat message via Rork Toolkit');

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

  const systemContent = `${getCyrusPrompt(country)}\n\n${langInstruction}\n\nYou are discussing a specific scan result with the user. Here is the scan context:\n${scanInfo}\n\nAnswer the user's questions about this specific scan. Be detailed, educational, and provide actionable advice.`;

  const messages: ToolkitMessage[] = [];

  if (conversationHistory.length > 0) {
    messages.push({
      role: 'user',
      content: systemContent + '\n\nUser: ' + conversationHistory[0].content,
    });
    for (let i = 1; i < conversationHistory.length; i++) {
      messages.push({ role: conversationHistory[i].role, content: conversationHistory[i].content });
    }
    messages.push({ role: 'user', content: userMessage });
  } else {
    messages.push({
      role: 'user',
      content: systemContent + '\n\nUser: ' + userMessage,
    });
  }

  const response = await generateText({ messages });
  return response || '';
}
