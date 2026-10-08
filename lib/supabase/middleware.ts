import { createServerSupabaseClient } from './server';

export interface MiddlewareAuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId?: string;
  email?: string;
}

/**
 * Validates session token from request headers or cookies.
 */
export async function verifyRequestSession(authHeader?: string): Promise<MiddlewareAuthResult> {
  if (!authHeader) {
    return { isAuthenticated: false, isAdmin: false };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { isAuthenticated: false, isAdmin: false };
  }

  try {
    const client = createServerSupabaseClient(token);
    const { data: { user }, error } = await client.auth.getUser();

    if (error || !user) {
      return { isAuthenticated: false, isAdmin: false };
    }

    const { data: profile } = await client
      .from('user_profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || user.email === 'jadaistudiosoffcl@gmail.com';

    return {
      isAuthenticated: true,
      isAdmin,
      userId: user.id,
      email: user.email,
    };
  } catch (err) {
    return { isAuthenticated: false, isAdmin: false };
  }
}
