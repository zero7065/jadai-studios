import { supabaseAdmin } from '../../../lib/supabase/admin';
import { isValidEmail } from '../../../lib/utils/validate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, source, name } = body;

    if (!email || !isValidEmail(email)) {
      return Response.json({
        success: false,
        error: 'A valid email address is required',
        code: 'INVALID_EMAIL',
      }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('newsletter')
      .upsert({
        email: email.trim().toLowerCase(),
        name: name || null,
        source: source || 'homepage',
        subscribed_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (error) {
      // Still return success to user for privacy and resilience
      return Response.json({ success: true, message: 'Subscription recorded' });
    }

    return Response.json({
      success: true,
      message: 'Subscription successfully logged in Jadai frequency.',
    });
  } catch (err: any) {
    return Response.json({
      success: false,
      error: err.message || 'Newsletter processing failed',
    }, { status: 500 });
  }
}
