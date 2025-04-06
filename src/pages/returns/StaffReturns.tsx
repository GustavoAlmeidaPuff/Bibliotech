import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  where, 
  doc, 
  deleteDoc, 
  getDoc, 
  updateDoc,
  Timestamp, 
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Returns.module.css';

interface StaffLoan {
  id: string;
  staffId: string;
  bookId: string;
  loanDate: Timestamp;
  staffName: string;
  bookTitle: string;
}

const ITEMS_PER_PAGE = 10;

const StaffReturns = () => {
  const [loans, setLoans] = useState<StaffLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLoans, setFilteredLoans] = useState<StaffLoan[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{show: boolean, loanId: string, bookId: string, staffName: string, bookTitle: string}>({
    show: false,
    loanId: '',
    bookId: '',
    staffName: '',
    bookTitle: ''
  });
  
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchLoans();
  }, [currentUser]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = loans.filter(loan => 
        loan.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLoans(filtered);
    } else {
      setFilteredLoans(loans);
    }
  }, [searchQuery, loans]);

  const fetchLoans = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      let loansQuery;
      
      if (lastVisible && !searchQuery) {
        // Paginação
        loansQuery = query(
          collection(db, `users/${currentUser.uid}/staffLoans`),
          orderBy('loanDate', 'desc'),
          startAfter(lastVisible),
          limit(ITEMS_PER_PAGE)
        );
      } else {
        // Primeira página
        loansQuery = query(
          collection(db, `users/${currentUser.uid}/staffLoans`),
          orderBy('loanDate', 'desc'),
          limit(ITEMS_PER_PAGE)
        );
      }
      
      const querySnapshot = await getDocs(loansQuery);
      
      // Verificar se há mais itens
      if (querySnapshot.docs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      } else {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(true);
      }
      
      const loanPromises = querySnapshot.docs.map(async (docSnapshot) => {
        const loanData = docSnapshot.data();
        
        // Buscar informações do funcionário
        let staffName = 'Funcionário não encontrado';
        try {
          const staffRef = doc(db, `users/${currentUser.uid}/staff/${loanData.staffId}`);
          const staffDoc = await getDoc(staffRef);
          if (staffDoc.exists()) {
            const staffData = staffDoc.data();
            staffName = staffData.name || 'Nome não disponível';
          }
        } catch (err) {
          console.error('Erro ao buscar dados do funcionário:', err);
        }
        
        // Buscar informações do livro
        let bookTitle = 'Livro não encontrado';
        try {
          const bookRef = doc(db, `users/${currentUser.uid}/books/${loanData.bookId}`);
          const bookDoc = await getDoc(bookRef);
          if (bookDoc.exists()) {
            const bookData = bookDoc.data();
            bookTitle = bookData.title || 'Título não disponível';
          }
        } catch (err) {
          console.error('Erro ao buscar dados do livro:', err);
        }
        
        return {
          id: docSnapshot.id,
          staffId: loanData.staffId,
          bookId: loanData.bookId,
          loanDate: loanData.loanDate,
          staffName,
          bookTitle
        };
      });
      
      const loansWithDetails = await Promise.all(loanPromises);
      
      if (lastVisible && !searchQuery) {
        setLoans(prev => [...prev, ...loansWithDetails]);
      } else {
        setLoans(loansWithDetails);
      }
      
    } catch (error) {
      console.error('Erro ao buscar locações:', error);
      setError('Erro ao carregar locações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchLoans();
    }
  };

  const handleReturn = (loanId: string, bookId: string, staffName: string, bookTitle: string) => {
    setConfirmDialog({
      show: true,
      loanId,
      bookId,
      staffName,
      bookTitle
    });
  };

  const confirmReturn = async () => {
    if (!currentUser) return;
    
    try {
      const { loanId, bookId } = confirmDialog;
      
      // 1. Atualiza o livro para disponível
      const bookRef = doc(db, `users/${currentUser.uid}/books/${bookId}`);
      await updateDoc(bookRef, { available: true });
      
      // 2. Remove o registro de locação
      const loanRef = doc(db, `users/${currentUser.uid}/staffLoans/${loanId}`);
      await deleteDoc(loanRef);
      
      // 3. Atualiza a lista
      setLoans(prev => prev.filter(loan => loan.id !== loanId));
      setConfirmDialog({show: false, loanId: '', bookId: '', staffName: '', bookTitle: ''});
      
    } catch (error) {
      console.error('Erro ao devolver livro:', error);
      setError('Erro ao processar devolução. Tente novamente.');
    }
  };

  const closeDialog = () => {
    setConfirmDialog({show: false, loanId: '', bookId: '', staffName: '', bookTitle: ''});
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={styles.container}>
      <h2>Devoluções de Professores e Funcionários</h2>
      
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Buscar por nome do funcionário ou título do livro..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.content}>
        {loading && loans.length === 0 ? (
          <div className={styles.loading}>Carregando locações...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : filteredLoans.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhuma locação registrada para professores ou funcionários.</p>
          </div>
        ) : (
          <>
            <div className={styles.cardGrid}>
              {filteredLoans.map(loan => (
                <div key={loan.id} className={styles.card}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{loan.bookTitle}</h3>
                    </div>
                    <div className={styles.cardBody}>
                      <p><strong>Funcionário:</strong> {loan.staffName}</p>
                      <p>
                        <strong>Emprestado em:</strong> {' '}
                        {loan.loanDate && loan.loanDate.toDate 
                          ? loan.loanDate.toDate().toLocaleDateString('pt-BR') 
                          : 'Data não disponível'}
                      </p>
                    </div>
                    <div className={styles.cardFooter}>
                      <button 
                        className={styles.returnButton}
                        onClick={() => handleReturn(loan.id, loan.bookId, loan.staffName, loan.bookTitle)}
                      >
                        Devolver
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {!searchQuery && hasMore && (
              <div className={styles.loadMoreContainer}>
                <button 
                  className={styles.loadMoreButton}
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : 'Carregar Mais'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {confirmDialog.show && (
        <div className={styles.confirmDialog}>
          <div className={styles.dialogContent}>
            <h3>Confirmar Devolução</h3>
            <p>Confirma a devolução do livro "{confirmDialog.bookTitle}" emprestado para {confirmDialog.staffName}?</p>
            <div className={styles.dialogActions}>
              <button 
                className={styles.cancelButton}
                onClick={closeDialog}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmButton}
                onClick={confirmReturn}
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

export default StaffReturns; 