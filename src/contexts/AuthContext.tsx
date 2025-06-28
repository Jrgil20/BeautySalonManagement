import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { auth } from '../lib/supabase'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signUp: (email: string, password: string, userData: { name: string; salonName: string }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { user: currentUser } = await auth.getCurrentUser()
      if (currentUser) {
        setSupabaseUser(currentUser)
        setUser(mapSupabaseUserToUser(currentUser))
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        setUser(mapSupabaseUserToUser(session.user))
      } else {
        setSupabaseUser(null)
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const mapSupabaseUserToUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      password: '', // We don't store passwords in our User type
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuario',
      role: supabaseUser.user_metadata?.role || 'admin',
      isActive: true,
      salonId: supabaseUser.id, // Use user ID as salon ID for now
      salonName: supabaseUser.user_metadata?.salon_name || 'Mi Salón',
      lastLogin: new Date(),
      createdAt: new Date(supabaseUser.created_at),
    }
  }

  const signUp = async (email: string, password: string, userData: { name: string; salonName: string }) => {
    try {
      setLoading(true)
      const { error } = await auth.signUp(email, password, userData)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await auth.signIn(email, password)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    supabaseUser,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}