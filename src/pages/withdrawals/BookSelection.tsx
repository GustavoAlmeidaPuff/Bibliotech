import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FunnelIcon, 
  XMarkIcon, 
  HandRaisedIcon 
} from '@heroicons/react/24/outline';
import styles from './Withdrawals.module.css';

interface Book {
  id: string;
  code?: string;
  codes?: string[];
  title: string;
  authors?: string[];
  genres?: string[];
  publisher?: string;
  acquisitionDate?: string;
  shelf?: string;
  collection?: string;
  quantity?: number;
  availableCodes?: string[]; // Códigos disponíveis calculados dinamicamente
}

interface Filters {
  title: string;
  code: string;
  author: string;
}

interface LocationState {
  studentName: string;
}

const BookSelection = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const studentName = state?.studentName || "Aluno";

  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    title: '',
    code: '',
    author: ''
  });
  
  const { currentUser } = useAuth();

  // Função para calcular códigos disponíveis
  const calculateAvailableCodes = async (book: Book): Promise<string[]> => {
    if (!currentUser) return [];
    
    try {
      // Obter todos os códigos do livro
      const allCodes = book.codes && book.codes.length > 0 ? book.codes : (book.code ? [book.code] : []);
      
      if (allCodes.length === 0) return [];
      
      // Buscar empréstimos ativos para este livro
      const loansRef = collection(db, `users/${currentUser.uid}/loans`);
      const activeLoansQuery = query(
        loansRef,
        where('bookId', '==', book.id),
        where('status', '==', 'active')
      );
      
      const activeLoansSnapshot = await getDocs(activeLoansQuery);
      
      // Extrair códigos que estão emprestados
      const borrowedCodes = activeLoansSnapshot.docs
        .map(doc => doc.data().bookCode)
        .filter(code => code); // Remove valores undefined/null
      
      // Retornar códigos que não estão emprestados
      const availableCodes = allCodes.filter(code => !borrowedCodes.includes(code));
      
      return availableCodes;
    } catch (error) {
      console.error('Erro ao calcular códigos disponíveis:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [currentUser]);

  const fetchBooks = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const booksRef = collection(db, `users/${currentUser.uid}/books`);
      const q = query(booksRef);
      const querySnapshot = await getDocs(q);
      
      const fetchedBooks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      
      // Calcular códigos disponíveis para cada livro
      const booksWithAvailability = await Promise.all(
        fetchedBooks.map(async (book) => {
          const availableCodes = await calculateAvailableCodes(book);
          return {
            ...book,
            availableCodes,
            quantity: availableCodes.length // Atualizar quantidade baseada nos códigos disponíveis
          };
        })
      );
      
      // Filtrar apenas livros que têm pelo menos um código disponível
      const availableBooks = booksWithAvailability.filter(book => 
        book.availableCodes && book.availableCodes.length > 0
      );
      
      setBooks(availableBooks);
      setFilteredBooks(availableBooks);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
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

  const applyFilters = () => {
    const titleFilter = filters.title.toLowerCase().trim();
    const codeFilter = filters.code.toLowerCase().trim();
    const authorFilter = filters.author.toLowerCase().trim();
    
    if (!titleFilter && !codeFilter && !authorFilter) {
      setFiltersApplied(false);
      setFilteredBooks(books);
      return;
    }
    
    const filtered = books.filter(book => {
      const matchesTitle = !titleFilter || (book.title && book.title.toLowerCase().includes(titleFilter));
              const matchesCode = !codeFilter || getAllCodes(book).some(code => 
          code.toLowerCase().includes(codeFilter)
        );
      const matchesAuthor = !authorFilter || (book.authors && book.authors.some(author => 
        author.toLowerCase().includes(authorFilter)
      ));
      return matchesTitle && matchesCode && matchesAuthor;
    });
    
    setFilteredBooks(filtered);
    setFiltersApplied(true);
  };

  const clearFilters = () => {
    setFilters({ title: '', code: '', author: '' });
    setFiltersApplied(false);
    setFilteredBooks(books);
  };

  const handleSelectBook = (bookId: string, bookTitle: string) => {
    // Encontrar o livro selecionado para verificar quantos códigos disponíveis tem
    const selectedBook = books.find(book => book.id === bookId);
    
    if (!selectedBook || !selectedBook.availableCodes) {
      console.error('Livro não encontrado ou sem códigos disponíveis');
      return;
    }
    
    // Se tem apenas 1 código disponível, ir direto para confirmação
    if (selectedBook.availableCodes.length === 1) {
      navigate(`/withdrawal-confirmation/${studentId}/${bookId}`, { 
        state: { 
          studentName, 
          bookTitle,
          selectedCode: selectedBook.availableCodes[0] // Selecionar automaticamente o único código
        } 
      });
    } else {
      // Se tem mais de 1 código, ir para seleção de código
      navigate(`/code-selection/${studentId}/${bookId}`, { 
        state: { 
          studentName, 
          bookTitle
        } 
      });
    }
  };

  const currentBooks = filtersApplied ? filteredBooks : books;

  const getDisplayCode = (book: Book): string => {
    if (book.codes && book.codes.length > 0) {
      return book.codes.length > 1 ? 'diversos' : book.codes[0];
    }
    return book.code || '-';
  };

  const getAllCodes = (book: Book): string[] => {
    if (book.codes && book.codes.length > 0) {
      return book.codes;
    }
    return book.code ? [book.code] : [];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Retirada de livro para <span className={styles.highlightName}>{studentName}</span></h2>
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
                Mostrar Filtros
              </>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filters}>
          <form onSubmit={handleSubmit} className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label htmlFor="title">Título</label>
              <input
                type="text"
                id="title"
                value={filters.title}
                onChange={(e) => handleFilterChange('title', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Filtrar por título..."
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="code">Código</label>
              <input
                type="text"
                id="code"
                value={filters.code}
                onChange={(e) => handleFilterChange('code', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Filtrar por código..."
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="author">Autor</label>
              <input
                type="text"
                id="author"
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Filtrar por autor..."
              />
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
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.emptyIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <h3>Nenhum livro registrado</h3>
            <p>Nenhum livro foi cadastrado no sistema.</p>
          </div>
        ) : (
          <div className={styles.bookListContainer}>
            {filtersApplied && filteredBooks.length === 0 ? (
              <div className={styles.noResults}>
                <p>Nenhum livro encontrado com os filtros aplicados.</p>
                <button
                  className={styles.clearFiltersButton}
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className={styles.bookList}>
                {currentBooks.map(book => (
                  <div key={book.id} className={styles.bookItem}>
                    <div className={styles.bookInfo}>
                      <h3 className={styles.bookTitle}>{book.title}</h3>
                                              <p className={styles.bookCode}>Código: {getDisplayCode(book)}</p>
                      {book.authors && book.authors.length > 0 && (
                        <p className={styles.bookAuthors}>Autores: {book.authors.join(', ')}</p>
                      )}
                      {book.publisher && (
                        <p className={styles.bookPublisher}>Editora: {book.publisher}</p>
                      )}
                      {book.shelf && (
                        <p className={styles.bookShelf}>Estante: {book.shelf}</p>
                      )}
                      {book.collection && (
                        <p className={styles.bookCollection}>Coleção: {book.collection}</p>
                      )}
                      {book.quantity !== undefined && (
                        <p className={styles.bookQuantity}>Quantidade disponível: {book.quantity}</p>
                      )}
                      {book.genres && book.genres.length > 0 && (
                        <div className={styles.bookGenres}>
                          {book.genres.map((genre, index) => (
                            <span key={index} className={styles.genreTag}>{genre}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={styles.bookActions}>
                      <button 
                        className={styles.selectButton}
                        onClick={() => handleSelectBook(book.id, book.title)}
                        disabled={book.quantity === 0}
                      >
                        <HandRaisedIcon className={styles.buttonIcon} />
                        Escolher
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSelection; 