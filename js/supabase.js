// Supabase client wrapper
// NOTE: Replace the placeholder URL and key with your actual Supabase project values.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/esm/index.js';

// TODO: Provide your Supabase credentials here
const SUPABASE_URL = '<YOUR_SUPABASE_URL>'; // e.g. 'https://xyzcompany.supabase.co'
const SUPABASE_ANON_KEY = '<YOUR_SUPABASE_ANON_KEY>';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Sign up a user with email and password.
 * Returns { user, error }
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  return { user: data?.user, error };
}

/**
 * Sign in a user with email and password.
 * Returns { session, error }
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { session: data?.session, error };
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * Create a new room. The current user becomes the creator and first member.
 * mode: 'continuous' | 'binary' | 'count' | 'cleaning' | 'assumptions'
 */
export async function createRoom(mode) {
  // Generate simple code (4 characters base36)
  const code = Math.random().toString(36).substring(2, 6).toUpperCase();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('User not authenticated');
  // Insert into rooms
  const { data: room, error } = await supabase
    .from('rooms')
    .insert({ code, mode, level: 'beginner', created_by: userId })
    .select()
    .single();
  if (error) throw error;
  // Add player to room_players
  await supabase.from('room_players').insert({ room_id: room.id, user_id: userId, display_name: userData.user.email, score: 0 });
  return room;
}

/**
 * Join an existing room by code. The current user becomes a player in that room.
 */
export async function joinRoom(code) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('User not authenticated');
  // Find room by code
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select()
    .eq('code', code)
    .limit(1);
  if (error || rooms.length === 0) throw new Error('Room not found');
  const room = rooms[0];
  // Insert into room_players
  await supabase.from('room_players').insert({ room_id: room.id, user_id: userId, display_name: userData.user.email, score: 0 });
  return room;
}

/**
 * Subscribe to leaderboard changes for a given room.
 * onChange callback receives payload with new or updated player row.
 */
export function subscribeLeaderboard(roomId, onChange) {
  const channel = supabase
    .channel(`room_players_${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
      (payload) => {
        onChange(payload);
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/**
 * Update the current user's score in a room.
 */
export async function updateScore(roomId, newScore) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('User not authenticated');
  await supabase
    .from('room_players')
    .update({ score: newScore, last_active_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', userId);
}

/**
 * Leave a room (delete membership). Optionally remove room if creator.
 */
export async function leaveRoom(roomId) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('User not authenticated');
  await supabase.from('room_players').delete().eq('room_id', roomId).eq('user_id', userId);
}