import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getDashboardStats,
  
  getTurmasParaDashboard,
  getUsuariosPorCategoria,

  getAtividadesRecentes
} from '../lib/turmasService2';
import { getAvaliacoesDoUsuario } from '../lib/avaliacoesService';
import type { DashboardStats, Avaliacao, Turma, Usuario, ReferenciaLink, AtividadeRecente } from '../types';
import {
  UsersIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon as ClipboardCheckIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CogIcon,
  DocumentChartBarIcon as DocumentReportIcon,

  LinkIcon,
  DocumentTextIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [atividades, setAtividades] = useState<AtividadeRecente[]>([]);
  const [componentLoading, setComponentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<Avaliacao[] | Turma[] | Usuario[] | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (user) {
      try {
        setComponentLoading(true);
        const [statsData, atividadesData] = await Promise.all([
          getDashboardStats(user.id),
          getAtividadesRecentes(),
        ]);
        setStats(statsData);
        setAtividades(atividadesData);
      } catch (err: any) {
        setError('Falha ao carregar os dados do dashboard. Tente novamente mais tarde.');
        setStats(null);
        setAtividades([]);
      } finally {
        setComponentLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    } else if (!authLoading && !user) {
      setComponentLoading(false);
      setError("Usuário não autenticado.");
    }
  }, [authLoading, user, loadDashboardData]);

  const handleCardClick = async (dataType: string) => {
    if (!user) {
      setError("Sessão expirada. Por favor, faça login novamente.");
      return;
    }

    setModalTitle(`Lista de ${dataType}`);
    setIsModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalData(null);

    try {
      let data;
      switch (dataType) {
        case 'Avaliações Realizadas':
          data = await getAvaliacoesDoUsuario();
          break;
        case 'Minhas Turmas':
        
          data = await getTurmasParaDashboard(user.id);
          break;
        case 'Alunos':
          data = await getUsuariosPorCategoria('aluno');
          break;
        case 'Professores':
          data = await getUsuariosPorCategoria('professor');
          break;
        case 'Monitores':
          data = await getUsuariosPorCategoria('monitor');
          break;
        case 'Admins':
          data = await getUsuariosPorCategoria('admin');
          break;
        default:
          throw new Error(`Tipo de dado desconhecido: ${dataType}`);
      }
      setModalData(data);
    } catch (err: any) {
      setModalError(`Falha ao carregar dados: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const renderModalContent = () => {
    if (modalLoading) return <LoadingSpinner />;
    if (modalError) return <p className="text-red-500 dark:text-red-400">{modalError}</p>;
    if (!modalData || modalData.length === 0) return <p className="text-gray-500 dark:text-gray-400">Nenhum dado encontrado.</p>;

    return (
      <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {modalData.map((item: any) => (
          <li key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
            <p className="font-semibold text-gray-800 dark:text-gray-100">{item.nome || item.titulo || item.full_name}</p>
            {item.email && <p className="text-sm text-gray-600 dark:text-gray-300">{item.email}</p>}
            {item.created_at && <p className="text-sm text-gray-500 dark:text-gray-400">Criado em: {format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>}
            {item.data_limite && <p className="text-sm text-gray-500 dark:text-gray-400">Data Limite: {format(new Date(item.data_limite), 'dd/MM/yyyy', { locale: ptBR })}</p>}
            {item.turma_nome && <p className="text-xs text-gray-500 dark:text-gray-400">Turma: {item.turma_nome}</p>}
          </li>
        ))}
      </ul>
    );
  };

  if (authLoading || componentLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900"><LoadingSpinner /></div>;
  }

  if (error || !stats) {
    return <div className="text-center text-red-500 dark:text-red-400 mt-10 p-4">{error || 'Não foi possível carregar os dados do dashboard.'}</div>;
  }

  const turmasLabel = 'Minhas Turmas';

  const statCards = [
    { title: 'Avaliações Realizadas', value: stats.avaliacoesRealizadas, icon: ClipboardCheckIcon, color: 'blue' },
    { title: turmasLabel, value: stats.turmasUsuario, icon: BookOpenIcon, color: 'green' },
    { title: 'Alunos', value: stats.alunosTotal, icon: UsersIcon, color: 'yellow' },
    { title: 'Professores', value: stats.professoresTotal, icon: AcademicCapIcon, color: 'purple' },
    { title: 'Monitores', value: stats.monitoresTotal, icon: UserGroupIcon, color: 'pink' },
    { title: 'Admins', value: stats.adminsTotal, icon: ShieldCheckIcon, color: 'red' },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold dark:text-white mb-2">Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Bem-vindo(a) de volta, {user?.user_metadata?.full_name || 'Usuário'}.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map(card => (
          <div
            key={card.title}
            onClick={() => handleCardClick(card.title)}
            className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border-l-4 border-${card.color}-500`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-${card.color}-100 dark:bg-gray-700 mr-4`}>
                <card.icon className={`h-7 w-7 text-${card.color}-600 dark:text-${card.color}-300`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-3xl font-bold dark:text-white">{card.value ?? '0'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Ações Rápidas</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 font-semibold">
              <DocumentReportIcon className="h-5 w-5 mr-2" />
              Gerar Relatório
            </button>
            <button className="w-full flex items-center justify-center p-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-300 font-semibold">
              <CogIcon className="h-5 w-5 mr-2" />
              Gerenciar Alunos
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Links Úteis</h3>
            <div className="space-y-3">
              {stats.referenciaLinks?.length > 0 ? (
                stats.referenciaLinks.map((link: ReferenciaLink) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 font-medium"
                  >
                    {link.tipo === 'pdf' && <DocumentTextIcon className="h-5 w-5 mr-3 text-red-500" />}
                    {link.tipo === 'drive' && <FolderIcon className="h-5 w-5 mr-3 text-yellow-500" />}
                    {!['pdf', 'drive'].includes(link.tipo) && <LinkIcon className="h-5 w-5 mr-3 text-blue-500" />}
                    {link.titulo}
                  </a>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Nenhum link disponível.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Histórico de Atividades</h2>
          <ul className="space-y-4">
            {atividades.length > 0 ? (
              atividades.map((act) => (
                <li key={act.id} className="flex items-start space-x-4">
                   <img 
                    className="h-10 w-10 rounded-full"
                    src={act.usuario?.avatar_url || `https://ui-avatars.com/api/?name=${act.usuario?.full_name || '?'}&background=random`}
                    alt="Avatar"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: act.detalhes?.descricao || 'Atividade não descrita' }}></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {act.usuario?.full_name} - {format(new Date(act.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhuma atividade recente.</p>
            )}
          </ul>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default DashboardPage;
