
import type { Country } from '@/contexts/AppContext';
import { countryConfigs } from '@/constants/countries';

const API_URL = 'https://api.openai.com/v1/chat/completions';

function getApiKey(): string {
  const k = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
  if (!k) {
    console.log('[OpenAI] API key not configured');
    return '';
  }
  return k;
}

function validateApiKeyAccess(): boolean {
  const key = getApiKey();
  if (!key || key.length < 10) return false;
  if (!key.startsWith('sk-')) {
    console.log('[OpenAI] Invalid API key format');
    return false;
  }
  return true;
}

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

interface ChatMessageContent {
  type: string;
  text?: string;
  image_url?: { url: string; detail?: string };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ChatMessageContent[];
}

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

let activeController: AbortController | null = null;

function createAbortController(timeoutMs: number = 60000): AbortController {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const origAbort = controller.abort.bind(controller);
  controller.abort = () => {
    clearTimeout(timeout);
    origAbort();
  };
  return controller;
}

export function cancelActiveRequests() {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
}

async function callOpenAI(messages: ChatMessage[], maxTokens: number = 1500): Promise<string> {
  console.log('[OpenAI] Calling API');

  if (!validateApiKeyAccess()) {
    throw new Error('OpenAI API key is not properly configured');
  }

  cancelActiveRequests();
  const controller = createAbortController(60000);
  activeController = controller;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const _errorText = await response.text().catch(() => 'Unknown error');
      console.log('[OpenAI] API error:', response.status);
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (response.status >= 500) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[OpenAI] Response received');
    return data.choices[0]?.message?.content ?? '';
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw error;
  } finally {
    if (activeController === controller) {
      activeController = null;
    }
  }
}

async function imageUriToBase64(uri: string): Promise<string> {
  console.log('[OpenAI] Converting image to base64');
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] ?? '';
        console.log('[OpenAI] Base64 conversion complete');
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

export async function analyzeImage(imageUri: string, language: string, base64Data?: string, country: Country = 'CA', mimeType?: string): Promise<ScanAnalysisResult> {
  console.log('[OpenAI] Starting image analysis');

  if (!validateApiKeyAccess()) {
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

  const detectedMime = mimeType || (imageUri.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg');
  console.log('[OpenAI] Image ready for analysis, mime:', detectedMime, 'base64 length:', base64.length);

  const MAX_BASE64_LENGTH = 2_000_000;
  if (base64.length > MAX_BASE64_LENGTH) {
    console.log('[OpenAI] Base64 too large, truncating from', base64.length, 'to', MAX_BASE64_LENGTH);
    base64 = base64.substring(0, MAX_BASE64_LENGTH);
  }

  const dataUrl = `data:${detectedMime};base64,${base64}`;

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
Always include country-specific reporting organizations in advice:
${reportingOrgs}

Give a clear verdict: ✅ Safe / ⚠️ Suspicious / 🚨 Scam detected
Explain WHY with concrete country-specific examples when relevant.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: dataUrl, detail: 'low' },
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
  console.log('[OpenAI] Image analysis response received');

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned) as ScanAnalysisResult;

    if (result.riskScore < 0 || result.riskScore > 100) {
      result.riskScore = Math.max(0, Math.min(100, result.riskScore));
    }
    if (!['low', 'medium', 'high'].includes(result.riskLevel)) {
      result.riskLevel = result.riskScore >= 70 ? 'high' : result.riskScore >= 40 ? 'medium' : 'low';
    }
    if (!['sms', 'email', 'website', 'url', 'phone', 'social'].includes(result.sourceType)) {
      result.sourceType = 'sms';
    }

    return result;
  } catch (parseError) {
    console.log('[OpenAI] JSON parse error:', parseError);
    throw new Error('Failed to parse AI analysis response');
  }
}

