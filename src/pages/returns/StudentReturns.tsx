import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

import styles from './Returns.module.css';

interface Loan {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  borrowDate: Date;
  dueDate: Date;
  status: 'active' | 'returned';
  createdAt: Date;
  readingProgress?: number; // Percentual de leitura
  completed?: boolean; // Indicador se a leitura foi concluída
}

const StudentReturns = () => {
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [readingCompleted, setReadingCompleted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveLoans();
  }, [currentUser]);

  const fetchActiveLoans = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const loansRef = collection(db, `users/${currentUser.uid}/loans`);
      const q = query(
        loansRef,
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      
      const loans = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Converter Firestore timestamps para Date
        const borrowDate = data.borrowDate?.toDate ? data.borrowDate.toDate() : new Date();
        const dueDate = data.dueDate?.toDate ? data.dueDate.toDate() : new Date();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        
        return {
          id: doc.id,
          ...data,
          borrowDate,
          dueDate,
          createdAt
        };
      }) as Loan[];
      
      setActiveLoans(loans);
    } catch (error) {
      console.error('Erro ao buscar empréstimos ativos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReturn = (loan: Loan) => {
    setSelectedLoan(loan);
    setReadingCompleted(false);
    setReadingProgress(0);
    setShowConfirmDialog(true);
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
      setShowConfirmDialog(false);
      setSelectedLoan(null);
      
      // Atualizar a lista de empréstimos ativos
      fetchActiveLoans();
      
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
      <h2>Devolução de Livros - Alunos</h2>
      
      {returnSuccess && (
        <div className={styles.successAlert}>
          {returnSuccess}
        </div>
      )}
      
      {returnError && (
        <div className={styles.errorAlert}>
          {returnError}
        </div>
      )}
      
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : activeLoans.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Não há empréstimos ativos</h3>
            <p>Todos os livros foram devolvidos.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableHeader}>
              <h3>Empréstimos Ativos</h3>
              <p>Total: {activeLoans.length} livros</p>
            </div>
            
            <div className={styles.tableContainer}>
              <table className={styles.loansTable}>
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
                  {activeLoans.map(loan => {
                    const isOverdue = new Date() > loan.dueDate;
                    
                    return (
                      <tr key={loan.id} className={isOverdue ? styles.overdue : ''}>
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
                        <td>{loan.bookTitle}</td>
                        <td>{loan.borrowDate.toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</td>
                        <td>{loan.dueDate.toLocaleDateString()}</td>
                        <td>
                          <span className={`${styles.status} ${isOverdue ? styles.overdueStatus : styles.activeStatus}`}>
                            {isOverdue ? 'Atrasado' : 'Ativo'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className={styles.returnButton}
                            onClick={() => handleConfirmReturn(loan)}
                          >
                            Devolver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      
      {showConfirmDialog && selectedLoan && (
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
                onClick={() => setShowConfirmDialog(false)}
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

export default StudentReturns; 