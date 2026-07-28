import type { Country } from '@/contexts/AppContext';
import type { Language } from '@/constants/translations';

export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP' | 'CHF' | 'AUD' | 'MAD' | 'MXN';

export interface ReportingOrg {
  name: string;
  nameEn: string;
  url: string;
  phone: string;
}

export interface CountryConfig {
  code: Country;
  labelFr: string;
  labelEn: string;
  flag: string;
  currency: Currency;
  currencySymbol: string;
  availableLanguages: Language[];
  defaultLanguage: Language;
  reportingOrganizations: ReportingOrg[];
  pricing: {
    monthly: string;
    annual: string;
    monthlyEquivalent: string;
  };
}

const PRICING_EUR = { monthly: '2.99', annual: '29.99', monthlyEquivalent: '2.50' };
const PRICING_USD = { monthly: '2.99', annual: '29.99', monthlyEquivalent: '2.50' };
const PRICING_CAD = { monthly: '2.99', annual: '29.99', monthlyEquivalent: '2.50' };
const PRICING_CHF = { monthly: '2.99', annual: '29.99', monthlyEquivalent: '2.50' };
const PRICING_GBP = { monthly: '2.49', annual: '24.99', monthlyEquivalent: '2.08' };
const PRICING_AUD = { monthly: '4.49', annual: '44.99', monthlyEquivalent: '3.75' };
const PRICING_MAD = { monthly: '29', annual: '299', monthlyEquivalent: '24.92' };
const PRICING_MXN = { monthly: '59', annual: '599', monthlyEquivalent: '49.92' };

