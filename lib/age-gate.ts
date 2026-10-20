/**
 * age-gate.ts
 * 18+ gate - P03
 * 
 * Age verification gate for mature content and features.
 * Ensures only users 18+ can access certain functionality.
 */

export interface AgeVerification {
  userId: string;
  email: string;
  isVerified: boolean;
  age: number | null;
  verifiedAt: Date | null;
  verificationMethod: "email" | "credit_card" | "identity_document" | null;
}

/**
 * Check if user is verified as 18+
 */
export async function isUser18Plus(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_verifications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to check age verification:", error.message);
    return false;
  }

  if (!data) {
    return false;
  }

  // Check if verification is for 18+ and not expired
  const is18Plus = data.min_age >= 18;
  const isVerified = data.is_verified && new Date() < data.expires_at;

  return is18Plus && isVerified;
}

/**
 * Get user's age verification status
 */
export async function getAgeVerification(userId: string): Promise<AgeVerification | null> {
  const { data, error } = await supabase
    .from("user_verifications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch age verification:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    userId: data.user_id,
    email: data.email,
    isVerified: data.is_verified,
    age: data.age,
    verifiedAt: data.verified_at,
    verificationMethod: data.verification_method as AgeVerification["verificationMethod"],
  };
}

/**
 * Verify user age (placeholder - integrates with KYC provider)
 */
export interface AgeVerificationResult {
  success: boolean;
  userId: string;
  age: number;
  is18Plus: boolean;
  verificationMethod: AgeVerification["verificationMethod"];
  verifiedAt: Date;
}

/**
 * Route handler for age verification
 * In production, this would integrate with a KYC provider
 */
export async function verifyAge(
  email: string,
  method: AgeVerification["verificationMethod"]
): Promise<AgeVerificationResult> {
  // TODO: Integrate with actual KYC provider (Jumio, Onfido, etc.)
  // For now, mock verification at 18+
  const now = new Date();
  const mockAge = 25; // Would come from KYC check

  // Simulate verification
  const { error } = await supabase
    .from("user_verifications")
    .upsert({
      user_id: email.split("@")[0], // simplified user ID
      email,
      min_age: 18,
      is_verified: true,
      verification_method: method,
      verified_at: now,
      expires_at: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

  if (error) {
    throw new Error("Failed to save verification: " + error.message);
  }

  return {
    success: true,
    userId: email,
    age: mockAge,
    is18Plus: mockAge >= 18,
    verificationMethod: method,
    verifiedAt: now,
  };
}

/**
 * Gate check - middleware style for route protection
 */
export async function checkAgeGate(
  userId: string,
  required: "18plus" | "13plus" | "all" = "18plus"
): Promise<{ allowed: boolean; reason: string }> {
  const isVerified = await isUser18Plus(userId);

  switch (required) {
    case "18plus":
      if (!isVerified) {
        return {
          allowed: false,
          reason: "This feature requires age verification (18+).",
        };
      }
      return { allowed: true, reason: "Verified 18+" };

    case "13plus":
      if (!isVerified) {
        return {
          allowed: false,
          reason: "This feature requires age verification (13+).",
        };
      }
      return { allowed: true, reason: "Verified 13+" };

    case "all":
      return { allowed: true, reason: "No gate required" };

    default:
      return { allowed: false, reason: "Unknown gate requirement" };
  }
}

/**
 * Feature gates based on age verification
 */
export const FEATURE_GATES = {
  "nsfw_content": "18plus",
  "premium_creators": "18plus",
  "high_res_exports": "13plus",
  "commercial_licenses": "18plus",
  "api_access": "foundry",
  "private_templates": "foundry",
};

/**
 * Check if a feature is accessible based on age verification
 */
export function canAccessFeature(feature: string, is18Plus: boolean): boolean {
  const gate = FEATURE_GATES[feature];

  if (!gate) {
    return true; // No gate defined, allow access
  }

  if (gate === "18plus") {
    return is18Plus;
  }

  if (gate === "13plus") {
    // 13+ is less restrictive - allow if not 18+ gated
    return true;
  }

  return false;
}

export type { AgeVerification, AgeVerificationResult, FEATURE_GATES };