import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '../types'

/**
 * Hook para buscar o perfil completo do usuário na tabela 'profiles'.
 * Não bloqueia o contexto global de autenticação.
 *
 * @param userId ID do usuário autenticado (user.id)
 * @returns { profile, loading, error, refresh }
 */
export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!userId || userId === '') {
      setProfile(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      if (error) throw error
      setProfile(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return { profile, loading, error, refresh: fetchProfile }
}