export const countryConfigs: Record<Country, CountryConfig> = {
  CA: {
    code: 'CA',
    labelFr: 'Canada',
    labelEn: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: 'CA$',
    availableLanguages: ['fr', 'en'],
    defaultLanguage: 'fr',
    reportingOrganizations: [
      { name: 'Centre antifraude du Canada (CAFC)', nameEn: 'Canadian Anti-Fraud Centre (CAFC)', url: 'https://www.antifraudcentre-centreantifraude.ca', phone: '1-888-495-8501' },
      { name: 'Sûreté du Québec', nameEn: 'Sûreté du Québec', url: 'https://www.sq.gouv.qc.ca', phone: '' },
      { name: 'Office de la protection du consommateur', nameEn: 'Office de la protection du consommateur', url: 'https://www.opc.gouv.qc.ca', phone: '' },
      { name: 'Autorité des marchés financiers (AMF)', nameEn: 'Autorité des marchés financiers (AMF)', url: 'https://lautorite.qc.ca', phone: '' },
    ],
    pricing: PRICING_CAD,
  },
  US: {
    code: 'US',
    labelFr: 'États-Unis',
    labelEn: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    availableLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'Federal Trade Commission (FTC)', nameEn: 'Federal Trade Commission (FTC)', url: 'https://reportfraud.ftc.gov', phone: '1-877-382-4357' },
      { name: 'FBI Internet Crime Complaint Center (IC3)', nameEn: 'FBI Internet Crime Complaint Center (IC3)', url: 'https://www.ic3.gov', phone: '' },
      { name: 'IdentityTheft.gov (vol d\'identité)', nameEn: 'IdentityTheft.gov (identity theft)', url: 'https://www.identitytheft.gov', phone: '1-877-438-4338' },
      { name: 'CFPB (plaintes bancaires)', nameEn: 'CFPB (financial complaints)', url: 'https://www.consumerfinance.gov/complaint', phone: '1-855-411-2372' },
      { name: 'US Postal Inspection Service (arnaques par courrier/colis)', nameEn: 'US Postal Inspection Service (mail & package scams)', url: 'https://www.uspis.gov/report', phone: '1-877-876-2455' },
      { name: 'AARP Fraud Watch Network', nameEn: 'AARP Fraud Watch Network', url: 'https://www.aarp.org/money/scams-fraud', phone: '877-908-3360' },
    ],
    pricing: PRICING_USD,
  },
  FR: {
    code: 'FR',
    labelFr: 'France',
    labelEn: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€',
    availableLanguages: ['fr', 'en'],
    defaultLanguage: 'fr',
    reportingOrganizations: [
      { name: 'Cybermalveillance.gouv.fr', nameEn: 'Cybermalveillance.gouv.fr', url: 'https://www.cybermalveillance.gouv.fr', phone: '0 805 805 817' },
      { name: 'Signal Spam', nameEn: 'Signal Spam', url: 'https://www.signal-spam.fr', phone: '' },
      { name: 'Pharos (Signalement en ligne)', nameEn: 'Pharos (Online Reporting)', url: 'https://www.internet-signalement.gouv.fr', phone: '' },
      { name: 'Info Escroqueries', nameEn: 'Info Escroqueries', url: 'https://www.service-public.fr', phone: '0 805 805 817' },
    ],
    pricing: PRICING_EUR,
  },
  ES: {
    code: 'ES',
    labelFr: 'Espagne',
    labelEn: 'Spain',
    flag: '🇪🇸',
    currency: 'EUR',
    currencySymbol: '€',
    availableLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'INCIBE - Línea de ayuda en ciberseguridad', nameEn: 'INCIBE - Cybersecurity Helpline', url: 'https://www.incibe.es/ciudadania', phone: '017' },
      { name: 'Policía Nacional - Denuncias online', nameEn: 'Policía Nacional - Online Reports', url: 'https://www.policia.es/_es/colabora_informacion.php', phone: '091' },
      { name: 'Guardia Civil - Grupo de Delitos Telemáticos', nameEn: 'Guardia Civil - Cybercrime Unit', url: 'https://www.gdt.guardiacivil.es/webgdt/pparalelo.php', phone: '062' },
      { name: 'OCU / Consumo (autoridad de consumo)', nameEn: 'OCU / Consumer Protection Authority', url: 'https://www.consumo.gob.es', phone: '' },
    ],
    pricing: PRICING_EUR,
  },
  BE: {
    code: 'BE',
    labelFr: 'Belgique',
    labelEn: 'Belgium',
    flag: '🇧🇪',
    currency: 'EUR',
    currencySymbol: '€',
    availableLanguages: ['fr', 'en'],
    defaultLanguage: 'fr',
    reportingOrganizations: [
      { name: 'Safeonweb (CCB) - suspect@safeonweb.be', nameEn: 'Safeonweb (CCB) - suspect@safeonweb.be', url: 'https://safeonweb.be', phone: '' },
      { name: 'Point de contact SPF Économie', nameEn: 'Belgian Economy FPS Contact Point', url: 'https://pointdecontact.belgique.be', phone: '0800 120 33' },
      { name: 'Police locale (dépôt de plainte)', nameEn: 'Local Police (file a complaint)', url: 'https://www.police.be', phone: '101' },
      { name: 'Febelfin (fraude bancaire)', nameEn: 'Febelfin (banking fraud)', url: 'https://www.febelfin.be', phone: '' },
    ],
    pricing: PRICING_EUR,
  },
  CH: {
    code: 'CH',
    labelFr: 'Suisse',
    labelEn: 'Switzerland',
    flag: '🇨🇭',
    currency: 'CHF',
    currencySymbol: 'CHF',
    availableLanguages: ['fr', 'en'],
    defaultLanguage: 'fr',
    reportingOrganizations: [
      { name: 'OFCS / NCSC - Signaler un incident', nameEn: 'NCSC Switzerland - Report an incident', url: 'https://www.report.ncsc.admin.ch', phone: '' },
      { name: 'Cybercrimepolice (police cantonale)', nameEn: 'Cybercrimepolice (cantonal police)', url: 'https://www.cybercrimepolice.ch', phone: '117' },
      { name: 'Bureau fédéral de la consommation (BFC)', nameEn: 'Federal Consumer Affairs Bureau', url: 'https://www.konsum.admin.ch', phone: '' },
      { name: 'Votre banque : numéro au dos de la carte', nameEn: 'Your bank: number on the back of your card', url: '', phone: '' },
    ],
    pricing: PRICING_CHF,
  },
  GB: {
    code: 'GB',
    labelFr: 'Royaume-Uni',
    labelEn: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    availableLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'Action Fraud', nameEn: 'Action Fraud', url: 'https://www.actionfraud.police.uk', phone: '0300 123 2040' },
      { name: 'NCSC - report@phishing.gov.uk / SMS au 7726', nameEn: 'NCSC - report@phishing.gov.uk / forward texts to 7726', url: 'https://www.ncsc.gov.uk/section/about-this-website/report-scam-website', phone: '7726' },
      { name: 'Citizens Advice Consumer Service', nameEn: 'Citizens Advice Consumer Service', url: 'https://www.citizensadvice.org.uk/consumer', phone: '0808 223 1133' },
      { name: 'Financial Conduct Authority (FCA)', nameEn: 'Financial Conduct Authority (FCA)', url: 'https://www.fca.org.uk/consumers', phone: '0800 111 6768' },
    ],
    pricing: PRICING_GBP,
  },
  DE: {
    code: 'DE',
    labelFr: 'Allemagne',
    labelEn: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    currencySymbol: '€',
    availableLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'Polizei - Online-Wache (plainte en ligne)', nameEn: 'Polizei - Online-Wache (online complaint)', url: 'https://www.polizei.de', phone: '110' },
      { name: 'BSI - Bürger-CERT', nameEn: 'BSI - Federal Office for Information Security', url: 'https://www.bsi.bund.de', phone: '' },
      { name: 'Verbraucherzentrale (Phishing-Radar)', nameEn: 'Verbraucherzentrale (Phishing Radar)', url: 'https://www.verbraucherzentrale.de', phone: '' },
      { name: 'BaFin (fraude financière)', nameEn: 'BaFin (financial fraud)', url: 'https://www.bafin.de', phone: '' },
    ],
    pricing: PRICING_EUR,
  },
  IT: {
    code: 'IT',
    labelFr: 'Italie',
    labelEn: 'Italy',
    flag: '🇮🇹',
    currency: 'EUR',
    currencySymbol: '€',
    availableLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'Polizia Postale e delle Comunicazioni', nameEn: 'Polizia Postale (Cybercrime Police)', url: 'https://www.commissariatodips.it', phone: '113' },
      { name: 'ACN - Agenzia per la Cybersicurezza Nazionale', nameEn: 'ACN - National Cybersecurity Agency', url: 'https://www.acn.gov.it', phone: '' },
      { name: 'AGCM (protection des consommateurs)', nameEn: 'AGCM (consumer protection)', url: 'https://www.agcm.it', phone: '800 166 661' },
      { name: 'Altroconsumo', nameEn: 'Altroconsumo', url: 'https://www.altroconsumo.it', phone: '' },
    ],
    pricing: PRICING_EUR,
  },
  PT: {
    code: 'PT',
    labelFr: 'Portugal',
    labelEn: 'Portugal',
    flag: '🇵🇹',
    currency: 'EUR',
    currencySymbol: '€',
    availableLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'Polícia Judiciária - Cibercrime', nameEn: 'Polícia Judiciária - Cybercrime Unit', url: 'https://www.policiajudiciaria.pt', phone: '' },
      { name: 'CNCS - Centro Nacional de Cibersegurança', nameEn: 'CNCS - National Cybersecurity Centre', url: 'https://www.cncs.gov.pt', phone: '' },
      { name: 'DECO PROteste', nameEn: 'DECO PROteste', url: 'https://www.deco.proteste.pt', phone: '' },
      { name: 'Portal da Queixa / DGC', nameEn: 'Consumer Complaints Portal / DGC', url: 'https://www.consumidor.gov.pt', phone: '' },
    ],
    pricing: PRICING_EUR,
  },
  NL: {
    code: 'NL',
    labelFr: 'Pays-Bas',
    labelEn: 'Netherlands',
    flag: '🇳🇱',
    currency: 'EUR',
    currencySymbol: '€',
    availableLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'Fraudehelpdesk', nameEn: 'Fraudehelpdesk (Dutch Fraud Helpdesk)', url: 'https://www.fraudehelpdesk.nl', phone: '088 786 7372' },
      { name: 'Politie (plainte en ligne)', nameEn: 'Politie (online report)', url: 'https://www.politie.nl/aangifte-of-melding-doen', phone: '0900 8844' },
      { name: 'ACM ConsuWijzer', nameEn: 'ACM ConsuWijzer', url: 'https://www.consuwijzer.nl', phone: '' },
      { name: 'Veiliginternetten.nl', nameEn: 'Veiliginternetten.nl', url: 'https://veiliginternetten.nl', phone: '' },
    ],
    pricing: PRICING_EUR,
  },
  LU: {
    code: 'LU',
    labelFr: 'Luxembourg',
    labelEn: 'Luxembourg',
    flag: '🇱🇺',
    currency: 'EUR',
    currencySymbol: '€',
    availableLanguages: ['fr', 'en'],
    defaultLanguage: 'fr',
    reportingOrganizations: [
      { name: 'BEE SECURE / CIRCL', nameEn: 'BEE SECURE / CIRCL', url: 'https://www.bee-secure.lu', phone: '8002 1234' },
      { name: 'Police Grand-Ducale', nameEn: 'Grand Ducal Police', url: 'https://police.public.lu', phone: '113' },
      { name: 'Union Luxembourgeoise des Consommateurs (ULC)', nameEn: 'Luxembourg Consumer Union (ULC)', url: 'https://www.ulc.lu', phone: '' },
      { name: 'CSSF (fraude financière)', nameEn: 'CSSF (financial fraud)', url: 'https://www.cssf.lu', phone: '' },
    ],
    pricing: PRICING_EUR,
  },
  IE: {
    code: 'IE',
    labelFr: 'Irlande',
    labelEn: 'Ireland',
    flag: '🇮🇪',
    currency: 'EUR',
    currencySymbol: '€',
    availableLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'Garda National Economic Crime Bureau', nameEn: 'Garda National Economic Crime Bureau', url: 'https://www.garda.ie', phone: '112' },
      { name: 'CCPC - Consumer Helpline', nameEn: 'CCPC - Consumer Helpline', url: 'https://www.ccpc.ie', phone: '01 402 5555' },
      { name: 'NCSC Ireland', nameEn: 'NCSC Ireland', url: 'https://www.ncsc.gov.ie', phone: '' },
      { name: 'FraudSMART (BPFI)', nameEn: 'FraudSMART (BPFI)', url: 'https://www.fraudsmart.ie', phone: '' },
    ],
    pricing: PRICING_EUR,
  },
  AU: {
    code: 'AU',
    labelFr: 'Australie',
    labelEn: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    currencySymbol: 'A$',
    availableLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'Scamwatch (ACCC)', nameEn: 'Scamwatch (ACCC)', url: 'https://www.scamwatch.gov.au', phone: '' },
      { name: 'ReportCyber (ASD/ACSC)', nameEn: 'ReportCyber (ASD/ACSC)', url: 'https://www.cyber.gov.au/report', phone: '1300 292 371' },
      { name: 'IDCARE (vol d\'identité)', nameEn: 'IDCARE (identity theft)', url: 'https://www.idcare.org', phone: '1800 595 160' },
      { name: 'ASIC MoneySmart', nameEn: 'ASIC MoneySmart', url: 'https://moneysmart.gov.au', phone: '' },
    ],
    pricing: PRICING_AUD,
  },
  MA: {
    code: 'MA',
    labelFr: 'Maroc',
    labelEn: 'Morocco',
    flag: '🇲🇦',
    currency: 'MAD',
    currencySymbol: 'MAD',
    availableLanguages: ['fr', 'en'],
    defaultLanguage: 'fr',
    reportingOrganizations: [
      { name: 'DGSN - Plateforme E-Blagh', nameEn: 'DGSN - E-Blagh reporting platform', url: 'https://eblagh.dgsn.gov.ma', phone: '19' },
      { name: 'maCERT (DGSSI)', nameEn: 'maCERT (DGSSI)', url: 'https://www.dgssi.gov.ma', phone: '' },
      { name: 'CNDP (protection des données)', nameEn: 'CNDP (data protection)', url: 'https://www.cndp.ma', phone: '' },
      { name: 'Bank Al-Maghrib / votre banque', nameEn: 'Bank Al-Maghrib / your bank', url: 'https://www.bkam.ma', phone: '' },
    ],
    pricing: PRICING_MAD,
  },
  MX: {
    code: 'MX',
    labelFr: 'Mexique',
    labelEn: 'Mexico',
    flag: '🇲🇽',
    currency: 'MXN',
    currencySymbol: 'MX$',
    availableLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'CONDUSEF (fraude financière)', nameEn: 'CONDUSEF (financial fraud)', url: 'https://www.condusef.gob.mx', phone: '55 5340 0999' },
      { name: 'Guardia Nacional - Policía Cibernética', nameEn: 'Guardia Nacional - Cyber Police', url: 'https://www.gob.mx/gncertmx', phone: '088' },
      { name: 'PROFECO (protection du consommateur)', nameEn: 'PROFECO (consumer protection)', url: 'https://www.profeco.gob.mx', phone: '55 5568 8722' },
      { name: 'Votre banque : numéro officiel au dos de la carte', nameEn: 'Your bank: official number on the back of your card', url: '', phone: '' },
    ],
    pricing: PRICING_MXN,
  },
  INTL: {
    code: 'INTL',
    labelFr: 'Autre pays (international)',
    labelEn: 'Other country (international)',
    flag: '🌍',
    currency: 'USD',
    currencySymbol: '$',
    availableLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'eConsumer.gov (plaintes transfrontalières)', nameEn: 'eConsumer.gov (cross-border complaints)', url: 'https://www.econsumer.gov', phone: '' },
      { name: 'Police locale / cybercrime national', nameEn: 'Local police / national cybercrime unit', url: '', phone: '' },
      { name: 'Autorité de protection du consommateur de votre pays', nameEn: 'Consumer protection authority in your country', url: '', phone: '' },
      { name: 'Votre banque : numéro officiel au dos de la carte', nameEn: 'Your bank: official number on the back of your card', url: '', phone: '' },
    ],
    pricing: PRICING_USD,
  },
};

