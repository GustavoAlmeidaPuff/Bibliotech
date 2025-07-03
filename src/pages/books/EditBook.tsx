import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTags } from '../../contexts/TagsContext';
import { useAuthors } from '../../contexts/AuthorsContext';
import { useDistinctCodes } from '../../hooks/useDistinctCodes';
import AutocompleteInput from '../../components/AutocompleteInput';
import styles from './RegisterBook.module.css'; // Reusando os estilos do RegisterBook

interface BookForm {
  codes: string[];
  title: string;
  genres: string[];
  authors: string[];
  publisher: string;
  acquisitionDate: string;
  shelf: string;
  collection: string;
  quantity: number;
}

interface LoanHistory {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'active' | 'returned';
  createdAt: Date;
}

const EditBook = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [formData, setFormData] = useState<BookForm>({
    codes: [],
    title: '',
    genres: [],
    authors: [],
    publisher: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    shelf: '',
    collection: '',
    quantity: 1
  });
  
  const [currentCode, setCurrentCode] = useState('');
  const [currentGenre, setCurrentGenre] = useState('');
  const [currentAuthor, setCurrentAuthor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loanHistory, setLoanHistory] = useState<LoanHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const { currentUser } = useAuth();
  const { genres, addGenre, capitalizeTag } = useTags();
  const { authors, addAuthor, capitalizeAuthor } = useAuthors();
  const useDistinctCodesEnabled = useDistinctCodes();
  const navigate = useNavigate();

  const fetchLoanHistory = async () => {
    if (!currentUser || !bookId) return;

    try {
      setLoadingHistory(true);
      console.log(`Buscando histórico para o livro: ${bookId}, usuário: ${currentUser.uid}`);
      
      const loansRef = collection(db, `users/${currentUser.uid}/loans`);
      const q = query(
        loansRef,
        where('bookId', '==', bookId)
      );
      
      const loansSnap = await getDocs(q);
      console.log(`Total de documentos encontrados na consulta: ${loansSnap.docs.length}`);
      
      // Vamos também fazer uma consulta de todos os loans para debug
      const allLoansQuery = query(loansRef);
      const allLoansSnap = await getDocs(allLoansQuery);
      console.log(`Total de loans na coleção: ${allLoansSnap.docs.length}`);
      
      // Verificar alguns documentos para debug
      if (allLoansSnap.docs.length > 0) {
        allLoansSnap.docs.slice(0, 3).forEach((doc, index) => {
          const data = doc.data();
          console.log(`Documento ${index + 1}:`, {
            id: doc.id,
            bookId: data.bookId,
            bookTitle: data.bookTitle,
            studentName: data.studentName
          });
        });
      }
      
      const historyData = loansSnap.docs.map(doc => {
        const data = doc.data();
        
        // Converter timestamps para Dates
        const borrowDate = data.borrowDate?.toDate ? data.borrowDate.toDate() : new Date();
        const dueDate = data.dueDate?.toDate ? data.dueDate.toDate() : new Date();
        const returnDate = data.returnDate?.toDate ? data.returnDate.toDate() : undefined;
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        
        return {
          id: doc.id,
          ...data,
          borrowDate,
          dueDate,
          returnDate,
          createdAt
        };
      }) as LoanHistory[];
      
      // Ordenar no lado do cliente por data de criação (mais recente primeiro)
      historyData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      setLoanHistory(historyData);
      
      console.log(`Histórico encontrado para o livro ${bookId}:`, historyData.length, 'registros');
      if (historyData.length > 0) {
        console.log('Primeiro registro:', historyData[0]);
      }
    } catch (err) {
      console.error('Erro ao buscar histórico de retiradas:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      if (!currentUser || !bookId) return;

      try {
        const bookRef = doc(db, `users/${currentUser.uid}/books/${bookId}`);
        const bookSnap = await getDoc(bookRef);

        if (bookSnap.exists()) {
          const bookData = bookSnap.data();
          
          // Compatibilidade com versão antiga (code -> codes)
          const formattedData = {
            ...bookData,
            codes: bookData.codes || (bookData.code ? [bookData.code] : [])
          } as BookForm;
          
          setFormData(formattedData);
          
          // Adiciona os gêneros e autores às listas de sugestões
          formattedData.genres.forEach(addGenre);
          formattedData.authors.forEach(addAuthor);
          
          // Buscar histórico de retiradas após carregar o livro
          await fetchLoanHistory();
        } else {
          setError('Livro não encontrado');
          navigate('/books');
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Erro ao carregar dados do livro');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [currentUser, bookId, navigate, addGenre, addAuthor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codes.length || !formData.title) {
      setError('Pelo menos um código e o título são campos obrigatórios');
      return;
    }

    if (!currentUser || !bookId) {
      setError('Você precisa estar logado para editar livros');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const bookData = {
        ...formData,
        // Se useDistinctCodes estiver ativado, a quantidade é o número de códigos
        quantity: useDistinctCodesEnabled ? formData.codes.length : formData.quantity,
        updatedAt: serverTimestamp(),
      };

      const bookRef = doc(db, `users/${currentUser.uid}/books/${bookId}`);
      await updateDoc(bookRef, bookData);
      
      navigate('/books');
    } catch (err) {
      console.error('Error updating book:', err);
      if (err instanceof Error) {
        setError(`Erro ao atualizar livro: ${err.message}`);
      } else {
        setError('Erro ao atualizar livro. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = (genre: string) => {
    const capitalizedGenre = capitalizeTag(genre);
    if (!formData.genres.includes(capitalizedGenre)) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, capitalizedGenre]
      }));
      addGenre(capitalizedGenre);
    }
  };

  const handleAuthorSelect = (author: string) => {
    const capitalizedAuthor = capitalizeAuthor(author);
    if (!formData.authors.includes(capitalizedAuthor)) {
      setFormData(prev => ({
        ...prev,
        authors: [...prev.authors, capitalizedAuthor]
      }));
      addAuthor(capitalizedAuthor);
    }
  };

  const removeGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }));
  };

  const removeAuthor = (author: string) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.filter(a => a !== author)
    }));
  };

  const formatDate = (date: Date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getStatusText = (loan: LoanHistory) => {
    if (loan.status === 'returned') return 'Devolvido';
    return 'Retirado';
  };

  const getStatusClass = (loan: LoanHistory) => {
    return loan.status === 'returned' ? styles.statusReturned : styles.statusActive;
  };

  // Função para adicionar código
  const handleAddCode = () => {
    const code = currentCode.trim();
    if (code && !formData.codes.includes(code)) {
      setFormData(prev => ({
        ...prev,
        codes: [...prev.codes, code]
      }));
      setCurrentCode('');
    }
  };

  // Função para remover código
  const removeCode = (codeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      codes: prev.codes.filter(code => code !== codeToRemove)
    }));
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Editar Livro</h2>
        <button 
          className={styles.cancelButton}
          onClick={() => navigate('/books')}
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.formGrid}>
          <div className={styles.mainSection}>
            <div className={styles.formGroup}>
              <label htmlFor="codes">Códigos * (cada exemplar tem seu código)</label>
              <div className={styles.codeInputWrapper}>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="codes"
                    value={currentCode}
                    onChange={e => setCurrentCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCode();
                      }
                    }}
                    placeholder="Digite o código do exemplar"
                  />
                  <button
                    type="button"
                    onClick={handleAddCode}
                    className={styles.addCodeButton}
                    disabled={!currentCode.trim()}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
              <div className={styles.codesList}>
                {formData.codes.map(code => (
                  <span key={code} className={styles.codeTag}>
                    {code}
                    <button
                      type="button"
                      onClick={() => removeCode(code)}
                      className={styles.removeTag}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {formData.codes.length === 0 && (
                <div className={styles.emptyCodesMessage}>
                  Adicione pelo menos um código para o livro
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="title">Título do Livro *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <AutocompleteInput
                  id="authors"
                  label="Autores"
                  value={currentAuthor}
                  onChange={setCurrentAuthor}
                  onSelect={handleAuthorSelect}
                  suggestions={authors}
                  placeholder="Digite para adicionar"
                />
                <div className={styles.tags}>
                  {formData.authors.map(author => (
                    <span key={author} className={styles.tag}>
                      {author}
                      <button
                        type="button"
                        onClick={() => removeAuthor(author)}
                        className={styles.removeTag}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="collection">Coleção</label>
                <input
                  type="text"
                  id="collection"
                  value={formData.collection}
                  onChange={e => setFormData(prev => ({ ...prev, collection: e.target.value }))}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="acquisitionDate">Data de Aquisição</label>
                <input
                  type="date"
                  id="acquisitionDate"
                  value={formData.acquisitionDate}
                  onChange={e => setFormData(prev => ({ ...prev, acquisitionDate: e.target.value }))}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="shelf">Prateleira</label>
                <input
                  type="text"
                  id="shelf"
                  value={formData.shelf}
                  onChange={e => setFormData(prev => ({ ...prev, shelf: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className={styles.sideSection}>
            <div className={styles.formGroup}>
              <AutocompleteInput
                id="genres"
                label="Gêneros/Classes"
                value={currentGenre}
                onChange={setCurrentGenre}
                onSelect={handleGenreSelect}
                suggestions={genres}
                placeholder="Digite para buscar ou adicionar"
              />
              <div className={styles.tags}>
                {formData.genres.map(genre => (
                  <span key={genre} className={styles.tag}>
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(genre)}
                      className={styles.removeTag}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="publisher">Editora</label>
              <input
                type="text"
                id="publisher"
                value={formData.publisher}
                onChange={e => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
              />
            </div>

            {!useDistinctCodesEnabled && (
              <div className={styles.formGroup}>
                <label htmlFor="quantity">Quantidade</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
                <p className={styles.helpText}>
                  Número de exemplares disponíveis deste título
                </p>
              </div>
            )}
            
            {useDistinctCodesEnabled && (
              <div className={styles.formGroup}>
                <label>Quantidade Calculada</label>
                <div className={styles.calculatedQuantity}>
                  {formData.codes.length} exemplar(es)
                </div>
                <p className={styles.helpText}>
                  A quantidade é calculada automaticamente pelo número de códigos adicionados
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      {/* Seção de Histórico de Retiradas */}
      <div className={styles.historySection}>
        <h3>Histórico de Retiradas</h3>
        
        {loadingHistory ? (
          <div className={styles.loading}>Carregando histórico...</div>
        ) : loanHistory.length > 0 ? (
          <div className={styles.historyList}>
            {loanHistory.map(loan => (
              <div key={loan.id} className={styles.historyCard}>
                <div className={styles.historyHeader}>
                  <div className={styles.studentName}>{loan.studentName}</div>
                  <span className={`${styles.statusTag} ${getStatusClass(loan)}`}>
                    {getStatusText(loan)}
                  </span>
                </div>
                <div className={styles.historyDetails}>
                  <div className={styles.historyDate}>
                    <span>Retirado: {formatDate(loan.borrowDate)}</span>
                    <span>Devolução: {formatDate(loan.dueDate)}</span>
                    {loan.returnDate && (
                      <span>Devolvido: {formatDate(loan.returnDate)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyHistory}>
            <p>Este livro ainda não foi retirado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditBook; 