import { useState, useEffect } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, insert default
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.email === 'admin@bellaboutique.com' ? 'admin' : 'user';
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, role });
      if (!insertError) {
        fetchProfile(userId); // Refetch
      }
    } else if (data) {
      setProfile(data);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (data.user && !error) {
      // Insert profile with role based on email
      const role = email === 'admin@bellaboutique.com' ? 'admin' : 'user';
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, role });
      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
      // Refetch to get profile
      fetchProfile(data.user.id);
    }
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    profile,
    isAdmin: profile?.role === 'admin',
    loading,
    signIn,
    signUp,
    signOut,
  };
}