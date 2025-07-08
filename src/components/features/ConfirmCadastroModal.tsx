// ============================================================================
// e-volua - Modal de Confirmação de Cadastro de Usuário
// ============================================================================

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { TurmaMembro } from '../../types';

interface ConfirmCadastroModalProps {
  isOpen: boolean;
  email: string;
  papel: TurmaMembro['papel'];
  onConfirm: (email: string, papel: TurmaMembro['papel'], dadosCompletos: {
    nomeCompleto?: string;
    whatsapp?: string;
    nascimento?: string;
    cidade?: string;
    estado?: string;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmCadastroModal({
  isOpen,
  email,
  papel,
  onConfirm,
  onCancel,
  loading = false
}: ConfirmCadastroModalProps) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm(email, papel, {
      nomeCompleto: nomeCompleto.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      nascimento: nascimento.trim() || undefined,
      cidade: cidade.trim() || undefined,
      estado: estado.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Usuário não encontrado
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cadastrar novo usuário no sistema
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    O usuário <strong>{email}</strong> não está cadastrado no sistema.
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Deseja cadastrá-lo automaticamente como <strong>{papel}</strong> e adicioná-lo à turma?
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome Completo (opcional)
              </label>
              <Input
                id="nomeCompleto"
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                placeholder="Digite o nome completo do usuário"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WhatsApp (opcional)
              </label>
              <Input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="nascimento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Nascimento (opcional)
              </label>
              <Input
                id="nascimento"
                type="date"
                value={nascimento}
                onChange={(e) => setNascimento(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cidade (opcional)
                </label>
                <Input
                  id="cidade"
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="São Paulo"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado (opcional)
                </label>
                <Input
                  id="estado"
                  type="text"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  placeholder="SP"
                  className="w-full"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Todos os campos são opcionais e podem ser preenchidos posteriormente pelo usuário
            </p>
          </div>

          <div className="mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Informações do cadastro:</strong>
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• Email: {email}</li>
                <li>• Papel: {papel}</li>
                <li>• Uma senha temporária será gerada</li>
                <li>• O usuário receberá um convite por email</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Cadastrando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Cadastrar e Adicionar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
