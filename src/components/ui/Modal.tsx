import React, { useState } from 'react';
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md' 
}) => {
  const [viewState, setViewState] = useState<'normal' | 'maximized'>('normal');

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-2xl',
    lg: 'w-full max-w-4xl',
    xl: 'w-full max-w-6xl',
  };

  const getBackdropStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'background-color 0.3s ease-in-out',
    };

    if (viewState === 'normal') {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '1rem',
      };
    }

    return {
      ...baseStyle,
      backgroundColor: 'rgb(255 255 255)', // Cor sólida para modo maximizado (claro)
      // Para dark mode, você pode querer uma cor diferente, ex: 'rgb(17 24 39)'
    };
  };

  const getModalContentStyle = (): string => {
    const baseClasses = 'relative transform flex flex-col overflow-hidden text-left shadow-xl transition-all';
    
    if (viewState === 'maximized') {
      return `${baseClasses} w-full h-full bg-white dark:bg-gray-900`;
    }

    // Para modal xl (debug), garantir altura máxima e rolagem
    if (size === 'xl') {
      return `${baseClasses} ${sizeClasses[size]} max-h-[90vh] rounded-lg bg-white dark:bg-gray-800`;
    }

    return `${baseClasses} ${sizeClasses[size]} rounded-lg bg-white dark:bg-gray-800`;
  };

  return (
    <div 
      style={getBackdropStyle()}
      onClick={viewState === 'normal' ? onClose : undefined}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={getModalContentStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white" id="modal-title">
                {title}
            </h3>
            <div className="flex items-center space-x-2">
              <button 
                  type="button" 
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => setViewState(viewState === 'normal' ? 'maximized' : 'normal')}
              >
                  {viewState === 'normal' ? <ArrowsPointingOutIcon className="w-5 h-5" /> : <ArrowsPointingInIcon className="w-5 h-5" />}
                  <span className="sr-only">{viewState === 'normal' ? 'Maximizar' : 'Minimizar'}</span>
              </button>
              <button 
                  type="button" 
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={onClose}
              >
                  <XMarkIcon className="w-5 h-5" />
                  <span className="sr-only">Fechar modal</span>
              </button>
            </div>
        </div>
        <div className="p-6 overflow-y-auto flex-grow min-h-0">
            {children}
        </div>
      </div>
    </div>
  );
};
