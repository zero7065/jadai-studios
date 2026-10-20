/**
 * admin-queue.ts
 * Report, block, mute and the admin queue - P23
 * 
 * Critical for soft launch governance.
 * Handles user reports, blocks, mutes, and admin review queue.
 */

import { createClient } from "@supabase/supabase-js";
import { TierId } from "@/lib-pricing";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Report types for user reports
 */
export type ReportType = "inappropriate" | "spam" | "harassment" | "scam" | "copyright" | "other";

export interface Report {
  id: string;
  reporter_id: string; // user who filed the report
  target_user_id: string; // user being reported
  target_user_email: string;
  type: ReportType;
  description: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: Date;
  resolved_at: Date | null;
  admin_notes: string | null;
  action_taken: "none" | "warning" | "mute" | "block" | "suspend" | "ban" | null;
}

/**
 * Submit a user report
 */
export async function submitReport(
  reporterId: string,
  targetEmail: string,
  type: ReportType,
  description: string
): Promise<Report> {
  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: reporterId,
      target_user_email: targetEmail,
      type,
      description,
      status: "pending",
      action_taken: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error("Failed to submit report: " + error.message);
  }

  return data;
}

/**
 * Get all pending reports for admin review
 */
export async function getPendingReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch reports: " + error.message);
  }

  return data || [];
}

/**
 * Get reports by target user
 */
export async function getReportsByTarget(targetUserId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("target_user_id", targetUserId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch reports: " + error.message);
  }

  return data || [];
}

/**
 * Block a user - prevents interaction
 */
export async function blockUser(
  blockerId: string,
  targetEmail: string
): Promise<{ success: boolean; blockedAt: Date }> {
  const { error } = await supabase
    .from("blocks")
    .insert({
      blocker_id: blockerId,
      target_email: targetEmail,
      blocked_at: new Date(),
    });

  if (error) {
    throw new Error("Failed to block user: " + error.message);
  }

  return {
    success: true,
    blockedAt: new Date(),
  };
}

/**
 * Check if user is blocked by another user
 */
export async function isBlocked(blockerId: string, targetId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("blocker_id", blockerId)
    .eq("target_email", targetId);

  if (error) {
    throw new Error("Failed to check block status: " + error.message);
  }

  return (data as any[])?.length > 0;
}

/**
 * Mute a user - prevents posting/chat for a duration
 */
export interface Mute {
  id: string;
  muted_by: string;
  target_user_id: string;
  target_user_email: string;
  duration_minutes: number; // 0 = permanent
  reason: string;
  created_at: Date;
  expires_at: Date | null;
}

export async function muteUser(
  mutedById: string,
  targetUserId: string,
  durationMinutes: number,
  reason: string
): Promise<Mute> {
  const expiresAt = durationMinutes > 0 ? new Date(Date.now() + durationMinutes * 60 * 1000) : null;

  const { data, error } = await supabase
    .from("mutes")
    .insert({
      muted_by: mutedById,
      target_user_id: targetUserId,
      target_user_email: "",
      duration_minutes: durationMinutes,
      reason,
      created_at: new Date(),
      expires_at,
    })
    .select()
    .single();

  if (error) {
    throw new Error("Failed to mute user: " + error.message);
  }

  return data;
}

/**
 * Check if user is muted and if mute has expired
 */
export async function isMuted(targetUserId: string): Promise<{ isMuted: boolean; expiresAt: Date | null }> {
  const { data, error } = await supabase
    .from("mutes")
    .select("*")
    .eq("target_user_id", targetUserId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to check mute status: " + error.message);
  }

  if (!data) {
    return { isMuted: false, expiresAt: null };
  }

  // Check if mute has expired
  const now = new Date();
  const isStillMuted = durationMinutes > 0 
    ? now < data.expires_at 
    : true; // permanent mute

  return {
    isMuted: isStillMuted,
    expiresAt: data.expires_at,
  };
}

/**
 * Unmute a user
 */
export async function unmuteUser(targetUserId: string): Promise<boolean> {
  const { error } = await supabase
    .from("mutes")
    .delete()
    .eq("target_user_id", targetUserId);

  if (error) {
    throw new Error("Failed to unmute user: " + error.message);
  }

  return true;
}

/**
 * Admin resolve a report - takes action
 */
export interface ReportAction {
  reportId: string;
  action: "warning" | "mute" | "block" | "suspend" | "ban" | "dismiss";
  adminId: string;
  notes: string;
  muteDuration?: number; // minutes (for mute action)
}

export async function resolveReport(action: ReportAction): Promise<boolean> {
  const { reportId, action: act, adminId, notes, muteDuration } = action;

  // Update report status
  const { error: reportError } = await supabase
    .from("reports")
    .update({
      status: "resolved",
      admin_id: adminId,
      admin_notes: notes,
      resolved_at: new Date(),
      action_taken: act,
    })
    .eq("id", reportId);

  if (reportError) {
    console.error("Failed to update report:", reportError.message);
    return false;
  }

  // Execute action based on type
  switch (act) {
    case "mute": {
      if (muteDuration && muteDuration > 0) {
        await muteUser(reportId, "", muteDuration, notes);
      }
      break;
    }
    case "block": {
      // We need target email from report - fetch it
      const { data: report } = await supabase
        .from("reports")
        .select("target_user_email")
        .eq("id", reportId)
        .single();
      
      if (report?.target_user_email) {
        await blockUser(adminId, report.target_user_email);
      }
      break;
    }
    case "dismiss": {
      // Just mark as dismissed, no further action
      break;
    }
    default:
      break;
  }

  return true;
}

/**
 * Get admin dashboard stats
 */
export interface AdminStats {
  totalReports: number;
  pendingReports: number;
  blockedUsers: number;
  mutedUsers: number;
  activeMutes: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  // Get counts from database
  const [reports, blocks, mutes] = await Promise.all([
    supabase.from("reports").select("*", { count: "exact" }),
    supabase.from("blocks").select("*", { count: "exact" }),
    supabase.from("mutes").select("*", { count: "exact" }),
  ]);

  const now = new Date();
  const activeMutes = (mutes.data || []).filter(
    (m: any) => m.duration_minutes > 0 && m.expires_at && new Date(m.expires_at) > now
  ).length;

  return {
    totalReports: (reports.data?.length || 0),
    pendingReports: (reports.data?.filter((r: any) => r.status === "pending").length || 0),
    blockedUsers: (blocks.data?.length || 0),
    mutedUsers: ((mutes.data || []).filter((m: any) => m.duration_minutes > 0).length || 0),
    activeMutes,
  };
}

export type { ReportType, Report, Mute, ReportAction, AdminStats };