export interface AlertData {
  id: string;
  date: string;
  title: string;
  desc: string;
  severity: 'high' | 'medium';
}

type LocalizedAlerts = { fr: AlertData[]; en: AlertData[] };

export const countryAlerts: Record<Country, LocalizedAlerts> = {
  CA: {
    fr: [
      { id: 'ca-1', date: '2026-03-06', title: 'Faux textos Desjardins en circulation', desc: 'Des SMS frauduleux imitant Desjardins demandent de "vérifier votre identité" via un lien suspect. Ne cliquez pas!', severity: 'high' },
      { id: 'ca-2', date: '2026-03-05', title: 'Arnaque "Bonjour maman" par texto', desc: 'Des fraudeurs envoient des textos se faisant passer pour votre enfant depuis un nouveau numéro, demandant un virement urgent.', severity: 'high' },
      { id: 'ca-3', date: '2026-03-04', title: 'Faux concours Tim Hortons sur Facebook', desc: 'Un faux concours promet une carte-cadeau de 500$ Tim Hortons. Le lien mène à un site de phishing.', severity: 'medium' },
      { id: 'ca-4', date: '2026-03-03', title: 'Fausse facture Hydro-Québec par courriel', desc: 'Des courriels frauduleux menacent de couper l\'électricité si vous ne payez pas immédiatement via un lien.', severity: 'high' },
    ],
    en: [
      { id: 'ca-1', date: '2026-03-06', title: 'Fake Desjardins texts circulating', desc: 'Fraudulent SMS imitating Desjardins asking to "verify your identity" via a suspicious link. Do not click!', severity: 'high' },
      { id: 'ca-2', date: '2026-03-05', title: '"Hi mom" text scam', desc: 'Scammers send texts pretending to be your child from a new number, requesting an urgent transfer.', severity: 'high' },
      { id: 'ca-3', date: '2026-03-04', title: 'Fake Tim Hortons contest on Facebook', desc: 'A fake contest promises a $500 Tim Hortons gift card. The link leads to a phishing site.', severity: 'medium' },
      { id: 'ca-4', date: '2026-03-03', title: 'Fake Hydro-Québec invoice by email', desc: 'Fraudulent emails threaten to cut electricity if you don\'t pay immediately via a link.', severity: 'high' },
    ],
  },
  US: {
    fr: [
      { id: 'us-1', date: '2026-03-06', title: 'Arnaque IRS - "Vous devez des impôts"', desc: 'Des appels robotisés prétendent venir de l\'IRS et menacent d\'arrestation si vous ne payez pas immédiatement par carte cadeau.', severity: 'high' },
      { id: 'us-2', date: '2026-03-05', title: 'Faux colis USPS / FedEx', desc: 'Des SMS frauduleux imitent USPS ou FedEx avec un lien pour "reprogrammer votre livraison". Ne cliquez pas!', severity: 'high' },
      { id: 'us-3', date: '2026-03-04', title: 'Arnaque Social Security', desc: 'Des escrocs prétendent que votre numéro de sécurité sociale a été compromis et demandent un paiement immédiat.', severity: 'high' },
      { id: 'us-4', date: '2026-03-03', title: 'Faux support Amazon', desc: 'Des emails imitant Amazon prétendent qu\'un achat non autorisé a été effectué sur votre compte.', severity: 'medium' },
    ],
    en: [
      { id: 'us-1', date: '2026-03-06', title: 'IRS scam - "You owe back taxes"', desc: 'Robocalls claiming to be from the IRS threaten arrest if you don\'t pay immediately via gift cards.', severity: 'high' },
      { id: 'us-2', date: '2026-03-05', title: 'Fake USPS / FedEx delivery', desc: 'Fraudulent texts impersonate USPS or FedEx with a link to "reschedule your delivery". Do not click!', severity: 'high' },
      { id: 'us-3', date: '2026-03-04', title: 'Social Security scam', desc: 'Scammers claim your Social Security number has been compromised and demand immediate payment.', severity: 'high' },
      { id: 'us-4', date: '2026-03-03', title: 'Fake Amazon support', desc: 'Emails impersonating Amazon claim an unauthorized purchase was made on your account.', severity: 'medium' },
    ],
  },
  FR: {
    fr: [
      { id: 'fr-1', date: '2026-03-06', title: 'Arnaque au CPF très active', desc: 'Des appels et SMS promettent de "sauver votre solde CPF avant expiration". Le CPF n\'expire jamais! Ne communiquez pas vos identifiants.', severity: 'high' },
      { id: 'fr-2', date: '2026-03-05', title: 'Faux mails Ameli / Assurance Maladie', desc: 'Des emails frauduleux imitent Ameli et demandent de mettre à jour votre carte Vitale en cliquant sur un lien piégé.', severity: 'high' },
      { id: 'fr-3', date: '2026-03-04', title: 'Arnaque vignette Crit\'Air', desc: 'Des SMS prétendent que vous devez commander votre vignette Crit\'Air en urgence via un faux site qui copie le site officiel.', severity: 'high' },
      { id: 'fr-4', date: '2026-03-03', title: 'Fausse facture EDF / Engie', desc: 'Des emails frauduleux menacent de couper votre électricité. EDF et Engie ne menacent jamais par email.', severity: 'medium' },
    ],
    en: [
      { id: 'fr-1', date: '2026-03-06', title: 'CPF training account scam very active', desc: 'Calls and texts promise to "save your CPF balance before expiration". CPF never expires! Never share your credentials.', severity: 'high' },
      { id: 'fr-2', date: '2026-03-05', title: 'Fake Ameli / Health Insurance emails', desc: 'Fraudulent emails impersonate Ameli and ask you to update your Carte Vitale by clicking a malicious link.', severity: 'high' },
      { id: 'fr-3', date: '2026-03-04', title: 'Crit\'Air sticker scam', desc: 'Texts claim you must urgently order your Crit\'Air sticker via a fake site that copies the official one.', severity: 'high' },
      { id: 'fr-4', date: '2026-03-03', title: 'Fake EDF / Engie invoice', desc: 'Fraudulent emails threaten to cut your electricity. EDF and Engie never threaten via email.', severity: 'medium' },
    ],
  },
  ES: {
    fr: [
      { id: 'es-1', date: '2026-03-06', title: 'Faux SMS Correos "colis en attente"', desc: 'Des SMS imitant Correos demandent des frais de douane via un lien. Correos ne réclame jamais de paiement par SMS.', severity: 'high' },
      { id: 'es-2', date: '2026-03-05', title: 'Phishing bancaire CaixaBank / Santander / BBVA', desc: 'Faux SMS et emails annoncent un "blocage de compte" et redirigent vers une fausse page de connexion.', severity: 'high' },
      { id: 'es-3', date: '2026-03-04', title: 'Arnaque Agencia Tributaria (Hacienda)', desc: 'Emails prétendant un remboursement d\'impôt et demandant vos coordonnées bancaires. Hacienda ne procède jamais ainsi.', severity: 'high' },
      { id: 'es-4', date: '2026-03-03', title: 'Faux appels "soporte técnico"', desc: 'De faux techniciens Microsoft/Movistar demandent un accès à distance à votre ordinateur.', severity: 'medium' },
    ],
    en: [
      { id: 'es-1', date: '2026-03-06', title: 'Fake Correos "parcel on hold" texts', desc: 'Texts impersonating Correos request customs fees via a link. Correos never asks for payment by SMS.', severity: 'high' },
      { id: 'es-2', date: '2026-03-05', title: 'CaixaBank / Santander / BBVA phishing', desc: 'Fake texts and emails claim your account is blocked and lead to a fake login page.', severity: 'high' },
      { id: 'es-3', date: '2026-03-04', title: 'Agencia Tributaria (Hacienda) scam', desc: 'Emails promise a tax refund and ask for your bank details. Hacienda never does this.', severity: 'high' },
      { id: 'es-4', date: '2026-03-03', title: 'Fake "soporte técnico" calls', desc: 'Fake Microsoft/Movistar technicians ask for remote access to your computer.', severity: 'medium' },
    ],
  },
  BE: {
    fr: [
      { id: 'be-1', date: '2026-03-06', title: 'Faux emails Itsme / banque', desc: 'Des messages demandent de "réactiver Itsme" via un lien. Itsme ne demande jamais vos codes par email ou SMS.', severity: 'high' },
      { id: 'be-2', date: '2026-03-05', title: 'Arnaque bpost "frais de colis"', desc: 'SMS frauduleux imitant bpost réclamant 1,79 € pour libérer un colis. Le but est de voler votre carte bancaire.', severity: 'high' },
      { id: 'be-3', date: '2026-03-04', title: 'Faux conseillers bancaires (Belfius, KBC, ING)', desc: 'Des appels usurpant le numéro de votre banque vous demandent de confirmer une transaction avec votre lecteur de carte.', severity: 'high' },
      { id: 'be-4', date: '2026-03-03', title: 'Faux remboursement SPF Finances', desc: 'Emails annonçant un remboursement d\'impôt avec lien vers un faux Tax-on-web.', severity: 'medium' },
    ],
    en: [
      { id: 'be-1', date: '2026-03-06', title: 'Fake Itsme / bank emails', desc: 'Messages ask you to "reactivate Itsme" via a link. Itsme never asks for your codes by email or SMS.', severity: 'high' },
      { id: 'be-2', date: '2026-03-05', title: 'bpost "parcel fee" scam', desc: 'Fraudulent texts impersonating bpost ask for €1.79 to release a parcel. The goal is to steal your card details.', severity: 'high' },
      { id: 'be-3', date: '2026-03-04', title: 'Fake bank advisors (Belfius, KBC, ING)', desc: 'Calls spoofing your bank\'s number ask you to confirm a transaction with your card reader.', severity: 'high' },
      { id: 'be-4', date: '2026-03-03', title: 'Fake FPS Finance refund', desc: 'Emails announcing a tax refund with a link to a fake Tax-on-web portal.', severity: 'medium' },
    ],
  },
  CH: {
    fr: [
      { id: 'ch-1', date: '2026-03-06', title: 'Faux SMS Poste Suisse', desc: 'Des SMS annoncent un colis bloqué et demandent des frais via un lien. La Poste ne réclame jamais de paiement par SMS.', severity: 'high' },
      { id: 'ch-2', date: '2026-03-05', title: 'Phishing PostFinance / UBS', desc: 'Emails demandant de "réactiver votre e-banking" avec un lien vers une fausse page de connexion.', severity: 'high' },
      { id: 'ch-3', date: '2026-03-04', title: 'Faux appels police / Interpol', desc: 'Des escrocs se font passer pour la police et demandent de transférer votre argent sur un "compte sécurisé".', severity: 'high' },
      { id: 'ch-4', date: '2026-03-03', title: 'Faux investissements crypto', desc: 'Publicités avec de fausses recommandations de personnalités suisses promettant des rendements garantis.', severity: 'medium' },
    ],
    en: [
      { id: 'ch-1', date: '2026-03-06', title: 'Fake Swiss Post texts', desc: 'Texts claim a parcel is on hold and ask for a fee via a link. Swiss Post never requests payment by SMS.', severity: 'high' },
      { id: 'ch-2', date: '2026-03-05', title: 'PostFinance / UBS phishing', desc: 'Emails ask you to "reactivate your e-banking" with a link to a fake login page.', severity: 'high' },
      { id: 'ch-3', date: '2026-03-04', title: 'Fake police / Interpol calls', desc: 'Scammers impersonate the police and ask you to move your money to a "secure account".', severity: 'high' },
      { id: 'ch-4', date: '2026-03-03', title: 'Fake crypto investments', desc: 'Ads with fake endorsements from Swiss celebrities promising guaranteed returns.', severity: 'medium' },
    ],
  },
  GB: {
    fr: [
      { id: 'gb-1', date: '2026-03-06', title: 'Faux SMS Royal Mail / DPD', desc: 'SMS réclamant des frais de livraison via un lien. Transférez ces messages au 7726 (gratuit).', severity: 'high' },
      { id: 'gb-2', date: '2026-03-05', title: 'Arnaque HMRC "remboursement d\'impôt"', desc: 'Emails et SMS promettant un remboursement HMRC pour voler vos coordonnées bancaires.', severity: 'high' },
      { id: 'gb-3', date: '2026-03-04', title: 'Fraude bancaire APP (faux virement)', desc: 'De faux employés de banque appellent et demandent de transférer vos fonds vers un "compte sûr".', severity: 'high' },
      { id: 'gb-4', date: '2026-03-03', title: 'Faux DVLA / amendes de stationnement', desc: 'Messages prétendant un problème de taxe véhicule avec lien de paiement frauduleux.', severity: 'medium' },
    ],
    en: [
      { id: 'gb-1', date: '2026-03-06', title: 'Fake Royal Mail / DPD texts', desc: 'Texts demanding delivery fees via a link. Forward these messages to 7726 (free).', severity: 'high' },
      { id: 'gb-2', date: '2026-03-05', title: 'HMRC "tax refund" scam', desc: 'Emails and texts promising an HMRC refund to steal your banking details.', severity: 'high' },
      { id: 'gb-3', date: '2026-03-04', title: 'APP bank transfer fraud', desc: 'Fake bank staff call and ask you to move your funds to a "safe account".', severity: 'high' },
      { id: 'gb-4', date: '2026-03-03', title: 'Fake DVLA / parking fines', desc: 'Messages claiming a vehicle tax problem with a fraudulent payment link.', severity: 'medium' },
    ],
  },
  DE: {
    fr: [
      { id: 'de-1', date: '2026-03-06', title: 'Faux SMS DHL "colis en attente"', desc: 'SMS frauduleux imitant DHL avec un lien de suivi menant à une page de phishing.', severity: 'high' },
      { id: 'de-2', date: '2026-03-05', title: 'Phishing Sparkasse / Volksbank', desc: 'Emails demandant de confirmer vos données pushTAN. Les banques ne demandent jamais cela par email.', severity: 'high' },
      { id: 'de-3', date: '2026-03-04', title: 'Arnaque "Enkeltrick" par WhatsApp', desc: 'Des escrocs se font passer pour un proche avec un nouveau numéro et demandent un virement urgent.', severity: 'high' },
      { id: 'de-4', date: '2026-03-03', title: 'Fausses factures Amazon / PayPal', desc: 'Emails annonçant un achat non autorisé pour vous pousser à cliquer sur un lien piégé.', severity: 'medium' },
    ],
    en: [
      { id: 'de-1', date: '2026-03-06', title: 'Fake DHL "parcel on hold" texts', desc: 'Fraudulent texts impersonating DHL with a tracking link leading to a phishing page.', severity: 'high' },
      { id: 'de-2', date: '2026-03-05', title: 'Sparkasse / Volksbank phishing', desc: 'Emails asking you to confirm pushTAN data. Banks never ask this by email.', severity: 'high' },
      { id: 'de-3', date: '2026-03-04', title: '"Enkeltrick" WhatsApp scam', desc: 'Scammers pretend to be a relative with a new number and request an urgent transfer.', severity: 'high' },
      { id: 'de-4', date: '2026-03-03', title: 'Fake Amazon / PayPal invoices', desc: 'Emails claiming an unauthorized purchase to push you to click a malicious link.', severity: 'medium' },
    ],
  },
  IT: {
    fr: [
      { id: 'it-1', date: '2026-03-06', title: 'Faux SMS Poste Italiane', desc: 'SMS annonçant un blocage de compte BancoPosta avec lien vers une fausse page.', severity: 'high' },
      { id: 'it-2', date: '2026-03-05', title: 'Phishing Agenzia delle Entrate', desc: 'Emails promettant un remboursement fiscal pour collecter vos données bancaires.', severity: 'high' },
      { id: 'it-3', date: '2026-03-04', title: 'Arnaque SPID / Intesa Sanpaolo', desc: 'Faux messages demandant de "revalider votre SPID" via un lien frauduleux.', severity: 'high' },
      { id: 'it-4', date: '2026-03-03', title: 'Faux appels opérateur (TIM, Enel)', desc: 'De faux conseillers proposent des offres et demandent vos données bancaires par téléphone.', severity: 'medium' },
    ],
    en: [
      { id: 'it-1', date: '2026-03-06', title: 'Fake Poste Italiane texts', desc: 'Texts claiming your BancoPosta account is blocked, with a link to a fake page.', severity: 'high' },
      { id: 'it-2', date: '2026-03-05', title: 'Agenzia delle Entrate phishing', desc: 'Emails promising a tax refund to harvest your banking details.', severity: 'high' },
      { id: 'it-3', date: '2026-03-04', title: 'SPID / Intesa Sanpaolo scam', desc: 'Fake messages asking you to "revalidate your SPID" through a fraudulent link.', severity: 'high' },
      { id: 'it-4', date: '2026-03-03', title: 'Fake utility/operator calls (TIM, Enel)', desc: 'Fake agents offer deals and ask for your banking details over the phone.', severity: 'medium' },
    ],
  },
  PT: {
    fr: [
      { id: 'pt-1', date: '2026-03-06', title: 'Faux SMS CTT "taxes de colis"', desc: 'SMS imitant les CTT réclamant un petit paiement pour libérer un colis.', severity: 'high' },
      { id: 'pt-2', date: '2026-03-05', title: 'Phishing MB Way / Millennium BCP', desc: 'Messages demandant de confirmer une opération MB Way via un lien frauduleux.', severity: 'high' },
      { id: 'pt-3', date: '2026-03-04', title: 'Arnaque Autoridade Tributária', desc: 'Emails annonçant une dette fiscale urgente avec lien de paiement falsifié.', severity: 'high' },
      { id: 'pt-4', date: '2026-03-03', title: 'Fausse facture EDP', desc: 'Emails menaçant de couper l\'électricité si vous ne payez pas immédiatement.', severity: 'medium' },
    ],
    en: [
      { id: 'pt-1', date: '2026-03-06', title: 'Fake CTT "parcel fee" texts', desc: 'Texts impersonating CTT asking for a small payment to release a parcel.', severity: 'high' },
      { id: 'pt-2', date: '2026-03-05', title: 'MB Way / Millennium BCP phishing', desc: 'Messages asking you to confirm an MB Way operation via a fraudulent link.', severity: 'high' },
      { id: 'pt-3', date: '2026-03-04', title: 'Autoridade Tributária scam', desc: 'Emails claiming an urgent tax debt with a spoofed payment link.', severity: 'high' },
      { id: 'pt-4', date: '2026-03-03', title: 'Fake EDP invoice', desc: 'Emails threatening to cut electricity unless you pay immediately.', severity: 'medium' },
    ],
  },
  NL: {
    fr: [
      { id: 'nl-1', date: '2026-03-06', title: 'Arnaque WhatsApp "vriend in nood"', desc: 'Des escrocs se font passer pour un ami et demandent un paiement Tikkie urgent.', severity: 'high' },
      { id: 'nl-2', date: '2026-03-05', title: 'Faux Tikkie / ING / Rabobank', desc: 'SMS et emails avec de faux liens Tikkie pour voler vos identifiants bancaires.', severity: 'high' },
      { id: 'nl-3', date: '2026-03-04', title: 'Faux collaborateurs bancaires (spoofing)', desc: 'Appels usurpant le numéro de votre banque demandant de transférer votre argent.', severity: 'high' },
      { id: 'nl-4', date: '2026-03-03', title: 'Faux SMS PostNL', desc: 'Messages réclamant des frais de livraison via un lien frauduleux.', severity: 'medium' },
    ],
    en: [
      { id: 'nl-1', date: '2026-03-06', title: 'WhatsApp "friend in need" scam', desc: 'Scammers pretend to be a friend and request an urgent Tikkie payment.', severity: 'high' },
      { id: 'nl-2', date: '2026-03-05', title: 'Fake Tikkie / ING / Rabobank', desc: 'Texts and emails with fake Tikkie links to steal your banking credentials.', severity: 'high' },
      { id: 'nl-3', date: '2026-03-04', title: 'Bank helpdesk spoofing calls', desc: 'Calls spoofing your bank\'s number asking you to move your money.', severity: 'high' },
      { id: 'nl-4', date: '2026-03-03', title: 'Fake PostNL texts', desc: 'Messages demanding delivery fees through a fraudulent link.', severity: 'medium' },
    ],
  },
  LU: {
    fr: [
      { id: 'lu-1', date: '2026-03-06', title: 'Phishing LuxTrust / Spuerkeess', desc: 'Emails demandant de "renouveler votre LuxTrust" via un lien frauduleux.', severity: 'high' },
      { id: 'lu-2', date: '2026-03-05', title: 'Faux SMS Post Luxembourg', desc: 'SMS réclamant des frais de dédouanement pour un colis inexistant.', severity: 'high' },
      { id: 'lu-3', date: '2026-03-04', title: 'Faux appels administration fiscale', desc: 'Appels prétendant une dette fiscale urgente avec menace de poursuites.', severity: 'high' },
      { id: 'lu-4', date: '2026-03-03', title: 'Fausses offres d\'investissement', desc: 'Plateformes non agréées CSSF promettant des rendements garantis.', severity: 'medium' },
    ],
    en: [
      { id: 'lu-1', date: '2026-03-06', title: 'LuxTrust / Spuerkeess phishing', desc: 'Emails asking you to "renew your LuxTrust" via a fraudulent link.', severity: 'high' },
      { id: 'lu-2', date: '2026-03-05', title: 'Fake Post Luxembourg texts', desc: 'Texts demanding customs fees for a non-existent parcel.', severity: 'high' },
      { id: 'lu-3', date: '2026-03-04', title: 'Fake tax administration calls', desc: 'Calls claiming an urgent tax debt with threats of prosecution.', severity: 'high' },
      { id: 'lu-4', date: '2026-03-03', title: 'Fake investment offers', desc: 'Platforms not licensed by the CSSF promising guaranteed returns.', severity: 'medium' },
    ],
  },
  IE: {
    fr: [
      { id: 'ie-1', date: '2026-03-06', title: 'Faux SMS An Post / Revenue', desc: 'SMS réclamant des frais de douane ou promettant un remboursement fiscal.', severity: 'high' },
      { id: 'ie-2', date: '2026-03-05', title: 'Phishing AIB / Bank of Ireland', desc: 'Messages annonçant une activité suspecte et menant à une fausse page de connexion.', severity: 'high' },
      { id: 'ie-3', date: '2026-03-04', title: 'Faux appels "compte sécurisé"', desc: 'De faux employés de banque demandent de transférer vos fonds vers un autre compte.', severity: 'high' },
      { id: 'ie-4', date: '2026-03-03', title: 'Arnaques d\'investissement en ligne', desc: 'Fausses plateformes de trading avec témoignages inventés.', severity: 'medium' },
    ],
    en: [
      { id: 'ie-1', date: '2026-03-06', title: 'Fake An Post / Revenue texts', desc: 'Texts demanding customs fees or promising a tax refund.', severity: 'high' },
      { id: 'ie-2', date: '2026-03-05', title: 'AIB / Bank of Ireland phishing', desc: 'Messages claiming suspicious activity and leading to a fake login page.', severity: 'high' },
      { id: 'ie-3', date: '2026-03-04', title: 'Fake "safe account" calls', desc: 'Fake bank staff ask you to transfer your funds to another account.', severity: 'high' },
      { id: 'ie-4', date: '2026-03-03', title: 'Online investment scams', desc: 'Fake trading platforms with invented testimonials.', severity: 'medium' },
    ],
  },
  AU: {
    fr: [
      { id: 'au-1', date: '2026-03-06', title: 'Arnaque "Hi Mum" par SMS', desc: 'Des escrocs se font passer pour votre enfant depuis un nouveau numéro et demandent de l\'argent.', severity: 'high' },
      { id: 'au-2', date: '2026-03-05', title: 'Faux messages myGov / ATO', desc: 'SMS et emails promettant un remboursement ATO pour voler vos identifiants myGov.', severity: 'high' },
      { id: 'au-3', date: '2026-03-04', title: 'Phishing Australia Post', desc: 'SMS réclamant des frais de livraison via un lien frauduleux.', severity: 'high' },
      { id: 'au-4', date: '2026-03-03', title: 'Faux investissements (bank impersonation)', desc: 'Des escrocs imitent des banques australiennes pour proposer de faux dépôts à terme.', severity: 'medium' },
    ],
    en: [
      { id: 'au-1', date: '2026-03-06', title: '"Hi Mum" text scam', desc: 'Scammers pretend to be your child from a new number and ask for money.', severity: 'high' },
      { id: 'au-2', date: '2026-03-05', title: 'Fake myGov / ATO messages', desc: 'Texts and emails promising an ATO refund to steal your myGov credentials.', severity: 'high' },
      { id: 'au-3', date: '2026-03-04', title: 'Australia Post phishing', desc: 'Texts demanding delivery fees through a fraudulent link.', severity: 'high' },
      { id: 'au-4', date: '2026-03-03', title: 'Bank impersonation investment scams', desc: 'Scammers impersonate Australian banks to offer fake term deposits.', severity: 'medium' },
    ],
  },
  MA: {
    fr: [
      { id: 'ma-1', date: '2026-03-06', title: 'Faux SMS CIH / Attijariwafa Bank', desc: 'SMS annonçant un blocage de compte avec lien vers une fausse page bancaire.', severity: 'high' },
      { id: 'ma-2', date: '2026-03-05', title: 'Arnaque "gain de loterie" par WhatsApp', desc: 'Messages annonçant un gain et demandant des frais de transfert par cash.', severity: 'high' },
      { id: 'ma-3', date: '2026-03-04', title: 'Faux recrutement à l\'étranger', desc: 'Offres d\'emploi fictives demandant des frais de dossier ou de visa.', severity: 'high' },
      { id: 'ma-4', date: '2026-03-03', title: 'Faux paiements Amana / colis', desc: 'SMS réclamant des frais de livraison via un lien frauduleux.', severity: 'medium' },
    ],
    en: [
      { id: 'ma-1', date: '2026-03-06', title: 'Fake CIH / Attijariwafa Bank texts', desc: 'Texts claiming your account is blocked, with a link to a fake banking page.', severity: 'high' },
      { id: 'ma-2', date: '2026-03-05', title: 'WhatsApp "lottery win" scam', desc: 'Messages announcing a prize and requesting cash transfer fees.', severity: 'high' },
      { id: 'ma-3', date: '2026-03-04', title: 'Fake overseas job offers', desc: 'Fictitious job offers requesting application or visa fees.', severity: 'high' },
      { id: 'ma-4', date: '2026-03-03', title: 'Fake parcel delivery payments', desc: 'Texts demanding delivery fees through a fraudulent link.', severity: 'medium' },
    ],
  },
  MX: {
    fr: [
      { id: 'mx-1', date: '2026-03-06', title: 'Arnaque "montadeudas" (prêts express)', desc: 'De fausses applications de prêt volent vos contacts et vous menacent pour extorquer de l\'argent.', severity: 'high' },
      { id: 'mx-2', date: '2026-03-05', title: 'Phishing BBVA / Banorte', desc: 'SMS et emails annonçant un blocage de compte avec lien vers une fausse page.', severity: 'high' },
      { id: 'mx-3', date: '2026-03-04', title: 'Faux appels "extorsión telefónica"', desc: 'Appels prétendant un enlèvement ou une dette pour obtenir un paiement immédiat.', severity: 'high' },
      { id: 'mx-4', date: '2026-03-03', title: 'Faux remboursements SAT', desc: 'Emails promettant un remboursement fiscal pour collecter vos données bancaires.', severity: 'medium' },
    ],
    en: [
      { id: 'mx-1', date: '2026-03-06', title: '"Montadeudas" predatory loan apps', desc: 'Fake loan apps steal your contacts and threaten you to extort money.', severity: 'high' },
      { id: 'mx-2', date: '2026-03-05', title: 'BBVA / Banorte phishing', desc: 'Texts and emails claiming an account block with a link to a fake page.', severity: 'high' },
      { id: 'mx-3', date: '2026-03-04', title: 'Phone extortion calls', desc: 'Calls claiming a kidnapping or debt to obtain immediate payment.', severity: 'high' },
      { id: 'mx-4', date: '2026-03-03', title: 'Fake SAT refunds', desc: 'Emails promising a tax refund to harvest your banking details.', severity: 'medium' },
    ],
  },
  INTL: {
    fr: [
      { id: 'intl-1', date: '2026-03-06', title: 'Faux SMS de livraison (mondial)', desc: 'Les arnaques aux colis sont la fraude n°1 dans le monde : un lien demande des frais et vole votre carte.', severity: 'high' },
      { id: 'intl-2', date: '2026-03-05', title: 'Phishing bancaire international', desc: 'Faux messages de banques annonçant une "activité suspecte" pour voler vos identifiants.', severity: 'high' },
      { id: 'intl-3', date: '2026-03-04', title: 'Arnaque à l\'investissement crypto', desc: 'Faux conseillers sur WhatsApp/Telegram promettant des rendements garantis.', severity: 'high' },
      { id: 'intl-4', date: '2026-03-03', title: 'Arnaque sentimentale (romance scam)', desc: 'Profils fictifs qui gagnent votre confiance avant de demander de l\'argent.', severity: 'medium' },
    ],
    en: [
      { id: 'intl-1', date: '2026-03-06', title: 'Fake delivery texts (worldwide)', desc: 'Parcel scams are the #1 fraud globally: a link asks for a fee and steals your card.', severity: 'high' },
      { id: 'intl-2', date: '2026-03-05', title: 'International bank phishing', desc: 'Fake bank messages claiming "suspicious activity" to steal your credentials.', severity: 'high' },
      { id: 'intl-3', date: '2026-03-04', title: 'Crypto investment scam', desc: 'Fake advisors on WhatsApp/Telegram promising guaranteed returns.', severity: 'high' },
      { id: 'intl-4', date: '2026-03-03', title: 'Romance scam', desc: 'Fake profiles that earn your trust before asking for money.', severity: 'medium' },
    ],
  },
};

