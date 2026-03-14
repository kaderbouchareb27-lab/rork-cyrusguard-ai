import type { Country } from '@/contexts/AppContext';
import type { Language } from '@/constants/translations';

export type Currency = 'CAD' | 'USD' | 'EUR';

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

export const countryConfigs: Record<Country, CountryConfig> = {
  CA: {
    code: 'CA',
    labelFr: 'Canada',
    labelEn: 'Canada',
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
    pricing: {
      monthly: '2.99',
      annual: '29.99',
      monthlyEquivalent: '2.50',
    },
  },
  US: {
    code: 'US',
    labelFr: 'États-Unis',
    labelEn: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    availableLanguages: ['en'],
    defaultLanguage: 'en',
    reportingOrganizations: [
      { name: 'Federal Trade Commission (FTC)', nameEn: 'Federal Trade Commission (FTC)', url: 'https://reportfraud.ftc.gov', phone: '1-877-382-4357' },
      { name: 'FBI Internet Crime Complaint Center (IC3)', nameEn: 'FBI Internet Crime Complaint Center (IC3)', url: 'https://www.ic3.gov', phone: '' },
      { name: 'AARP Fraud Watch Network', nameEn: 'AARP Fraud Watch Network', url: 'https://www.aarp.org/money/scams-fraud', phone: '877-908-3360' },
    ],
    pricing: {
      monthly: '2.99',
      annual: '29.99',
      monthlyEquivalent: '2.50',
    },
  },
  FR: {
    code: 'FR',
    labelFr: 'France',
    labelEn: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    availableLanguages: ['fr'],
    defaultLanguage: 'fr',
    reportingOrganizations: [
      { name: 'Cybermalveillance.gouv.fr', nameEn: 'Cybermalveillance.gouv.fr', url: 'https://www.cybermalveillance.gouv.fr', phone: '0 805 805 817' },
      { name: 'Signal Spam', nameEn: 'Signal Spam', url: 'https://www.signal-spam.fr', phone: '' },
      { name: 'Pharos (Signalement en ligne)', nameEn: 'Pharos (Online Reporting)', url: 'https://www.internet-signalement.gouv.fr', phone: '' },
      { name: 'Info Escroqueries', nameEn: 'Info Escroqueries', url: 'https://www.service-public.fr', phone: '0 805 805 817' },
    ],
    pricing: {
      monthly: '2.99',
      annual: '29.99',
      monthlyEquivalent: '2.50',
    },
  },
};

