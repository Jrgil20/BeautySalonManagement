import { createClient } from '@supabase/supabase-js'
import { mockUsers } from '../utils/mockData'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData: { name: string; salonName: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          salon_name: userData.salonName,
          role: 'admin', // Default role for new registrations
        }
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    // If login fails with invalid credentials, check if it's a demo user
    if (error && error.message.includes('Invalid login credentials')) {
      const demoUser = mockUsers.find(user => user.email === email && user.password === password)
      
      if (demoUser && demoUser.isActive) {
        // Try to create the demo user automatically
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: demoUser.name,
              salon_name: demoUser.salonName,
              role: demoUser.role,
            }
          }
        })
        
        if (!signUpError) {
          // Now try to sign in again
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          data = retryData
          error = retryError
        }
      }
    }
    
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}