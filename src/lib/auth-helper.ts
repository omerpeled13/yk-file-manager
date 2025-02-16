import supabase from './supabaseClient'
import { Database } from '../types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile() {
  const user = await getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    throw error
  }

  return profile as Profile
}

export async function isAuthenticated() {
  try {
    const user = await getUser()
    return !!user
  } catch {
    return false
  }
}

export async function isAdmin() {
  try {
    const profile = await getUserProfile()
    return profile?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAuth() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Authentication required')
  }
}

export async function requireAdmin() {
  try {
    const profile = await getUserProfile()

    if (!profile || profile.role !== 'admin') {
      throw new Error('Admin access required')
    }
  } catch (error) {
    console.error('Error in requireAdmin:', error)
    throw new Error('Admin access required')
  }
}

export async function logout() {
  await supabase.auth.signOut()
}