export const countryAlerts: Record<Country, { fr: AlertData[]; en: AlertData[] }> = {
  CA: {
    fr: [
      { id: 'ca-1', date: '2026-03-06', title: 'Faux textos Desjardins en circulation', desc: 'Des SMS frauduleux imitant Desjardins demandent de "vérifier votre identité" via un lien suspect. Ne cliquez pas!', severity: 'high' as const },
      { id: 'ca-2', date: '2026-03-05', title: 'Arnaque "Bonjour maman" par texto', desc: 'Des fraudeurs envoient des textos se faisant passer pour votre enfant depuis un nouveau numéro, demandant un virement urgent.', severity: 'high' as const },
      { id: 'ca-3', date: '2026-03-04', title: 'Faux concours Tim Hortons sur Facebook', desc: 'Un faux concours promet une carte-cadeau de 500$ Tim Hortons. Le lien mène à un site de phishing.', severity: 'medium' as const },
      { id: 'ca-4', date: '2026-03-03', title: 'Fausse facture Hydro-Québec par courriel', desc: 'Des courriels frauduleux menacent de couper l\'électricité si vous ne payez pas immédiatement via un lien.', severity: 'high' as const },
    ],
    en: [
      { id: 'ca-1', date: '2026-03-06', title: 'Fake Desjardins texts circulating', desc: 'Fraudulent SMS imitating Desjardins asking to "verify your identity" via a suspicious link. Do not click!', severity: 'high' as const },
      { id: 'ca-2', date: '2026-03-05', title: '"Hi mom" text scam', desc: 'Scammers send texts pretending to be your child from a new number, requesting an urgent transfer.', severity: 'high' as const },
      { id: 'ca-3', date: '2026-03-04', title: 'Fake Tim Hortons contest on Facebook', desc: 'A fake contest promises a $500 Tim Hortons gift card. The link leads to a phishing site.', severity: 'medium' as const },
      { id: 'ca-4', date: '2026-03-03', title: 'Fake Hydro-Québec invoice by email', desc: 'Fraudulent emails threaten to cut electricity if you don\'t pay immediately via a link.', severity: 'high' as const },
    ],
  },
  US: {
    fr: [
      { id: 'us-1', date: '2026-03-06', title: 'Arnaque IRS - "Vous devez des impôts"', desc: 'Des appels robotisés prétendent venir de l\'IRS et menacent d\'arrestation si vous ne payez pas immédiatement par carte cadeau.', severity: 'high' as const },
      { id: 'us-2', date: '2026-03-05', title: 'Faux colis USPS / FedEx', desc: 'Des SMS frauduleux imitent USPS ou FedEx avec un lien pour "reprogrammer votre livraison". Ne cliquez pas!', severity: 'high' as const },
      { id: 'us-3', date: '2026-03-04', title: 'Arnaque Social Security', desc: 'Des escrocs prétendent que votre numéro de sécurité sociale a été compromis et demandent un paiement immédiat.', severity: 'high' as const },
      { id: 'us-4', date: '2026-03-03', title: 'Faux support Amazon', desc: 'Des emails imitant Amazon prétendent qu\'un achat non autorisé a été effectué sur votre compte.', severity: 'medium' as const },
    ],
    en: [
      { id: 'us-1', date: '2026-03-06', title: 'IRS scam - "You owe back taxes"', desc: 'Robocalls claiming to be from the IRS threaten arrest if you don\'t pay immediately via gift cards.', severity: 'high' as const },
      { id: 'us-2', date: '2026-03-05', title: 'Fake USPS / FedEx delivery', desc: 'Fraudulent texts impersonate USPS or FedEx with a link to "reschedule your delivery". Do not click!', severity: 'high' as const },
      { id: 'us-3', date: '2026-03-04', title: 'Social Security scam', desc: 'Scammers claim your Social Security number has been compromised and demand immediate payment.', severity: 'high' as const },
      { id: 'us-4', date: '2026-03-03', title: 'Fake Amazon support', desc: 'Emails impersonating Amazon claim an unauthorized purchase was made on your account.', severity: 'medium' as const },
    ],
  },
  FR: {
    fr: [
      { id: 'fr-1', date: '2026-03-06', title: 'Arnaque au CPF très active', desc: 'Des appels et SMS promettent de "sauver votre solde CPF avant expiration". Le CPF n\'expire jamais! Ne communiquez pas vos identifiants.', severity: 'high' as const },
      { id: 'fr-2', date: '2026-03-05', title: 'Faux mails Ameli / Assurance Maladie', desc: 'Des emails frauduleux imitent Ameli et demandent de mettre à jour votre carte Vitale en cliquant sur un lien piégé.', severity: 'high' as const },
      { id: 'fr-3', date: '2026-03-04', title: 'Arnaque vignette Crit\'Air', desc: 'Des SMS prétendent que vous devez commander votre vignette Crit\'Air en urgence via un faux site qui copie le site officiel.', severity: 'high' as const },
      { id: 'fr-4', date: '2026-03-03', title: 'Fausse facture EDF / Engie', desc: 'Des emails frauduleux menacent de couper votre électricité. EDF et Engie ne menacent jamais par email.', severity: 'medium' as const },
    ],
    en: [
      { id: 'fr-1', date: '2026-03-06', title: 'CPF training account scam very active', desc: 'Calls and texts promise to "save your CPF balance before expiration". CPF never expires! Never share your credentials.', severity: 'high' as const },
      { id: 'fr-2', date: '2026-03-05', title: 'Fake Ameli / Health Insurance emails', desc: 'Fraudulent emails impersonate Ameli and ask you to update your Carte Vitale by clicking a malicious link.', severity: 'high' as const },
      { id: 'fr-3', date: '2026-03-04', title: 'Crit\'Air sticker scam', desc: 'Texts claim you must urgently order your Crit\'Air sticker via a fake site that copies the official one.', severity: 'high' as const },
      { id: 'fr-4', date: '2026-03-03', title: 'Fake EDF / Engie invoice', desc: 'Fraudulent emails threaten to cut your electricity. EDF and Engie never threaten via email.', severity: 'medium' as const },
    ],
  },
};

export interface AlertData {
  id: string;
  date: string;
  title: string;
  desc: string;
  severity: 'high' | 'medium';
}

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
};

export function getCountryConfig(country: Country): CountryConfig {
  return countryConfigs[country];
}

export function getCurrencySymbol(country: Country): string {
  return countryConfigs[country].currencySymbol;
}

export function getAlertsSectionTitle(country: Country, language: Language): string {
  const titles: Record<Country, { fr: string; en: string }> = {
    CA: { fr: 'Alertes Canada', en: 'Canada Alerts' },
    US: { fr: 'Alertes États-Unis', en: 'USA Alerts' },
    FR: { fr: 'Alertes France', en: 'France Alerts' },
  };
  return titles[country][language] ?? titles[country].en;
}
