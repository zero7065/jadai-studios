import { supabaseAdmin } from '../supabase/admin';

export async function verifyAdminStatus(userId?: string, userEmail?: string): Promise<boolean> {
  if (userEmail === 'jadaistudiosoffcl@gmail.com') {
    return true;
  }

  if (!userId) {
    return false;
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    return profile?.role === 'admin';
  } catch {
    return false;
  }
}
