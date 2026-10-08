import { supabaseAdmin } from '../../../../lib/supabase/admin';
import { invalidateAiCache } from '../../../../lib/ai/cache';
import { invalidateSettingsCache } from '../../../../lib/settings';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('key, value, category, description, updated_at');

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, settings: data || [] }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return Response.json({ success: false, error: 'Missing key or value' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('admin_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: 'admin',
      });

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    // Invalidate AI response cache and settings cache
    invalidateAiCache();
    invalidateSettingsCache();

    return Response.json({ success: true, message: `Setting ${key} updated successfully` });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