function getContentTypePrompt(contentType: ContentType, language: string): string {
  const prompts: Record<ContentType, { fr: string; en: string }> = {
    sms: {
      fr: 'Analyse ce message SMS/texto pour détecter des signes de fraude ou d\'arnaque. Vérifie les liens suspects, l\'urgence artificielle, les demandes d\'informations personnelles, le typosquatting, et les patterns de phishing courants au Québec/Canada.',
      en: 'Analyze this SMS/text message for signs of fraud or scam. Check for suspicious links, artificial urgency, personal information requests, typosquatting, and common phishing patterns in Quebec/Canada.',
    },
    url: {
      fr: 'Analyse ce lien/URL pour détecter des signes de fraude. Vérifie le domaine, le protocole, les redirections possibles, le typosquatting, et les indicateurs de phishing.',
      en: 'Analyze this link/URL for signs of fraud. Check the domain, protocol, possible redirects, typosquatting, and phishing indicators.',
    },
    email: {
      fr: 'Analyse ce contenu d\'email pour détecter des signes de fraude ou de phishing. Vérifie l\'expéditeur, les liens dans le corps, l\'urgence artificielle, les pièces jointes suspectes mentionnées, et les demandes inhabituelles.',
      en: 'Analyze this email content for signs of fraud or phishing. Check the sender, links in the body, artificial urgency, mentioned suspicious attachments, and unusual requests.',
    },
    phone: {
      fr: 'Analyse cette description d\'appel téléphonique pour détecter des signes de fraude. Vérifie les tactiques d\'intimidation, les demandes de paiement par cartes prépayées ou virement, l\'usurpation d\'identité d\'organismes officiels, et les techniques de manipulation courantes.',
      en: 'Analyze this phone call description for signs of fraud. Check for intimidation tactics, requests for payment via prepaid cards or wire transfer, impersonation of official organizations, and common manipulation techniques.',
    },
    social: {
      fr: 'Analyse ce message de réseau social pour détecter des signes de fraude. Vérifie les liens suspects, les demandes d\'informations personnelles, les faux concours, les arnaques sentimentales, et les patterns de fraude sur les réseaux sociaux.',
      en: 'Analyze this social media message for signs of fraud. Check for suspicious links, personal information requests, fake contests, romance scams, and social media fraud patterns.',
    },
  };
  return prompts[contentType]?.[language === 'fr' ? 'fr' : 'en'] ?? prompts.sms.en;
}

export interface TextAnalysisInput {
  contentType: ContentType;
  text: string;
  phoneNumber?: string;
  platform?: string;
}