export const trendingScamsByCountry: Record<Country, { fr: string[]; en: string[] }> = {
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
      'Arnaque IRS - Appels menaçant d\'arrestation',
      'Faux colis USPS - "Reprogrammez votre livraison"',
      'Arnaque Social Security - "Votre numéro est compromis"',
      'Faux support technique Amazon / Microsoft',
    ],
    en: [
      'IRS scam - Calls threatening arrest',
      'Fake USPS package - "Reschedule your delivery"',
      'Social Security scam - "Your number is compromised"',
      'Fake Amazon / Microsoft tech support',
    ],
  },
  FR: {
    fr: [
      'Arnaque au CPF - "Votre solde expire bientôt"',
      'Faux mails Ameli - "Mettez à jour votre carte Vitale"',
      'Arnaque vignette Crit\'Air - Faux sites officiels',
      'Faux conseillers bancaires par téléphone',
    ],
    en: [
      'CPF scam - "Your balance expires soon"',
      'Fake Ameli emails - "Update your Carte Vitale"',
      'Crit\'Air sticker scam - Fake official sites',
      'Fake bank advisors by phone',
    ],
  },
  ES: {
    fr: [
      'Faux SMS Correos - "Colis en attente de frais"',
      'Phishing CaixaBank / Santander / BBVA',
      'Faux remboursement Agencia Tributaria',
      'Faux support technique Movistar / Microsoft',
    ],
    en: [
      'Fake Correos texts - "Parcel pending fee"',
      'CaixaBank / Santander / BBVA phishing',
      'Fake Agencia Tributaria refund',
      'Fake Movistar / Microsoft tech support',
    ],
  },
  BE: {
    fr: [
      'Faux emails Itsme - "Réactivez votre compte"',
      'Arnaque bpost - "Frais de colis 1,79 €"',
      'Faux conseillers Belfius / KBC / ING',
      'Faux remboursement SPF Finances (Tax-on-web)',
    ],
    en: [
      'Fake Itsme emails - "Reactivate your account"',
      'bpost scam - "€1.79 parcel fee"',
      'Fake Belfius / KBC / ING advisors',
      'Fake FPS Finance refund (Tax-on-web)',
    ],
  },
  CH: {
    fr: [
      'Faux SMS Poste Suisse - "Colis bloqué"',
      'Phishing PostFinance / UBS e-banking',
      'Faux appels police / Interpol',
      'Faux investissements crypto avec fausses célébrités',
    ],
    en: [
      'Fake Swiss Post texts - "Parcel on hold"',
      'PostFinance / UBS e-banking phishing',
      'Fake police / Interpol calls',
      'Fake crypto investments with celebrity endorsements',
    ],
  },
  GB: {
    fr: [
      'Faux SMS Royal Mail / DPD - "Frais de livraison"',
      'Arnaque HMRC - "Remboursement d\'impôt"',
      'Fraude APP - "Transférez vers un compte sûr"',
      'Faux DVLA - "Problème de taxe véhicule"',
    ],
    en: [
      'Fake Royal Mail / DPD texts - "Delivery fee"',
      'HMRC scam - "Tax refund"',
      'APP fraud - "Move money to a safe account"',
      'Fake DVLA - "Vehicle tax problem"',
    ],
  },
  DE: {
    fr: [
      'Faux SMS DHL - "Colis en attente"',
      'Phishing Sparkasse / Volksbank (pushTAN)',
      'Enkeltrick sur WhatsApp - "C\'est moi, nouveau numéro"',
      'Fausses factures Amazon / PayPal',
    ],
    en: [
      'Fake DHL texts - "Parcel on hold"',
      'Sparkasse / Volksbank pushTAN phishing',
      'WhatsApp Enkeltrick - "It\'s me, new number"',
      'Fake Amazon / PayPal invoices',
    ],
  },
  IT: {
    fr: [
      'Faux SMS Poste Italiane / BancoPosta',
      'Phishing Agenzia delle Entrate',
      'Arnaque SPID - "Revalidez votre identité"',
      'Faux conseillers TIM / Enel',
    ],
    en: [
      'Fake Poste Italiane / BancoPosta texts',
      'Agenzia delle Entrate phishing',
      'SPID scam - "Revalidate your identity"',
      'Fake TIM / Enel agents',
    ],
  },
  PT: {
    fr: [
      'Faux SMS CTT - "Taxes de colis"',
      'Phishing MB Way / Millennium BCP',
      'Arnaque Autoridade Tributária',
      'Fausse facture EDP',
    ],
    en: [
      'Fake CTT texts - "Parcel taxes"',
      'MB Way / Millennium BCP phishing',
      'Autoridade Tributária scam',
      'Fake EDP invoice',
    ],
  },
  NL: {
    fr: [
      'Arnaque WhatsApp - "Ami en difficulté"',
      'Faux liens Tikkie / ING / Rabobank',
      'Spoofing du numéro de votre banque',
      'Faux SMS PostNL',
    ],
    en: [
      'WhatsApp scam - "Friend in need"',
      'Fake Tikkie / ING / Rabobank links',
      'Bank phone number spoofing',
      'Fake PostNL texts',
    ],
  },
  LU: {
    fr: [
      'Phishing LuxTrust / Spuerkeess',
      'Faux SMS Post Luxembourg',
      'Faux appels administration fiscale',
      'Offres d\'investissement non agréées CSSF',
    ],
    en: [
      'LuxTrust / Spuerkeess phishing',
      'Fake Post Luxembourg texts',
      'Fake tax administration calls',
      'Investment offers not licensed by the CSSF',
    ],
  },
  IE: {
    fr: [
      'Faux SMS An Post / Revenue',
      'Phishing AIB / Bank of Ireland',
      'Faux appels "compte sécurisé"',
      'Fausses plateformes de trading',
    ],
    en: [
      'Fake An Post / Revenue texts',
      'AIB / Bank of Ireland phishing',
      'Fake "safe account" calls',
      'Fake trading platforms',
    ],
  },
  AU: {
    fr: [
      'Arnaque "Hi Mum" par SMS',
      'Faux messages myGov / ATO',
      'Phishing Australia Post',
      'Faux dépôts à terme (imitation de banques)',
    ],
    en: [
      '"Hi Mum" text scam',
      'Fake myGov / ATO messages',
      'Australia Post phishing',
      'Fake term deposits (bank impersonation)',
    ],
  },
  MA: {
    fr: [
      'Faux SMS CIH / Attijariwafa Bank',
      'Arnaque "gain de loterie" sur WhatsApp',
      'Faux recrutement à l\'étranger',
      'Faux frais de livraison de colis',
    ],
    en: [
      'Fake CIH / Attijariwafa Bank texts',
      'WhatsApp "lottery win" scam',
      'Fake overseas job offers',
      'Fake parcel delivery fees',
    ],
  },
  MX: {
    fr: [
      'Applications de prêt "montadeudas"',
      'Phishing BBVA / Banorte',
      'Extorsion téléphonique',
      'Faux remboursements SAT',
    ],
    en: [
      '"Montadeudas" loan apps',
      'BBVA / Banorte phishing',
      'Phone extortion',
      'Fake SAT refunds',
    ],
  },
  INTL: {
    fr: [
      'Faux SMS de livraison de colis',
      'Phishing bancaire international',
      'Arnaque à l\'investissement crypto',
      'Arnaque sentimentale (romance scam)',
    ],
    en: [
      'Fake parcel delivery texts',
      'International bank phishing',
      'Crypto investment scam',
      'Romance scam',
    ],
  },
};

