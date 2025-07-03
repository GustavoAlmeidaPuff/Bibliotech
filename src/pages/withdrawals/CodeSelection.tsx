import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { MagnifyingGlassIcon, BookOpenIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import styles from './Withdrawals.module.css';

interface Student {
  id: string;
  name: string;
  classroom: string;
}

interface Book {
  id: string;
  codes: string[];
  title: string;
  authors?: string[];
  publisher?: string;
  quantity: number;
}

interface LocationState {
  studentName: string;
  bookTitle: string;
}

const CodeSelection = () => {
  const { studentId, bookId } = useParams<{ studentId: string; bookId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  // const state = location.state as LocationState;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser || !studentId || !bookId) {
      navigate('/student-withdrawals');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados do aluno
        const studentDoc = await getDoc(doc(db, `users/${currentUser.uid}/students/${studentId}`));
        if (!studentDoc.exists()) {
          throw new Error('Aluno não encontrado');
        }
        const studentData = studentDoc.data();
        setStudent({
          id: studentDoc.id,
          name: studentData.name || '',
          classroom: studentData.classroom || ''
        });

        // Buscar dados do livro
        const bookDoc = await getDoc(doc(db, `users/${currentUser.uid}/books/${bookId}`));
        if (!bookDoc.exists()) {
          throw new Error('Livro não encontrado');
        }
        const bookData = bookDoc.data();
        
        // Compatibilidade com versão antiga (code -> codes)
        const codes = bookData.codes || (bookData.code ? [bookData.code] : []);
        
        setBook({
          id: bookDoc.id,
          codes,
          title: bookData.title || '',
          authors: bookData.authors || [],
          publisher: bookData.publisher || '',
          quantity: bookData.quantity || 0
        });

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError('Erro ao carregar os dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, studentId, bookId, navigate]);

  const filteredCodes = book?.codes.filter(code =>
    code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCodeSelect = (code: string) => {
    setSelectedCode(code);
  };

  const handleNext = () => {
    if (!selectedCode || !student || !book) return;
    
    navigate(`/withdrawal-confirmation/${studentId}/${bookId}`, {
      state: {
        studentName: student.name,
        bookTitle: book.title,
        selectedCode
      }
    });
  };

  const handleBack = () => {
    navigate(`/student-withdrawals/${studentId}`, { 
      state: { studentName: student?.name } 
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Carregando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorState}>
            <h3>Erro</h3>
            <p>{error}</p>
            <button 
              className={styles.backButton}
              onClick={handleBack}
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Selecionar Código do Exemplar</h2>
        <p className={styles.headerSubtitle}>
          Escolha qual exemplar de "{book?.title}" será retirado por {student?.name}
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.codeSelectionContainer}>
          {/* Informações do livro */}
          <div className={styles.selectedBookInfo}>
            <BookOpenIcon className={styles.selectedBookIcon} />
            <div className={styles.selectedBookDetails}>
              <h3>{book?.title}</h3>
              {book?.authors && book.authors.length > 0 && (
                <p>Por: {book.authors.join(', ')}</p>
              )}
              <p className={styles.availableCount}>
                {book?.codes.length} exemplar(es) disponível(eis)
              </p>
            </div>
          </div>

          {/* Campo de pesquisa */}
          {book && book.codes.length > 0 && (
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <MagnifyingGlassIcon className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Pesquisar código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
          )}

          {/* Lista de códigos */}
          <div className={styles.codesGrid}>
            {filteredCodes.length > 0 ? (
              filteredCodes.map(code => (
                <div
                  key={code}
                  className={`${styles.codeCard} ${selectedCode === code ? styles.selected : ''}`}
                  onClick={() => handleCodeSelect(code)}
                >
                  <div className={styles.codeNumber}>{code}</div>
                  {selectedCode === code && (
                    <div className={styles.selectedIndicator}>✓</div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noCodes}>
                <p>Nenhum código encontrado com a pesquisa "{searchTerm}"</p>
              </div>
            )}
          </div>

          {/* Código selecionado */}
          {selectedCode && (
            <div className={styles.selectedInfo}>
              <div className={styles.selectedLabel}>Código selecionado:</div>
              <div className={styles.selectedCode}>{selectedCode}</div>
            </div>
          )}

          {/* Ações */}
          <div className={styles.actions}>
            <button 
              className={styles.backButton}
              onClick={handleBack}
            >
              Voltar
            </button>
            <button 
              className={styles.nextButton}
              onClick={handleNext}
              disabled={!selectedCode}
            >
              Avançar
              <ArrowRightIcon className={styles.buttonIcon} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSelection; 