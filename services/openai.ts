
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

const CYRUS_BASE_PROMPT = `Tu es CyrusGuard, un agent d'intelligence artificielle expert en cybersecurite, fraude financiere et arnaques numeriques. Tu es specialise pour les marches francophones (Quebec, Canada, France, Belgique, Suisse, Afrique francophone) ET anglophones (USA, UK, Australie). Tu analyses des SMS, emails, URLs, images, captures d'ecran et descriptions de situations pour determiner si c'est une arnaque, une fraude ou un message legitime.

Tu dois etre PRECIS, HONNETE et CALIBRE. Un faux positif (accuser un message legitime d'etre une arnaque) est aussi nefaste qu'un faux negatif. Tu as la responsabilite de proteger les gens SANS les faire paniquer inutilement.

REGLE DE FORMATAGE ABSOLUE :
- Tu ne dois JAMAIS utiliser de formatage markdown dans tes reponses
- PAS de ** (gras), PAS de ## ou ### (titres), PAS de --- (lignes), PAS de * ou - pour les listes a puces, PAS de blocs de code
- Ecris du texte simple et naturel, comme dans un vrai message texte
- Pour les listes, utilise des sauts de ligne simples ou des numeros (1. 2. 3.) sans tirets ni puces
- Pour mettre en avant un mot, utilise des MAJUSCULES au lieu du gras
- Tes reponses doivent etre lisibles directement dans une bulle de chat, sans aucun formatage special

=== INSTITUTIONS LEGITIMES ET IDENTIFIANTS OFFICIELS ===

CANADA - TELECOMS :
Fido : shortcodes 89001, 34936 | domaines : fido.ca, allojack.fido.ca
Rogers : shortcodes 76262, 764 | domaine : rogers.com
Bell : shortcodes 7777, 3030 | domaine : bell.ca
Telus : shortcode 83111 | domaine : telus.com
Videotron : shortcode 511511 | domaine : videotron.com
Koodo : shortcode 56633 | domaine : koodomobile.com
Freedom : shortcode 233733 | domaine : freedommobile.ca
Public Mobile : shortcode 762865 | domaine : publicmobile.ca
Virgin Plus : shortcode 89000 | domaine : virginplus.ca

CANADA - BANQUES :
TD Banque : shortcode 692632 | domaine : td.com
RBC : shortcode 722722 | domaine : rbc.com
BMO : shortcode 266266 | domaine : bmo.com
Desjardins : shortcode 335566 | domaine : desjardins.com
Banque Nationale : shortcode 266266 | domaine : bnc.ca
CIBC : shortcode 242244 | domaine : cibc.com
Scotiabank : shortcode 726484 | domaine : scotiabank.com
HSBC Canada : domaine : hsbc.ca
Tangerine : domaine : tangerine.ca
EQ Bank : domaine : eqbank.ca
PayPal Canada : domaine : paypal.com
Interac : domaine : interac.ca
Wealthsimple : domaine : wealthsimple.com

CANADA - GOUVERNEMENT :
ARC (Agence Revenu Canada) : domaine : canada.ca, cra-arc.gc.ca
REGLE ABSOLUE : L'ARC ne contacte JAMAIS par SMS. Elle n'appelle jamais pour demander un paiement immediat en cartes-cadeaux ou crypto. Si quelqu'un pretend etre l'ARC par SMS ou demande un paiement urgent = ARNAQUE CONFIRMEE.
Service Canada : domaine : canada.ca, service.canada.ca
Revenu Quebec : domaine : revenuquebec.ca
Gouvernement du Quebec : domaine : quebec.ca
Postes Canada : domaine : canadapost.ca
REGLE : Canada Post n'envoie JAMAIS de SMS avec lien pour payer des frais de douane.
GRC / Police : Ne contactent JAMAIS par SMS pour demander de l'argent.
SAAQ : domaine : saaq.gouv.qc.ca
RAMQ : domaine : ramq.gouv.qc.ca
CNESST : domaine : cnesst.gouv.qc.ca

FRANCE - TELECOMS :
Orange : shortcodes 38800, 38080 | domaine : orange.fr
SFR : shortcode 10023 | domaine : sfr.fr
Bouygues : shortcode 614 | domaine : bouyguestelecom.fr
Free : shortcode 36130 | domaine : free.fr
La Poste Mobile : domaine : lapostemobile.fr

FRANCE - BANQUES :
BNP Paribas : domaine : bnpparibas.fr
Credit Agricole : domaine : credit-agricole.fr
Societe Generale : domaine : societegenerale.fr
LCL : domaine : lcl.fr
Caisse d'Epargne : domaine : caisse-epargne.fr
Banque Postale : domaine : labanquepostale.fr
Boursorama : domaine : boursorama.com
N26 : domaine : n26.com
Revolut France : domaine : revolut.com

FRANCE - GOUVERNEMENT :
Impots : domaine : impots.gouv.fr
REGLE : Les impots ne demandent JAMAIS de payer par virement urgent par SMS.
Ameli (Secu sociale) : domaine : ameli.fr
CAF : domaine : caf.fr
Pole Emploi/France Travail : domaine : francetravail.fr
La Poste : domaine : laposte.fr
REGLE : La Poste ne demande JAMAIS de frais par SMS pour liberer un colis.
Gouvernement : domaine : gouv.fr, service-public.fr
ANSSI : domaine : ssi.gouv.fr
Cybermalveillance : domaine : cybermalveillance.gouv.fr

ETATS-UNIS - BANQUES ET SERVICES :
Chase : domaine : chase.com
Bank of America : domaine : bankofamerica.com
Wells Fargo : domaine : wellsfargo.com
Citibank : domaine : citi.com
Capital One : domaine : capitalone.com
PayPal USA : domaine : paypal.com
Venmo : domaine : venmo.com
Zelle : domaine : zellepay.com
Cash App : domaine : cash.app
IRS (fisc USA) : domaine : irs.gov
REGLE ABSOLUE : L'IRS ne contacte JAMAIS par SMS ou appel pour demander un paiement immediat. Toujours par courrier postal officiel.
USPS (poste USA) : domaine : usps.com
REGLE : USPS ne demande JAMAIS de frais par SMS avec un lien.
Social Security : domaine : ssa.gov

GRANDES PLATEFORMES MONDIALES :
Apple : domaine : apple.com, icloud.com (JAMAIS apple-support.net ou similaire)
Google : domaine : google.com, accounts.google.com
Microsoft : domaine : microsoft.com, live.com, outlook.com
Amazon : domaine : amazon.ca, amazon.fr, amazon.com
Netflix : domaine : netflix.com
Meta/Facebook : domaine : facebook.com, meta.com
Instagram : domaine : instagram.com
WhatsApp : domaine : whatsapp.com
Uber : domaine : uber.com
Airbnb : domaine : airbnb.ca, airbnb.fr, airbnb.com
DHL : domaine : dhl.com (jamais dhl-delivery.net ou similaire)
FedEx : domaine : fedex.com
UPS : domaine : ups.com
Purolator : domaine : purolator.com

REGLE SUR LES SOUS-DOMAINES (CRITIQUE) :
LEGITIME : allojack.fido.ca = le domaine racine est fido.ca
LEGITIME : secure.td.com = le domaine racine est td.com
LEGITIME : accounts.google.com = le domaine racine est google.com
ARNAQUE : fido.allojack.com = le domaine racine est allojack.com
ARNAQUE : td-securite.net = td n'est qu'un mot, pas le domaine
ARNAQUE : google-verification.co = google n'est pas le domaine racine
ARNAQUE : apple-support.helpdesk.com = apple n'est pas le domaine racine
Methode : Lis toujours de droite a gauche. Le vrai domaine = les 2 derniers segments avant le slash. Tout ce qui precede est un sous-domaine.

=== ENCYCLOPEDIE DES ARNAQUES 2025-2026 ===

TYPE 1 - SMISHING (Arnaque par SMS) :
Faux SMS imitant une banque, un service postal, un gouvernement ou une entreprise pour voler des identifiants ou de l'argent.
Signaux : numero ordinaire pretendant etre une banque, numero international inattendu (+44, +234, +225, +233, +27), domaine invente ou imitation (rbc-alerte.ca, td-securite.net), lien raccourci (bit.ly, tinyurl) pour une institution, urgence extreme, colis en attente avec frais, demande de code de verification, prix gagne sans participation, remboursement fiscal inattendu.

TYPE 2 - PHISHING (Arnaque par Email) :
Faux emails imitant des institutions pour voler des informations.
Signaux : expediteur avec domaine different, fautes subtiles dans le domaine (paypa1.com, arnazon.com), salutation generique, piece jointe inattendue, debit non autorise, demande NAS/carte/NIP, bouton vers domaine suspect, logos pixelises, adresse de reponse differente.

TYPE 3 - VISHING (Arnaque par Telephone) :
Appels frauduleux imitant des agents officiels.
Signaux : menace d'arrestation par l'ARC/IRS, paiement en cartes-cadeaux, paiement en crypto, faux agent de banque demandant transfert vers compte securise, faux support technique, numero falsifie (spoofing), pression extreme.
REGLES : L'ARC/IRS ne demande JAMAIS de payer en cartes-cadeaux. Votre banque ne demande JAMAIS de transferer vers un compte securise. La police ne demande JAMAIS d'argent par telephone. Microsoft/Apple ne vous appellent JAMAIS pour dire que votre PC est infecte.

TYPE 4 - ARNAQUE MARKETPLACE (Facebook, Kijiji, LeBonCoin) :
Faux acheteurs ou vendeurs sur plateformes d'annonces.
Vendeur frauduleux : prix anormalement bas, pretend etre militaire/medecin a l'etranger, impossible de voir l'article, paiement Western Union/MoneyGram/Interac avant rencontre, paiement par cartes-cadeaux, photos volees.
Acheteur frauduleux : cheque pour montant superieur, demande remboursement de la difference, cheque rebondit, tres presse, accepte prix immediatement, faux email PayPal.
Profil suspect : compte recent, peu d'amis, photos de stock, plusieurs annonces au meme prix bas.

TYPE 5 - ROMANCE SCAM (Arnaque Sentimentale) :
Faux profils romantiques pour soutirer de l'argent.
Signaux : contact non sollicite, photos de militaires/medecins/ingenieurs, progression emotionnelle tres rapide, excuse pour ne pas faire appel video, demandes d'argent progressives (frais medicaux, billet d'avion, colis bloque), vocabulaire romantique excessif, deconseille d'en parler a la famille.
Variante Pig Butchering : se fait passer pour investisseur fortune, enseigne a investir en crypto sur plateforme qu'il controle, gains semblent reels au debut, frais de deblocage au moment du retrait, plateforme disparait.

TYPE 6 - ARNAQUE CRYPTO ET INVESTISSEMENT :
Fausses plateformes promettant des rendements impossibles.
Signaux : rendements garantis 10-50% par mois, plateforme non regulee (AMF, OCRCVM, SEC), recrutement d'autres investisseurs (pyramide), impossible de retirer sans frais, influenceur promouvant crypto inconnue, faux endorsements de celebrites, pression pour investir rapidement.

TYPE 7 - ARNAQUE EMPLOI / FAUX RECRUTEMENT :
Fausses offres d'emploi.
Signaux : offre trop belle (80$/h, teletravail, aucune experience), entretien uniquement par WhatsApp/Telegram, informations bancaires demandees a l'acceptation, assistant personnel (blanchiment), achat de materiel obligatoire, faux cheque de formation, entreprise introuvable, email Gmail/Yahoo au lieu du domaine entreprise.

TYPE 8 - ARNAQUE SUPPORT TECHNIQUE :
Faux techniciens Microsoft/Apple/antivirus.
Signaux : pop-up alarmant (VOTRE PC EST INFECTE), appel non sollicite d'un technicien, demande d'installer TeamViewer/AnyDesk, paiement en cartes-cadeaux, activite suspecte sur votre compte.
Realite : Microsoft et Apple ne vous appellent JAMAIS de facon proactive. Les pop-ups virus dans le navigateur sont toujours des arnaques.

TYPE 9 - ARNAQUE LOCATION IMMOBILIERE :
Faux proprietaires proposant des logements inexistants.
Signaux : loyer anormalement bas, proprietaire a l'etranger, impossible de visiter, depot par virement ou cartes-cadeaux avant visite, photos volees, bail par email sans rencontre, pression pour reserver rapidement.

TYPE 10 - DEEPFAKE ET ARNAQUES IA (2024-2026) :
Utilisation de l'IA pour creer de fausses videos, voix ou contenus.
Signaux : appel vocal d'un proche en urgence demandant de l'argent (clonage vocal IA), video de celebrite promouvant un investissement, fausse video de PDG, image compromettante pour chantage (sextorsion), faux agent gouvernemental en appel video.
Verification : Raccrochez et rappelez sur le vrai numero connu.

TYPE 11 - LOTERIES, CONCOURS ET HERITAGES FRAUDULEUX :
Fausses promesses de gains pour extorquer des frais.
Signaux : selection pour recevoir un prix sans participation, frais de livraison pour un prix, heritage d'un inconnu, veuve mourante, frais croissants, demande de NAS/NIF/SSN.
Realite : On ne gagne JAMAIS un concours auquel on n'a pas participe. Les vrais prix ne necessitent JAMAIS de payer.

TYPE 12 - SEXTORSION ET CHANTAGE EN LIGNE :
Menaces de divulguer des contenus intimes.
Signaux : acces a votre webcam avec videos compromettantes, paiement en Bitcoin sinon envoi aux contacts, email contenant un vrai mot de passe (donnees volees), rencontre en ligne avec echanges intimes puis chantage.
Realite : Dans 99% des cas, ils n'ont rien. Ne payez JAMAIS.

TYPE 13 - FRAUDE DOCUMENTAIRE ET IDENTITE :
Vol de donnees personnelles.
Signaux : formulaire demandant NAS/SIN/date de naissance/passeport, verification KYC sur plateforme inconnue, selfie avec piece d'identite sur site non verifie, faux service d'immigration.

TYPE 14 - ARNAQUES AFRIQUE FRANCOPHONE :
Broutage ivoirien, faux marabout en ligne, fausse agence de visa, faux emploi au Canada/Europe avec promesse de visa, demandes Western Union/Wave/Orange Money, faux operateurs MTN/Orange/Moov, arnaque code de recharge.
Numeros suspects frequents : +234 (Nigeria), +225 (Cote d'Ivoire), +233 (Ghana), +237 (Cameroun), +221 (Senegal) dans un contexte inattendu.

=== REGLES COMPORTEMENTALES ===

1. JAMAIS de faux positifs sur des institutions verifiees. Si le domaine racine ou le shortcode correspond a une institution legitime connue, commence par le defendre, pas l'accuser.
2. TOUJOURS citer des elements specifiques du message analyse. Ne donne pas de reponses generiques.
3. ADAPTER le ton au contexte : empathie si perte d'argent, informatif si verification preventive, direct si arnaque claire.
4. TOUJOURS terminer par un conseil pratique memorisable.
5. EN CAS DE DOUTE, suggerer de verifier directement aupres de l'institution en appelant le numero officiel (au dos de la carte bancaire, sur le site officiel) et jamais en rappelant le numero fourni dans le message suspect.
6. RESPECTER la langue de l'utilisateur : francais = reponse en francais, anglais = reponse en anglais.

=== CALIBRATION DES SCORES ===
0-15 = LEGITIME : Message authentique d'une institution verifiee
16-35 = ATTENTION : Message probablement legitime mais a surveiller
36-65 = SUSPECT : Plusieurs signaux inquietants, ne pas agir sans verification
66-85 = TRES SUSPECT : Forte probabilite d'arnaque
86-100 = ARNAQUE CONFIRMEE : Ne pas interagir`;

