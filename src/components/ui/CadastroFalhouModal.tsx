import { Button } from './Button';

interface CadastroFalhouModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onTryAgain: () => void;
  onSendInstructions: () => void;
}

export function CadastroFalhouModal({ 
  isOpen, 
  onClose, 
  email, 
  onTryAgain, 
  onSendInstructions 
}: CadastroFalhouModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            ⚠️ Não foi possível criar o usuário
          </h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Não conseguimos criar automaticamente uma conta para <strong>{email}</strong>.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              O que fazer agora?
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Peça para o usuário se cadastrar primeiro no sistema</li>
              <li>• Depois disso, você pode adicioná-lo à turma normalmente</li>
              <li>• Ou envie instruções por email para ele</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-amber-900 dark:text-amber-300 mb-2">
              📧 Instruções para o usuário:
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              "Acesse o sistema e crie sua conta com o email <strong>{email}</strong>. 
              Depois disso, você será adicionado à turma automaticamente."
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={onSendInstructions}>
            📧 Enviar Instruções
          </Button>
          <Button onClick={onTryAgain}>
            🔄 Tentar Novamente
          </Button>
        </div>
      </div>
    </div>
  );
}
