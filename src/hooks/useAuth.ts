"use client"
import { useEffect, useState } from 'react';
import supabase from '@/src/lib/supabaseClient';

export type UserProfile = {
  id: string;
  email: string | undefined;
  name: string | null;
  isAdmin: boolean;
};

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } else if (user) {
        // Fetch user details from the 'profiles' table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, is_admin')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        setUser({
          id: user.id,
          email: user.email,
          name: profile?.name || 'Unknown',
          isAdmin: profile?.is_admin || false,
        });
      }

      setLoading(false);
    };

    fetchUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
