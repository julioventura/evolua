import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'

export default function TesteDiagnostico() {
  const { user } = useAuth()
  const [resultado, setResultado] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testarConexao = async () => {
    setLoading(true)
    setResultado('Testando conexão...')
    
    try {
      // Teste simples de conexão
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        setResultado(`❌ ERRO CONEXÃO: ${error.message}`)
      } else {
        setResultado(`✅ CONEXÃO OK! Total profiles: ${data}`)
      }
    } catch (error) {
      setResultado(`❌ ERRO INESPERADO: ${JSON.stringify(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testarLeitura = async () => {
    if (!user) {
      setResultado('❌ Usuário não logado')
      return
    }

    setLoading(true)
    setResultado('Testando leitura do perfil...')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, theme_preference, created_at')
        .eq('id', user.id)
        .single()
      
      if (error) {
        setResultado(`❌ ERRO LEITURA: ${error.message} (código: ${error.code})`)
      } else {
        setResultado(`✅ LEITURA OK: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResultado(`❌ ERRO INESPERADO: ${JSON.stringify(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testarEscrita = async () => {
    if (!user) {
      setResultado('❌ Usuário não logado')
      return
    }

    setLoading(true)
    setResultado('Testando escrita...')
    
    try {
      const testTheme = Math.random() > 0.5 ? 'light' : 'dark'
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ theme_preference: testTheme })
        .eq('id', user.id)
        .select()
      
      if (error) {
        setResultado(`❌ ERRO ESCRITA: ${error.message} (código: ${error.code})`)
      } else {
        setResultado(`✅ ESCRITA OK: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResultado(`❌ ERRO INESPERADO: ${JSON.stringify(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-w-md shadow-lg">
      <h3 className="text-sm font-bold mb-3 text-gray-900 dark:text-white">🔧 Diagnóstico RLS</h3>
      
      <div className="space-x-2 mb-3">
        <button
          onClick={testarConexao}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
        >
          Conexão
        </button>
        
        <button
          onClick={testarLeitura}
          disabled={loading}
          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
        >
          Leitura
        </button>
        
        <button
          onClick={testarEscrita}
          disabled={loading}
          className="px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 disabled:opacity-50"
        >
          Escrita
        </button>
      </div>
      
      {resultado && (
        <div className="bg-black text-green-400 p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
          {resultado}
        </div>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {user ? `Logado: ${user.email}` : 'Não logado'}
      </div>
    </div>
  )
}
