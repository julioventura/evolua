import React, { useContext } from 'react'
import { ThemeContext } from '../../contexts/ThemeProvider'
import { useAuth } from '../../contexts/AuthContext'

export const SimpleThemeTest: React.FC = () => {
  const themeContext = useContext(ThemeContext)
  const authContext = useAuth()

  const testSupabaseConnection = async () => {
    if (!authContext?.user) {
      alert('❌ Você precisa estar logado para testar!')
      return
    }

    try {
      alert('🔄 Iniciando teste... (verifique o console F12)')
      console.log('🔄 Iniciando teste de conexão com Supabase...')
      console.log('👤 Usuário:', authContext.user)
      
      // Importar supabase dinamicamente para evitar problemas
      const { supabase } = await import('../../lib/supabaseClient')
      console.log('✅ Supabase importado com sucesso')
      
      // Testar busca do perfil
      console.log('🔍 Buscando perfil do usuário:', authContext.user.id)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authContext.user.id)
        .single()

      console.log('� Resultado da consulta:', { data, error })
      
      if (error) {
        console.error('❌ Erro detalhado:', error)
        alert(`❌ Erro ao buscar perfil:\n${error.message}\nCódigo: ${error.code}\nDetalhes: ${error.details}`)
      } else if (data) {
        console.log('✅ Perfil encontrado:', data)
        const columns = Object.keys(data)
        console.log('📋 Colunas disponíveis:', columns)
        
        const hasThemeColumn = 'theme_preference' in data
        const themeValue = data.theme_preference
        
        console.log('🎨 Coluna theme_preference existe?', hasThemeColumn)
        console.log('🎨 Valor atual do tema:', themeValue)
        
        alert(`✅ Teste concluído!\n\n📋 Colunas encontradas:\n${columns.join(', ')}\n\n🎨 Coluna theme_preference: ${hasThemeColumn ? '✅ Existe' : '❌ Não existe'}\n\n💡 Valor atual: ${themeValue || 'null'}\n\n🔍 Veja mais detalhes no console (F12)`)
      } else {
        console.log('⚠️ Nenhum dado retornado')
        alert('⚠️ Nenhum perfil encontrado para este usuário')
      }
    } catch (error) {
      console.error('💥 Erro geral:', error)
      alert(`💥 Erro durante o teste:\n${error}\n\n🔍 Veja mais detalhes no console (F12)`)
    }
  }

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg mb-4 border-2 border-blue-200 dark:border-blue-700">
      <h3 className="font-bold mb-2 text-blue-800 dark:text-blue-200">🧪 Teste de Persistência do Tema</h3>
      
      <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
        <p><strong>Status:</strong> {authContext?.user ? '✅ Logado' : '❌ Não logado'}</p>
        {authContext?.user && <p><strong>Usuário:</strong> {authContext.user.email}</p>}
        <p><strong>Tema atual:</strong> {themeContext?.theme || 'Não disponível'}</p>
      </div>
      
      <div className="flex gap-2 mt-3 flex-wrap">
        {themeContext && (
          <button 
            onClick={() => themeContext.toggleTheme()}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🔄 Toggle Tema
          </button>
        )}
        
        {authContext?.user && (
          <>
            <button 
              onClick={async () => {
                try {
                  console.log('🧪 Teste básico de conectividade...')
                  const { supabase } = await import('../../lib/supabaseClient')
                  const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' })
                  
                  if (error) {
                    alert(`❌ Erro de conectividade: ${error.message}`)
                  } else {
                    alert(`✅ Conectividade OK! Encontrados ${data.length} perfis na tabela.`)
                  }
                } catch (err) {
                  alert(`❌ Erro: ${err}`)
                }
              }}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              🔌 Teste Conectividade
            </button>
            
            <button 
              onClick={testSupabaseConnection}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🔍 Testar BD
            </button>

            <button 
              onClick={async () => {
                try {
                  console.log('🧪 TESTE DIRETO: Verificando coluna theme_preference...')
                  const { supabase } = await import('../../lib/supabaseClient')
                  
                  // Tentar SELECT apenas na coluna theme_preference
                  const { data, error } = await supabase
                    .from('profiles')
                    .select('theme_preference')
                    .eq('id', authContext.user!.id)
                    .single()
                  
                  console.log('🔍 Resultado SELECT theme_preference:', { data, error })
                  
                  if (error) {
                    if (error.code === '42703' || error.message.includes('column') || error.message.includes('theme_preference')) {
                      alert('❌ CONFIRMADO: Coluna theme_preference NÃO EXISTE!\n\nExecute este SQL no Supabase:\nALTER TABLE profiles ADD COLUMN theme_preference TEXT DEFAULT \'light\';')
                      console.error('🚨 COLUNA NÃO EXISTE:', error)
                    } else {
                      alert(`❌ Outro erro: ${error.message}`)
                    }
                  } else {
                    alert(`✅ COLUNA EXISTE! Valor atual: ${data?.theme_preference || 'null'}`)
                  }
                } catch (err) {
                  console.error('💥 Erro:', err)
                  alert(`💥 Erro: ${err}`)
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              🚨 Verificar Coluna
            </button>
          </>
        )}
        
        {!authContext?.user && (
          <p className="text-sm text-orange-600 dark:text-orange-400">
            ⚠️ Faça login para testar a persistência no Supabase
          </p>
        )}
      </div>
    </div>
  )
}
