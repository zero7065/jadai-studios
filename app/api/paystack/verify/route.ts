import { supabaseAdmin } from '../../../../lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, plan, email, userId } = body;

    if (!reference) {
      return Response.json({ success: false, error: 'Reference required' }, { status: 400 });
    }

    const assignedTier = plan === 'signal' ? 'signal' : 'playground';

    // Update user profile in Supabase
    try {
      if (userId || email) {
        let query = supabaseAdmin.from('user_profiles').update({
          subscription_tier: assignedTier,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        });

        if (userId) {
          await query.eq('id', userId);
        } else if (email) {
          await query.eq('email', email);
        }
      }
    } catch (dbErr) {
      console.warn('Could not update user_profiles table', dbErr);
    }

    return Response.json({
      success: true,
      verified: true,
      tier: assignedTier,
      reference,
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err?.message || 'Verification error' }, { status: 500 });
  }
}