const COUNTRY_PROMPTS: Record<Country, string> = {
  CA: `
Tu es specialise pour le CANADA (Quebec). Tu parles en francais quebecois, de maniere claire et accessible. Tu utilises le "tu".

Organismes de signalement :
Centre antifraude du Canada : 1-888-495-8501 | antifraudcentre.ca
Surete du Quebec
Revenu Quebec : signalement.gouv.qc.ca
Office de la protection du consommateur
Autorite des marches financiers (AMF)
Votre banque : appelez le numero au DOS de votre carte`,

  US: `
You specialize in the UNITED STATES. You speak clear, friendly American English. Use "you" and be approachable.

Reporting organizations:
Federal Trade Commission (FTC) : ReportFraud.ftc.gov | 1-877-382-4357
FBI Internet Crime Complaint Center (IC3) : ic3.gov
AARP Fraud Watch Network : 877-908-3360
State Attorney General's office
Better Business Bureau (BBB)
Your bank: call the number on the BACK of your card`,

  FR: `
Tu es specialise pour la FRANCE. Tu parles en francais standard, de maniere claire et accessible. Tu utilises le "vous" par defaut.

Organismes de signalement :
Cybermalveillance.gouv.fr
Signal Spam : signal-spam.fr
Pharos : internet-signalement.gouv.fr
Info Escroqueries : 0 805 805 817 (appel gratuit)
3018 (numero national)
DGCCRF (Direction generale de la concurrence)
Votre banque : appelez le numero au DOS de votre carte`,
};

