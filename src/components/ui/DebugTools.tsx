import React, { useState } from 'react';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { Modal } from './Modal';
import { DatabaseDirectTest } from './DatabaseDirectTest';
import { TestCompleteFlowComponent } from './TestCompleteFlowComponent';
import { TestInsertComponent } from './TestInsertComponent';
import { CategoriaFixer } from './CategoriaFixer';
import { TestDirectDB } from './TestDirectDB';
import { TestProfileCreation } from './TestProfileCreation';
import { ProfilesDebug } from './ProfilesDebug';
import { UserProfileFixer } from './UserProfileFixer';
import { AuthStatus } from './AuthStatus';

interface DebugToolsProps {
  isVisible?: boolean;
}

export const DebugTools: React.FC<DebugToolsProps> = ({ isVisible = true }) => {
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={() => setIsDebugOpen(true)}
        className="w-full flex items-center justify-center p-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300 font-semibold"
      >
        <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
        🔧 Ferramentas de Debug
      </button>

      <Modal isOpen={isDebugOpen} onClose={() => setIsDebugOpen(false)} title="Ferramentas de Debug" size="xl">
        <div className="flex flex-col h-full space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              🚨 Ferramentas de Debug do Problema de Categoria
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Use estas ferramentas para identificar e corrigir o problema de categoria não sendo salva durante o registro.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6">
            <AuthStatus />
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <UserProfileFixer />
            <hr className="border-gray-200 dark:border-gray-700" />

            <DatabaseDirectTest />
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <TestCompleteFlowComponent />
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <TestInsertComponent />
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <CategoriaFixer />
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <TestDirectDB />
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <TestProfileCreation />
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <ProfilesDebug onClose={() => setIsDebugOpen(false)} />
          </div>
        </div>
      </Modal>
    </>
  );
};
