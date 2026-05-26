import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesOffering, type PurchasesPackage, LOG_LEVEL } from 'react-native-purchases';

export const ENTITLEMENT_ID = 'premium';
export const OFFERING_ID = 'default';

let isConfigured = false;
let isConfiguring = false;

/**
 * Pick the RevenueCat public API key based on platform/environment.
 * - Web preview and __DEV__ → Test Store key
 * - Native production → platform-specific key
 */
function getRCToken(): string | undefined {
  if (__DEV__ || Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  });
}

/**
 * Configure RevenueCat once for the current process.
 * Safe to call multiple times — only the first run actually configures the SDK.
 */
export function configureRevenueCat(): boolean {
  if (isConfigured || isConfiguring) return isConfigured;
  if (Platform.OS === 'web') {
    console.log('[RevenueCat] Web platform — SDK not supported, using stubs.');
    return false;
  }
  const apiKey = getRCToken();
  if (!apiKey) {
    console.log('[RevenueCat] No API key found for platform', Platform.OS);
    return false;
  }
  try {
    isConfiguring = true;
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.WARN);
    }
    Purchases.configure({ apiKey });
    isConfigured = true;
    console.log('[RevenueCat] Configured with key prefix:', apiKey.slice(0, 8));
    return true;
  } catch (e) {
    console.log('[RevenueCat] Configure error:', e);
    return false;
  } finally {
    isConfiguring = false;
  }
}

export function isRCAvailable(): boolean {
  return Platform.OS !== 'web' && isConfigured;
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isRCAvailable()) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? offerings.all?.[OFFERING_ID] ?? null;
  } catch (e) {
    console.log('[RevenueCat] getOfferings error:', e);
    return null;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isRCAvailable()) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    console.log('[RevenueCat] getCustomerInfo error:', e);
    return null;
  }
}

export function hasPremiumEntitlement(info: CustomerInfo | null | undefined): boolean {
  if (!info) return false;
  const ent = info.entitlements.active[ENTITLEMENT_ID];
  return !!ent && ent.isActive === true;
}

export function pickPackage(
  offering: PurchasesOffering | null,
  cycle: 'monthly' | 'annual'
): PurchasesPackage | null {
  if (!offering) return null;
  if (cycle === 'monthly') {
    return offering.monthly ?? offering.availablePackages.find(p => p.packageType === 'MONTHLY') ?? null;
  }
  return offering.annual ?? offering.availablePackages.find(p => p.packageType === 'ANNUAL') ?? null;
}

export type PurchaseOutcome =
  | { status: 'success'; customerInfo: CustomerInfo }
  | { status: 'cancelled' }
  | { status: 'pending' }
  | { status: 'error'; message: string };

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  if (!isRCAvailable()) {
    return { status: 'error', message: 'In-app purchases are not available on this platform.' };
  }
  try {
    const result = await Purchases.purchasePackage(pkg);
    return { status: 'success', customerInfo: result.customerInfo };
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean; code?: string; message?: string };
    if (err?.userCancelled) {
      return { status: 'cancelled' };
    }
    if (err?.code === 'PURCHASE_NOT_ALLOWED_ERROR' || err?.code === 'PAYMENT_PENDING_ERROR') {
      return { status: 'pending' };
    }
    console.log('[RevenueCat] purchasePackage error:', err);
    return { status: 'error', message: err?.message ?? 'Unknown purchase error' };
  }
}

export type RestoreOutcome =
  | { status: 'success'; customerInfo: CustomerInfo; hasPremium: boolean }
  | { status: 'error'; message: string };

export async function restorePurchases(): Promise<RestoreOutcome> {
  if (!isRCAvailable()) {
    return { status: 'error', message: 'In-app purchases are not available on this platform.' };
  }
  try {
    const info = await Purchases.restorePurchases();
    return { status: 'success', customerInfo: info, hasPremium: hasPremiumEntitlement(info) };
  } catch (e: unknown) {
    const err = e as { message?: string };
    console.log('[RevenueCat] restorePurchases error:', err);
    return { status: 'error', message: err?.message ?? 'Unknown restore error' };
  }
}

export async function setRCUserId(userId: string | null): Promise<void> {
  if (!isRCAvailable()) return;
  try {
    if (userId) {
      await Purchases.logIn(userId);
    } else {
      await Purchases.logOut();
    }
  } catch (e) {
    console.log('[RevenueCat] setRCUserId error:', e);
  }
}
