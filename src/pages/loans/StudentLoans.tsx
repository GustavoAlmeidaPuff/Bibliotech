import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

import styles from './Loans.module.css';

interface Loan {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  borrowDate: any;
  dueDate: any;
  returnDate?: any;
  status: 'active' | 'returned';
  createdAt: any;
  readingProgress?: number;
  completed?: boolean;
}

interface Filters {
  studentName: string;
  bookTitle: string;
  status: string;
}

interface LocationState {
  message?: string;
}

const StudentLoans = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const message = state?.message;

  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showMessage, setShowMessage] = useState(!!message);
  const [filters, setFilters] = useState<Filters>({
    studentName: '',
    bookTitle: '',
    status: 'active'
  });
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [readingCompleted, setReadingCompleted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);
  const [returnError, setReturnError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchLoans();
  }, [currentUser]);

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  const fetchLoans = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const loansRef = collection(db, `users/${currentUser.uid}/loans`);
      
      // Buscar todos os documentos da coleção sem filtros que exijam índice
      const q = query(loansRef);
      const querySnapshot = await getDocs(q);
      
      console.log('Total de documentos na coleção:', querySnapshot.docs.length);
      
      if (querySnapshot.docs.length > 0) {
        console.log('Exemplos de documentos na coleção:');
        querySnapshot.docs.slice(0, 3).forEach((doc, index) => {
          console.log(`Documento ${index}:`, doc.id, doc.data());
        });
      }
      
      // Processar todos os documentos
      let allLoans = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Verificar se os campos existem antes de converter
        let borrowDate = null;
        let dueDate = null;
        let createdAt = null;
        
        try {
          borrowDate = data.borrowDate?.toDate ? data.borrowDate.toDate() : null;
          dueDate = data.dueDate?.toDate ? data.dueDate.toDate() : null;
          createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
        } catch (error) {
          console.error(`Erro ao converter datas do documento ${doc.id}:`, error);
        }
        
        return {
          id: doc.id,
          ...data,
          borrowDate,
          dueDate,
          createdAt
        };
      }) as Loan[];
      
      console.log('Total de locações processadas:', allLoans.length);
      
      // Filtrar para mostrar apenas locações ativas por padrão
      const activeLoans = allLoans.filter(loan => loan.status === 'active');
      
      // Ordenar pelo mais recente
      activeLoans.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      console.log('Locações ativas encontradas:', activeLoans.length);
      
      setLoans(activeLoans);
      setFilteredLoans(activeLoans);
    } catch (error) {
      console.error('Erro ao buscar locações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      
      if (!currentUser) return;

      const loansRef = collection(db, `users/${currentUser.uid}/loans`);
      
      // Buscar todos os documentos sem usar where + orderBy juntos, evitando a necessidade de índices
      const q = query(loansRef);
      
      const querySnapshot = await getDocs(q);
      console.log('Total de documentos na coleção para filtros:', querySnapshot.docs.length);
      
      const allLoans = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Verificar se os campos existem antes de converter
        let borrowDate = null;
        let dueDate = null;
        let createdAt = null;
        
        try {
          borrowDate = data.borrowDate?.toDate ? data.borrowDate.toDate() : null;
          dueDate = data.dueDate?.toDate ? data.dueDate.toDate() : null;
          createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
        } catch (error) {
          console.error(`Erro ao converter datas do documento ${doc.id}:`, error);
        }
        
        return {
          id: doc.id,
          ...data,
          borrowDate,
          dueDate,
          createdAt
        };
      }) as Loan[];
      
      // Aplicar todos os filtros no lado do cliente
      let filtered = [...allLoans];
      
      // Filtrar por status
      if (filters.status !== 'all') {
        filtered = filtered.filter(loan => loan.status === filters.status);
      }
      
      // Filtrar por nome de aluno
      const studentNameFilter = filters.studentName.toLowerCase().trim();
      if (studentNameFilter) {
        filtered = filtered.filter(loan => 
          loan.studentName.toLowerCase().includes(studentNameFilter)
        );
      }
      
      // Filtrar por título do livro
      const bookTitleFilter = filters.bookTitle.toLowerCase().trim();
      if (bookTitleFilter) {
        filtered = filtered.filter(loan => 
          loan.bookTitle.toLowerCase().includes(bookTitleFilter)
        );
      }
      
      // Ordenar pelo mais recente
      filtered.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      console.log('Locações filtradas:', filtered.length);
      
      setFilteredLoans(filtered);
      
      // Manter as locações ativas como padrão para a lista principal 
      // (quando não há filtros aplicados)
      if (!filtersApplied) {
        const activeOnly = allLoans
          .filter(loan => loan.status === 'active')
          .sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.getTime() - a.createdAt.getTime();
          });
        setLoans(activeOnly);
      } else {
        setLoans(filtered);
      }
      
      // Definir se filtros foram aplicados
      const hasNameFilter = studentNameFilter !== '';
      const hasBookFilter = bookTitleFilter !== '';
      const hasStatusFilter = filters.status !== 'active';
      setFiltersApplied(hasNameFilter || hasBookFilter || hasStatusFilter);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      studentName: '',
      bookTitle: '',
      status: 'active'
    });
    setFiltersApplied(false);
    fetchLoans();
  };

  const formatDate = (date: Date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const formatDateTime = (date: Date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDaysLeft = (dueDate: Date) => {
    if (!dueDate) return 0;
    
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getStatusClass = (loan: Loan) => {
    if (loan.status === 'returned') return styles.statusReturned;
    
    const daysLeft = getDaysLeft(loan.dueDate);
    
    if (daysLeft < 0) return styles.statusOverdue;
    if (daysLeft <= 3) return styles.statusWarning;
    return styles.statusActive;
  };

  const getStatusText = (loan: Loan) => {
    if (loan.status === 'returned') return 'Devolvido';
    
    const daysLeft = getDaysLeft(loan.dueDate);
    
    if (daysLeft < 0) return `Atrasado (${Math.abs(daysLeft)} dias)`;
    if (daysLeft === 0) return 'Vence hoje';
    if (daysLeft === 1) return 'Vence amanhã';
    return `${daysLeft} dias restantes`;
  };

  const currentLoans = filtersApplied ? filteredLoans : loans;

  const handleReturnBook = (loan: Loan) => {
    setSelectedLoan(loan);
    setReadingCompleted(false);
    setReadingProgress(0);
    setShowReturnDialog(true);
  };

  const handleReadingProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setReadingProgress(value);
    
    // Se o slider for colocado em 100%, considerar como leitura concluída
    if (value === 100) {
      setReadingCompleted(true);
    } else {
      setReadingCompleted(false);
    }
  };

  const processReturn = async () => {
    if (!currentUser || !selectedLoan) return;
    
    try {
      setLoading(true);
      
      const loanRef = doc(db, `users/${currentUser.uid}/loans/${selectedLoan.id}`);
      
      // Atualizar o empréstimo com as informações de devolução
      await updateDoc(loanRef, {
        status: 'returned',
        returnDate: serverTimestamp(),
        completed: readingCompleted,
        readingProgress: readingProgress,
        updatedAt: serverTimestamp()
      });
      
      // Atualizar a interface
      setReturnSuccess(`"${selectedLoan.bookTitle}" devolvido com sucesso!`);
      setShowReturnDialog(false);
      setSelectedLoan(null);
      
      // Atualizar a lista de empréstimos
      fetchLoans();
      
      // Limpar a mensagem de sucesso após alguns segundos
      setTimeout(() => {
        setReturnSuccess(null);
      }, 5000);
    } catch (error) {
      console.error('Erro ao processar devolução:', error);
      setReturnError('Erro ao processar devolução. Tente novamente.');
      
      // Limpar a mensagem de erro após alguns segundos
      setTimeout(() => {
        setReturnError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Locações de Alunos</h2>
        <div className={styles.headerActions}>
          <button
            className={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <>
                <XMarkIcon className={styles.buttonIcon} />
                Ocultar Filtros
              </>
            ) : (
              <>
                <FunnelIcon className={styles.buttonIcon} />
                {filtersApplied ? 'Filtros Aplicados' : 'Mostrar Filtros'}
              </>
            )}
          </button>
        </div>
      </div>

      {(showMessage && message) || returnSuccess ? (
        <div className={styles.successMessage}>
          <p>{returnSuccess || message}</p>
          <button 
            className={styles.closeButton}
            onClick={() => {
              setShowMessage(false);
              setReturnSuccess(null);
            }}
          >
            <XMarkIcon className={styles.smallIcon} />
          </button>
        </div>
      ) : null}

      {returnError && (
        <div className={styles.errorMessage}>
          <p>{returnError}</p>
          <button 
            className={styles.closeButton}
            onClick={() => setReturnError(null)}
          >
            <XMarkIcon className={styles.smallIcon} />
          </button>
        </div>
      )}

      {showFilters && (
        <div className={styles.filters}>
          <form onSubmit={handleSubmit} className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label htmlFor="studentName">Nome do Aluno</label>
              <input
                type="text"
                id="studentName"
                value={filters.studentName}
                onChange={(e) => handleFilterChange('studentName', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Filtrar por aluno..."
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="bookTitle">Título do Livro</label>
              <input
                type="text"
                id="bookTitle"
                value={filters.bookTitle}
                onChange={(e) => handleFilterChange('bookTitle', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Filtrar por livro..."
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="active">Ativos</option>
                <option value="returned">Devolvidos</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </form>

          <div className={styles.filterActions}>
            <button
              className={styles.applyFiltersButton}
              onClick={applyFilters}
            >
              Aplicar Filtros
            </button>
            <button
              className={styles.clearFiltersButton}
              onClick={clearFilters}
              disabled={!filtersApplied}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : loans.length === 0 ? (
          <div className={styles.emptyState}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.emptyIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <h3>Nenhuma locação registrada</h3>
            <p>Nenhum livro foi retirado pelos alunos ainda.</p>
          </div>
        ) : (
          <div className={styles.loansContainer}>
            {filtersApplied && filteredLoans.length === 0 ? (
              <div className={styles.noResults}>
                <p>Nenhuma locação encontrada com os filtros aplicados.</p>
                <button
                  className={styles.clearFiltersButton}
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Livro</th>
                      <th>Retirado em</th>
                      <th>Data de Devolução</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLoans.map(loan => (
                      <tr 
                        key={loan.id} 
                        className={`${styles.loanRow} ${loan.status === 'returned' ? styles.returnedRow : ''}`}
                        onClick={() => navigate(`/student-loan-detail/${loan.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                        <span 
                          style={{
                            cursor: 'pointer',
                            color: '#4a90e2',
                            borderBottom: '1px dotted #4a90e2',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/students/${loan.studentId}`);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#2c5aa0';
                            e.currentTarget.style.borderBottomStyle = 'solid';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#4a90e2';
                            e.currentTarget.style.borderBottomStyle = 'dotted';
                          }}
                          title={`Ir para o perfil de ${loan.studentName}`}
                        >
                          {loan.studentName}
                        </span>
                      </td>
                        <td className={styles.bookTitleCell}>{loan.bookTitle}</td>
                        <td>{formatDateTime(loan.borrowDate)}</td>
                        <td>{formatDate(loan.dueDate)}</td>
                        <td>
                          <span className={`${styles.statusTag} ${getStatusClass(loan)}`}>
                            {getStatusText(loan)}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          {loan.status === 'active' && (
                            <button 
                              className={styles.returnButton}
                              onClick={() => handleReturnBook(loan)}
                            >
                              Devolver
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showReturnDialog && selectedLoan && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Confirmar Devolução</h3>
            <p>Livro: <strong>{selectedLoan.bookTitle}</strong></p>
                            <p>Aluno: <strong>
                  <span 
                    style={{
                      cursor: 'pointer',
                      color: '#4a90e2',
                      borderBottom: '1px dotted #4a90e2',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/students/${selectedLoan.studentId}`);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2c5aa0';
                      e.currentTarget.style.borderBottomStyle = 'solid';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#4a90e2';
                      e.currentTarget.style.borderBottomStyle = 'dotted';
                    }}
                    title={`Ir para o perfil de ${selectedLoan.studentName}`}
                  >
                    {selectedLoan.studentName}
                  </span>
                </strong></p>
            
            <div className={styles.readingInfo}>
              <h4>Informações de Leitura</h4>
              
              <div className={styles.readingCompletedField}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={readingCompleted}
                    onChange={(e) => {
                      setReadingCompleted(e.target.checked);
                      if (e.target.checked) {
                        setReadingProgress(100);
                      }
                    }}
                  />
                  Leitura concluída
                </label>
              </div>
              
              <div className={styles.progressField}>
                <label>Progresso da leitura: {readingProgress}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={readingProgress}
                  onChange={handleReadingProgressChange}
                  className={styles.progressSlider}
                />
                <div className={styles.progressLabels}>
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowReturnDialog(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmButton}
                onClick={processReturn}
              >
                Confirmar Devolução
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLoans; 