/** Ordered list of every supported country, used by pickers. */
export const countryList: CountryConfig[] = [
  countryConfigs.CA,
  countryConfigs.FR,
  countryConfigs.BE,
  countryConfigs.CH,
  countryConfigs.LU,
  countryConfigs.US,
  countryConfigs.GB,
  countryConfigs.IE,
  countryConfigs.ES,
  countryConfigs.PT,
  countryConfigs.IT,
  countryConfigs.DE,
  countryConfigs.NL,
  countryConfigs.AU,
  countryConfigs.MA,
  countryConfigs.MX,
  countryConfigs.INTL,
];

export function getCountryConfig(country: Country): CountryConfig {
  return countryConfigs[country] ?? countryConfigs.INTL;
}

export function getCountryLabel(country: Country, language: Language): string {
  const config = getCountryConfig(country);
  return language === 'fr' ? config.labelFr : config.labelEn;
}

export function getCurrencySymbol(country: Country): string {
  return getCountryConfig(country).currencySymbol;
}

export function getCountryAlerts(country: Country, language: Language): AlertData[] {
  const entry = countryAlerts[country] ?? countryAlerts.INTL;
  return entry[language === 'fr' ? 'fr' : 'en'];
}

export function getTrendingScams(country: Country, language: Language): string[] {
  const entry = trendingScamsByCountry[country] ?? trendingScamsByCountry.INTL;
  return entry[language === 'fr' ? 'fr' : 'en'];
}

export function getAlertsSectionTitle(country: Country, language: Language): string {
  const label = getCountryLabel(country, language);
  if (country === 'INTL') {
    return language === 'fr' ? 'Alertes internationales' : 'International Alerts';
  }
  return language === 'fr' ? `Alertes ${label}` : `${label} Alerts`;
}