export async function analyzeText(input: TextAnalysisInput, language: string, country: Country = 'CA'): Promise<ScanAnalysisResult> {
  console.log('[OpenAI] Starting text analysis, type:', input.contentType);

  if (!validateApiKeyAccess()) {
    throw new Error('OpenAI API key is not configured');
  }

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

Always include country-specific reporting organizations in advice:
${reportingOrgs}

Give a clear verdict: ✅ Safe / ⚠️ Suspicious / 🚨 Scam detected
Explain WHY with concrete country-specific examples when relevant.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `${contentDescription}\n\n${language === 'fr' ? 'Retourne uniquement le JSON.' : 'Return only the JSON.'}`,
    },
  ];

  const response = await callOpenAI(messages, 2000);
  console.log('[OpenAI] Text analysis response received');

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned) as ScanAnalysisResult;

    if (result.riskScore < 0 || result.riskScore > 100) {
      result.riskScore = Math.max(0, Math.min(100, result.riskScore));
    }
    if (!['low', 'medium', 'high'].includes(result.riskLevel)) {
      result.riskLevel = result.riskScore >= 70 ? 'high' : result.riskScore >= 40 ? 'medium' : 'low';
    }
    result.sourceType = sourceTypeMap[input.contentType] as ScanAnalysisResult['sourceType'];

    return result;
  } catch (parseError) {
    console.log('[OpenAI] Text analysis JSON parse error:', parseError);
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

export async function analyzeUrl(url: string, language: string, country: Country = 'CA'): Promise<UrlAnalysisResult> {
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

  const knownEcommerce = [
    'shein.com', 'temu.com', 'amazon.com', 'amazon.ca', 'amazon.fr', 'ebay.com', 'ebay.ca',
    'walmart.ca', 'walmart.com', 'aliexpress.com', 'wish.com', 'costco.ca', 'bestbuy.ca',
    'etsy.com', 'asos.com', 'zara.com', 'hm.com', 'uniqlo.com', 'nike.com', 'adidas.com',
    'ikea.com', 'wayfair.ca',
  ];
  const knownBanks = [
    'desjardins.com', 'td.com', 'bmo.com', 'rbc.com', 'bnc.ca', 'scotiabank.com',
    'cibc.com', 'paypal.com', 'stripe.com', 'interac.ca', 'visa.com', 'mastercard.com',
  ];
  const knownGov = [
    'canada.ca', 'quebec.ca', 'gouv.qc.ca', 'gc.ca', 'service-public.fr', 'belgique.be', 'caf.fr',
  ];
  const knownTech = [
    'google.com', 'apple.com', 'microsoft.com', 'meta.com', 'facebook.com', 'instagram.com',
    'youtube.com', 'twitter.com', 'x.com', 'linkedin.com', 'netflix.com', 'spotify.com',
    'tiktok.com', 'github.com', 'wikipedia.org', 'reddit.com', 'whatsapp.com',
  ];
  const knownDomains = [...knownEcommerce, ...knownBanks, ...knownGov, ...knownTech];
  const isKnownDomain = knownDomains.some(d => parsedDomain === d || parsedDomain.endsWith('.' + d));
  const isKnownEcommerce = knownEcommerce.some(d => parsedDomain === d || parsedDomain.endsWith('.' + d));
  const isKnownBank = knownBanks.some(d => parsedDomain === d || parsedDomain.endsWith('.' + d));
  const isKnownGov = knownGov.some(d => parsedDomain === d || parsedDomain.endsWith('.' + d));
  const isKnownTech = knownTech.some(d => parsedDomain === d || parsedDomain.endsWith('.' + d));

  let knownSiteCategory = '';
  if (isKnownGov) knownSiteCategory = 'government';
  else if (isKnownBank) knownSiteCategory = 'bank/finance';
  else if (isKnownTech) knownSiteCategory = 'tech/service';
  else if (isKnownEcommerce) knownSiteCategory = 'e-commerce';

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
Known/trusted domain: ${isKnownDomain ? 'YES — category: ' + knownSiteCategory : 'No'}
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

  const reportingOrgs = getReportingAdvice(country);
  const systemPrompt = `${getCyrusPrompt(country)}

You are an expert in cybersecurity and fraud detection integrated in CyrusGuard.

You are performing a DEEP analysis of a URL. We have pre-computed structural analysis and fetched real site content for you.

${urlAnalysisSection}

=== STEP 3: KNOWN SITE RECOGNITION (PRIORITY) ===
BEFORE analyzing fetch results, check if the root domain is a KNOWN site.

If the domain is RECOGNIZED as a known site:
- hasLegalPages: true (major sites ALL have legal pages)
- hasPrivacyPolicy: true
- termsOfService: true
- hasContact: true
- DO NOT base the score on fetch results — base it on KNOWLEDGE of the site
- Add a note if the site has KNOWN CONTROVERSIES (e.g., Shein = quality/ethics controversies, but NOT a scam)

Known site scoring:
- Government sites: 85-95
- Banks/Finance: 80-90
- Major tech/services: 80-90
- Major e-commerce (good reputation): 75-85
- Major e-commerce (with controversies but not scam): 65-80

If the domain is NOT recognized → rely on structural analysis + fetch data.

=== STEP 4: SCORING FOR UNKNOWN SITES ===
90-100: Known official domain + HTTPS + all pages verified
75-89: Legitimate site with HTTPS + legal pages + contact info
60-74: HTTPS + some pages present, no red flags
40-59: Missing info OR some suspicious elements (neutral, caution)
20-39: Multiple red flags (no SSL, typosquatting possible, suspicious domain)
0-19: Clear phishing, confirmed typosquatting, obvious scam

CRITICAL RULES:
- An UNKNOWN site is NOT automatically dangerous
- Unknown + HTTPS + no red flags = 50-60 (neutral)
- Unknown + red flags = lower based on severity
- Known trusted domain (exact match) = automatic high score per category above
- Domain SIMILAR to known but NOT exact = ALERT typosquatting, very low score
- FETCH FAILURE MUST NEVER lower the score. An inaccessible site = insufficient data, NOT a dangerous site
- Modern sites (React, Angular, Vue) often return empty HTML to fetch — this means NOTHING about their legitimacy

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
- NEVER say a known site has no legal pages just because fetch failed
- If content was NOT fetched, content fields may be false but DON'T assume danger
- Extract business info ONLY from fetched content (legal page, contact page, homepage)
- If a page was NOT found via fetch AND it's NOT a known site, report honestly
- Be HONEST: if we don't know, say "Inconnu", not "Dangereux"

VerdictEmoji rules:
- ✅ for score >= 65: "Site fiable" / "Reliable site"
- ⚠️ for score 35-64: "À utiliser avec prudence" / "Use with caution"
- 🚨 for score < 35: "Site dangereux" / "Dangerous site"

You MUST respond with a valid JSON object and NOTHING else. No markdown, no code blocks, just pure JSON.

{
  "score": <0-100>,
  "ssl": <boolean>,
  "domainAge": "Inconnu",
  "legalMentions": <boolean - true if known site OR found in fetch>,
  "privacyPolicy": <boolean - true if known site OR found in fetch>,
  "termsOfService": <boolean - true if known site OR found in fetch>,
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
    "summary": "Vérifiez le Centre antifraude du Canada et l'Office de la protection du consommateur.",
    "summaryEn": "Check the Canadian Anti-Fraud Centre and consumer protection agencies."
  },
  "business": {
    "dataAvailable": <boolean>,
    "name": "<from content, known info, or 'Inconnu'>",
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
Always include country-specific reporting organizations in advice:
${reportingOrgs}
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
  console.log('[OpenAI] URL analysis response received');

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
  country: Country = 'CA',
): Promise<string> {
  console.log('[OpenAI] Sending chat message');

  const langInstruction = language === 'fr'
    ? 'L\'utilisateur parle français. Réponds en français.'
    : 'The user speaks English. Respond in English.';

  const messages: ChatMessage[] = [
    { role: 'system', content: `${getCyrusPrompt(country)}\n\n${langInstruction}` },
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
  country: Country = 'CA',
): Promise<string> {
  console.log('[OpenAI] Sending scan chat message');

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
      content: `${getCyrusPrompt(country)}\n\n${langInstruction}\n\nYou are discussing a specific scan result with the user. Here is the scan context:\n${scanInfo}\n\nAnswer the user's questions about this specific scan. Be detailed, educational, and provide actionable advice.`,
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
