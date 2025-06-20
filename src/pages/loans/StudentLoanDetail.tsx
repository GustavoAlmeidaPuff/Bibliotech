import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './StudentLoanDetail.module.css';

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

const StudentLoanDetail = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [readingCompleted, setReadingCompleted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    fetchLoanDetails();
  }, [currentUser, loanId]);
  
  const fetchLoanDetails = async () => {
    if (!currentUser || !loanId) {
      setError('Informações de locação não encontradas');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const loanRef = doc(db, `users/${currentUser.uid}/loans/${loanId}`);
      const loanDoc = await getDoc(loanRef);
      
      if (!loanDoc.exists()) {
        setError('Locação não encontrada');
        setLoading(false);
        return;
      }
      
      const loanData = loanDoc.data();
      
      // Converter timestamps para Date
      const borrowDate = loanData.borrowDate?.toDate ? loanData.borrowDate.toDate() : new Date();
      const dueDate = loanData.dueDate?.toDate ? loanData.dueDate.toDate() : new Date();
      const returnDate = loanData.returnDate?.toDate ? loanData.returnDate.toDate() : undefined;
      const createdAt = loanData.createdAt?.toDate ? loanData.createdAt.toDate() : new Date();
      
      setLoan({
        id: loanDoc.id,
        ...loanData,
        borrowDate,
        dueDate,
        returnDate,
        createdAt
      } as Loan);
      
    } catch (err) {
      console.error('Erro ao buscar detalhes da locação:', err);
      setError('Ocorreu um erro ao carregar os detalhes da locação');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date: Date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  const getDaysLeft = (dueDate: Date) => {
    if (!dueDate) return 0;
    
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const getStatusText = (loan: Loan) => {
    if (loan.status === 'returned') return 'Devolvido';
    
    const daysLeft = getDaysLeft(loan.dueDate);
    
    if (daysLeft < 0) return `Atrasado (${Math.abs(daysLeft)} dias)`;
    if (daysLeft === 0) return 'Vence hoje';
    if (daysLeft === 1) return 'Vence amanhã';
    return `${daysLeft} dias restantes`;
  };
  
  const getStatusClass = () => {
    if (!loan) return '';
    
    if (loan.status === 'returned') return styles.statusReturned;
    
    const daysLeft = getDaysLeft(loan.dueDate);
    
    if (daysLeft < 0) return styles.statusOverdue;
    if (daysLeft <= 3) return styles.statusWarning;
    return styles.statusActive;
  };
  
  const handleReturnLoan = async () => {
    if (!currentUser || !loan) return;

    try {
      setProcessing(true);
      const loanRef = doc(db, `users/${currentUser.uid}/loans/${loan.id}`);

      await updateDoc(loanRef, {
        status: 'returned',
        returnDate: serverTimestamp(),
        completed: readingCompleted,
        readingProgress: readingProgress,
        updatedAt: serverTimestamp()
      });

      setShowReturnDialog(false);
      await fetchLoanDetails(); // Re-fetch data to update UI

    } catch (err) {
      console.error('Erro ao processar devolução:', err);
      setError('Ocorreu um erro ao processar a devolução');
      setShowReturnDialog(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleReadingProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setReadingProgress(value);
    setReadingCompleted(value === 100);
  };

  const handleCancelLoan = async () => {
    if (!currentUser || !loan) return;
    
    try {
      setProcessing(true);
      
      // 1. Atualizar a quantidade do livro (incrementar +1)
      const bookRef = doc(db, `users/${currentUser.uid}/books/${loan.bookId}`);
      const bookDoc = await getDoc(bookRef);
      
      if (bookDoc.exists()) {
        const bookData = bookDoc.data();
        await updateDoc(bookRef, {
          quantity: (bookData.quantity || 0) + 1
        });
      }
      
      // 2. Excluir o registro de locação
      const loanRef = doc(db, `users/${currentUser.uid}/loans/${loan.id}`);
      await deleteDoc(loanRef);
      
      // 3. Redirecionar para a página de locações com mensagem
      navigate('/student-loans', { 
        state: { 
          message: `Locação do livro "${loan.bookTitle}" cancelada com sucesso` 
        } 
      });
      
    } catch (err) {
      console.error('Erro ao cancelar locação:', err);
      setError('Erro ao processar o cancelamento da locação');
      setShowCancelDialog(false);
    } finally {
      setProcessing(false);
    }
  };
  
  const handleGoBack = () => {
    navigate('/student-loans');
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={handleGoBack}
        >
          ← Voltar para Locações
        </button>
        <h2>Detalhes da Locação</h2>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className={styles.loading}>Carregando detalhes da locação...</div>
      ) : !loan ? (
        <div className={styles.notFound}>
          <h3>Locação não encontrada</h3>
          <p>A locação solicitada não foi encontrada ou não existe mais.</p>
          <button 
            className={styles.backButton}
            onClick={handleGoBack}
          >
            Voltar para Locações
          </button>
        </div>
      ) : (
        <div className={styles.detailsContainer}>
          <div className={styles.loanInfo}>
            <div className={styles.mainDetails}>
              <div className={styles.bookTitle}>
                <h3>{loan.bookTitle}</h3>
                <span className={`${styles.statusTag} ${getStatusClass()}`}>
                  {getStatusText(loan)}
                </span>
              </div>
              
              <div className={styles.studentInfo}>
                <p>Aluno: <strong>{loan.studentName}</strong></p>
              </div>
            </div>
            
            <div className={styles.datesSection}>
              <div className={styles.dateItem}>
                <span className={styles.dateLabel}>Data de Retirada:</span>
                <span className={styles.dateValue}>{formatDate(loan.borrowDate)}</span>
              </div>
              
              <div className={styles.dateItem}>
                <span className={styles.dateLabel}>Data de Devolução:</span>
                <span className={styles.dateValue}>{formatDate(loan.dueDate)}</span>
              </div>
              
              {loan.returnDate && (
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Data de Retorno:</span>
                  <span className={styles.dateValue}>{formatDate(loan.returnDate)}</span>
                </div>
              )}
            </div>
            
            {loan.status === 'active' && (
              <div className={styles.actionsSection}>
                <button 
                  className={styles.returnButton}
                  onClick={() => {
                    setReadingProgress(loan.readingProgress || 0);
                    setReadingCompleted(loan.completed || false);
                    setShowReturnDialog(true);
                  }}
                  disabled={processing}
                >
                  Devolver
                </button>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowCancelDialog(true)}
                  disabled={processing}
                >
                  Cancelar Retirada
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showReturnDialog && loan && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Confirmar Devolução</h3>
            <p>Livro: <strong>{loan.bookTitle}</strong></p>
            <p>Aluno: <strong>{loan.studentName}</strong></p>
            
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
                  disabled={processing}
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
                className={styles.modalCancelButton}
                onClick={() => setShowReturnDialog(false)}
                disabled={processing}
              >
                Cancelar
              </button>
              <button 
                className={styles.modalConfirmReturnButton}
                onClick={handleReturnLoan}
                disabled={processing}
              >
                {processing ? 'Processando...' : 'Confirmar Devolução'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelDialog && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Confirmar Cancelamento</h3>
            <p>Tem certeza que deseja cancelar a retirada do livro <strong>"{loan?.bookTitle}"</strong>?</p>
            <p>Esta ação não pode ser desfeita. O livro retornará ao acervo e todas as estatísticas relacionadas serão anuladas.</p>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.modalCancelButton}
                onClick={() => setShowCancelDialog(false)}
                disabled={processing}
              >
                Não, Manter Retirada
              </button>
              <button 
                className={styles.modalConfirmButton}
                onClick={handleCancelLoan}
                disabled={processing}
              >
                {processing ? 'Processando...' : 'Sim, Cancelar Retirada'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLoanDetail; 