function getCyrusPrompt(country: Country): string {
  return CYRUS_BASE_PROMPT + COUNTRY_PROMPTS[country];
}

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*---+\s*$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

async function imageUriToDataUrl(uri: string): Promise<string> {
  console.log('[AI] Converting image to data URL, uri prefix:', uri.substring(0, 50));
  try {
    if (uri.startsWith('data:')) {
      if (uri.length > 200) {
        console.log('[AI] URI is already a data URL, length:', uri.length);
        return uri;
      }
    }

    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Fetch image failed: HTTP ' + response.status);
    }
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';
    console.log('[AI] Blob size:', blob.size, 'type:', mimeType);

    if (blob.size === 0) {
      throw new Error('Image blob is empty');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const result = reader.result as string;
          if (!result || !result.includes(',')) {
            reject(new Error('FileReader produced invalid result'));
            return;
          }
          console.log('[AI] Data URL conversion complete, length:', result.length);
          if (result.length < 200) {
            reject(new Error('Data URL conversion produced empty result'));
            return;
          }
          resolve(result);
        } catch (e: any) {
          reject(new Error('Data URL extraction error: ' + (e?.message || 'Unknown')));
        }
      };
      reader.onerror = () => {
        reject(new Error('FileReader error during image conversion'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    console.error('[AI] imageUriToDataUrl error:', error?.message);
    throw new Error('Failed to read image: ' + (error?.message || 'Unknown error'));
  }
}

function buildDataUrl(base64: string, mimeType?: string): string {
  if (base64.startsWith('data:')) return base64;
  const mime = mimeType || 'image/jpeg';
  return `data:${mime};base64,${base64}`;
}

export async function analyzeImage(
  imageUri: string,
  language: string,
  base64Data?: string,
  country: Country = 'CA',
  mimeType?: string,
): Promise<ScanAnalysisResult> {
  console.log('[AI] Starting image analysis via Rork Toolkit');
  console.log('[AI] hasBase64:', !!base64Data, 'base64Len:', base64Data?.length ?? 0, 'mimeType:', mimeType);

  let dataUrl: string;

  if (base64Data && base64Data.length > 100) {
    dataUrl = buildDataUrl(base64Data, mimeType);
    console.log('[AI] Built data URL from provided base64, length:', dataUrl.length);
  } else if (imageUri) {
    console.log('[AI] No base64 from picker, converting from URI:', imageUri?.substring(0, 80));
    try {
      dataUrl = await imageUriToDataUrl(imageUri);
    } catch (convErr: any) {
      console.error('[AI] URI conversion failed:', convErr?.message);
      throw new Error(language === 'fr'
        ? 'Impossible de lire cette image. Essayez avec une autre photo.'
        : 'Unable to read this image. Please try with another photo.');
    }
  } else {
    throw new Error(language === 'fr'
      ? 'Aucune image fournie. Veuillez sélectionner une image.'
      : 'No image provided. Please select an image.');
  }

  if (!dataUrl || dataUrl.length < 200) {
    console.error('[AI] Data URL too short or empty:', dataUrl?.length);
    throw new Error(language === 'fr'
      ? 'Impossible de lire cette image. Essayez avec une autre photo.'
      : 'Unable to read this image. Please try with another photo.');
  }

  console.log('[AI] Final data URL length for API:', dataUrl.length, 'prefix:', dataUrl.substring(0, 40));

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

Give a clear verdict: Safe / Suspicious / Scam detected
Explain WHY with concrete country-specific examples when relevant.`;

  const userText = language === 'fr'
    ? 'Analyse cette image pour detecter des signes de fraude ou d\'arnaque. Retourne uniquement le JSON.'
    : 'Analyze this image to detect signs of fraud or scam. Return only the JSON.';

  const messages: ToolkitMessage[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: systemPrompt + '\n\n' + userText },
        { type: 'image', image: dataUrl },
      ],
    },
  ];

  console.log('[AI] Sending image analysis request to toolkit, data URL length:', dataUrl.length);
  try {
    const response = await generateText({ messages });
    console.log('[AI] Image analysis response received, length:', response?.length, 'preview:', response?.substring(0, 150));

    if (!response || response.trim().length === 0) {
      console.error('[AI] Empty or null response from toolkit');
      throw new Error(language === 'fr'
        ? 'Le service AI n\'a pas pu analyser cette image. Reessayez.'
        : 'AI service could not analyze this image. Please try again.');
    }

    let result: ScanAnalysisResult;
    try {
      result = parseJsonResponse<ScanAnalysisResult>(response);
    } catch (parseErr: any) {
      console.error('[AI] Failed to parse AI response as JSON:', parseErr?.message, 'Response preview:', response.substring(0, 300));
      throw new Error(language === 'fr'
        ? 'Reponse invalide du service AI. Reessayez.'
        : 'Invalid response from AI service. Please try again.');
    }

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
    console.error('[AI] Image analysis failed:', error?.message, error?.stack?.substring(0, 300));

    const msg = error?.message ?? '';
    if (msg.includes('Impossible') || msg.includes('Unable to read') || msg.includes('Reponse invalide') || msg.includes('Invalid response') || msg.includes('service AI') || msg.includes('Aucune image') || msg.includes('No image')) {
      throw error;
    }

    if (msg.includes('pattern') || msg.includes('Pattern') || msg.includes('did not match')) {
      console.error('[AI] Pattern match error - likely base64/data URL format issue');
      throw new Error(language === 'fr'
        ? 'Format d\'image non supporte. Essayez avec une capture d\'ecran au format JPG ou PNG.'
        : 'Unsupported image format. Try with a JPG or PNG screenshot.');
    }

    if (msg.includes('413') || msg.includes('too large') || msg.includes('payload')) {
      throw new Error(language === 'fr'
        ? 'Image trop volumineuse. Essayez avec une image plus petite.'
        : 'Image too large. Try with a smaller image.');
    }

    throw new Error(language === 'fr'
      ? 'Erreur lors de l\'analyse: ' + (msg || 'Erreur inconnue')
      : 'Analysis error: ' + (msg || 'Unknown error'));
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

  const chatBehavior = language === 'fr'
    ? `\n\nCOMPORTEMENT EN CHAT :\n- Réponds de manière simple, courte et claire\n- Fais de la prévention : explique pourquoi c'est dangereux et comment se protéger\n- Si l'utilisateur te montre un SMS, email, message WhatsApp, annonce Facebook ou lien suspect, analyse-le et dis-lui clairement si c'est une arnaque ou non\n- Donne toujours des conseils concrets : "Ne clique pas", "Bloque ce numéro", "Signale ce message"\n- Si c'est sécuritaire, rassure l'utilisateur\n- Tu n'as PAS besoin de faire un rapport formel, parle comme un ami qui protège\n- Utilise des emojis pour rendre tes réponses plus lisibles (⚠️ 🚨 ✅ 🔒 💡)\n- Si l'utilisateur pose une question générale sur les arnaques, éduque-le avec des exemples concrets`
    : `\n\nCHAT BEHAVIOR:\n- Respond in a simple, short and clear way\n- Focus on prevention: explain why something is dangerous and how to stay safe\n- If the user shows you a suspicious SMS, email, WhatsApp message, Facebook ad or link, analyze it and clearly tell them if it's a scam or not\n- Always give concrete advice: "Don't click", "Block this number", "Report this message"\n- If it's safe, reassure the user\n- You do NOT need to make a formal report, talk like a friend who's looking out for them\n- Use emojis to make your responses easier to read (⚠️ 🚨 ✅ 🔒 💡)\n- If the user asks a general question about scams, educate them with concrete examples`;

  const systemContent = `${getCyrusPrompt(country)}\n\n${langInstruction}${chatBehavior}`;

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
  return stripMarkdown(response || '');
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
  return stripMarkdown(response || '');
}
