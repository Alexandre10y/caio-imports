import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  // Guarda a permissão junto do usuário a que ela pertence. Sem isso existe um
  // instante em que a sessão já existe e a permissão ainda não foi buscada, e a
  // tela de "acesso não autorizado" pisca a cada carregamento.
  const [adminState, setAdminState] = useState({ userId: null, admin: null })
  const [checkingSession, setCheckingSession] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return undefined

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session ?? null)
      setCheckingSession(false)
    })

    // O callback nunca faz await de outra chamada do supabase (evita deadlock do client).
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setCheckingSession(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!supabase || !userId) {
      setAdminState({ userId: null, admin: null })
      return undefined
    }

    let active = true

    supabase
      .from('admins')
      .select('user_id, email, name, role')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        setAdminState({ userId, admin: data ?? null })
      })

    return () => {
      active = false
    }
  }, [userId])

  const adminResolved = adminState.userId === userId
  const admin = adminResolved ? adminState.admin : null

  const signIn = useCallback(async (email, password) => {
    if (!supabase) return { error: 'Supabase não configurado neste ambiente.' }
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (!error) return { error: null }
    if (error.message?.toLowerCase().includes('invalid login')) {
      return { error: 'E-mail ou senha incorretos.' }
    }
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      return { error: 'Confirme o e-mail do usuário no Supabase antes de entrar.' }
    }
    return { error: error.message }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setAdminState({ userId: null, admin: null })
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      admin,
      isAuthenticated: Boolean(session),
      isAdmin: Boolean(admin),
      loading: checkingSession || (Boolean(userId) && !adminResolved),
      configured: Boolean(supabase),
      signIn,
      signOut,
    }),
    [admin, adminResolved, checkingSession, session, signIn, signOut, userId],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return context
}
