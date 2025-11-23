import { cookies } from 'next/headers';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';

interface UserSession {
  id: string;
  walletAddress: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Get the current user from the Supabase session
 * This can be used in Server Components and API routes
 */
export async function getCurrentUser(): Promise<UserSession | undefined> {
  try {
    const cookieStore = await cookies();
    
    const supabase = createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return undefined;
    }

    // Map Supabase user to our UserSession format
    return {
      id: user.id,
      walletAddress: user.user_metadata?.wallet_address || user.email || '',
      name: user.user_metadata?.name,
      email: user.email,
      image: user.user_metadata?.avatar_url,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return undefined;
  }
}

export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
