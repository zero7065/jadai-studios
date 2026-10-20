/**
 * entitlements.ts
 * Perks with caps - P22
 * 
 * Maps user tiers to feature access and caps.
 * Single source of truth for what each tier can do.
 */

import { TIER_ORDER, type TierId, canAccess, type Tier } from "@/lib-pricing";

/**
 * Get all features available for a given tier
 * Includes tier features + inherited features from lower tiers
 */
export function getTierFeatures(tier: TierId): string[] {
  const minIndex = TIER_ORDER.indexOf(tier);
  const allFeatures: string[] = [];

  // Add features from this tier and all lower tiers
  for (let i = minIndex; i >= 0; i--) {
    const t = TIER_ORDER[i] as TierId;
    const tierData = TIERS[t];
    if (tierData?.features) {
      tierData.features.forEach((f) => {
        if (!allFeatures.includes(f)) {
          allFeatures.push(f);
        }
      });
    }
  }

  return allFeatures;
}

/**
 * Check if a user can access a specific feature
 * Considers tier hierarchy (lower tiers get inherited features)
 */
export function userCanAccess(feature: string, userTier: TierId = "free": boolean {
  return canAccess(feature, userTier);
}

/**
 * Get the minimum tier required for a feature
 */
export function minTierForFeature(feature: string): TierId {
  const required = FEATURE_MIN_TIER[feature] ?? "foundry";
  return required;
}

/**
 * Caps per tier - maximum usage limits
 */
export interface TierCaps {
  maxGenerationsPerDay?: number;
  maxChatMessagesPerHour?: number;
  maxStorageGB?: number;
  maxConcurrentSessions?: number;
  exportQuality?: "low" | "medium" | "high" | "4k";
}

/**
 * Get caps for a user's tier
 */
export function getTierCaps(tier: TierId): TierCaps {
  const tierData = TIERS[tier];
  if (!tierData) return {};

  // Base caps from tier definition
  const caps: TierCaps = {};

  // Map tier features to caps
  if (tierData.id === "free") {
    caps.maxGenerationsPerDay = 3;
    caps.exportQuality = "low";
  } else if (tierData.id === "creator") {
    caps.maxGenerationsPerDay = -1; // unlimited
    caps.exportQuality = "4k";
    caps.maxChatMessagesPerHour = 50;
  } else if (tierData.id === "studio") {
    caps.maxGenerationsPerDay = -1; // unlimited
    caps.exportQuality = "4k";
    caps.maxChatMessagesPerHour = 100;
    caps.maxStorageGB = 100;
  } else if (tierData.id === "foundry") {
    caps.maxGenerationsPerDay = -1; // unlimited
    caps.exportQuality = "4k";
    caps.maxChatMessagesPerHour = -1; // unlimited
    caps.maxStorageGB = 1000;
  }

  return caps;
}

/**
 * Check if user has exceeded their caps
 * Returns true if over limit, with info about the cap
 */
export function checkCap(
  feature: string,
  currentValue: number,
  userTier: TierId
): { overLimit: boolean; limit: number; message: string } {
  const limit = getTierCaps(userTier)[feature as keyof TierCaps] as number | undefined;

  if (limit === undefined || limit === -1) {
    // No cap or unlimited
    return { overLimit: false, limit: Infinity, message: "Unlimited" };
  }

  if (currentValue >= limit) {
    return {
      overLimit: true,
      limit,
      message: `Limit reached: ${currentValue}/${limit}`,
    };
  }

  return {
    overLimit: false,
    limit,
    message: `${currentValue}/${limit} remaining`,
  };
}

/**
 * Export types for use in other modules
 */
export type { TierId, Tier };