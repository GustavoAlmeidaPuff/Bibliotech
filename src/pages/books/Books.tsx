import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { PlusIcon, TrashIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTags } from '../../contexts/TagsContext';
import AutocompleteInput from '../../components/AutocompleteInput';
import styles from './Books.module.css';

interface Book {
  id: string;
  code: string;
  title: string;
  genres?: string[];
  authors?: string[];
  publisher?: string;
  acquisitionDate?: string;
  shelf?: string;
  collection?: string;
  quantity?: number;
}

interface Filters {
  title: string;
  code: string;
  author: string;
}

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    title: '',
    code: '',
    author: ''
  });
  
  const { currentUser } = useAuth();
  const { genres } = useTags();
  const navigate = useNavigate();

  const fetchBooks = async () => {
    if (!currentUser) return;
    
    try {
      const booksRef = collection(db, `users/${currentUser.uid}/books`);
      const q = query(booksRef);
      const querySnapshot = await getDocs(q);
      
      const fetchedBooks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      
      setBooks(fetchedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [currentUser]);

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
    let result = [...books];
    const hasActiveFilters = Object.values(filters).some(Boolean);
    
    if (!hasActiveFilters) {
      setFilteredBooks([]);
      setFiltersApplied(false);
      return;
    }

    if (filters.title) {
      result = result.filter(book => 
        book.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    if (filters.code) {
      result = result.filter(book => 
        book.code?.toString().toLowerCase().includes(filters.code.toLowerCase())
      );
    }

    if (filters.author) {
      result = result.filter(book => 
        book.authors?.some(author => 
          author.toLowerCase().includes(filters.author.toLowerCase())
        )
      );
    }

    setFilteredBooks(result);
    setFiltersApplied(true);
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      title: '',
      code: '',
      author: ''
    });
    setFilteredBooks([]);
    setFiltersApplied(false);
  };

  const toggleBookSelection = (bookId: string) => {
    setSelectedBooks(prev => 
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    setSelectedBooks(
      selectedBooks.length === books.length
        ? []
        : books.map(book => book.id)
    );
  };

  const handleDeleteSelected = async () => {
    if (!currentUser || !window.confirm('Tem certeza que deseja excluir os livros selecionados?')) return;

    try {
      setDeleting(true);
      for (const bookId of selectedBooks) {
        const bookRef = doc(db, `users/${currentUser.uid}/books/${bookId}`);
        await deleteDoc(bookRef);
      }
      await fetchBooks();
      setSelectedBooks([]);
    } catch (error) {
      console.error('Error deleting books:', error);
      alert('Erro ao excluir livros. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Acervo da Biblioteca</h2>
        <div className={styles.headerActions}>
          {selectedBooks.length > 0 ? (
            <>
              <button
                className={styles.selectAllButton}
                onClick={handleSelectAll}
              >
                {selectedBooks.length === books.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDeleteSelected}
                disabled={deleting}
              >
                <TrashIcon className={styles.buttonIcon} />
                {deleting ? 'Excluindo...' : 'Excluir Selecionados'}
              </button>
            </>
          ) : (
            <>
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
              <button 
                className={styles.registerButton}
                onClick={() => navigate('/books/register')}
              >
                <PlusIcon className={styles.buttonIcon} />
                Registrar Livro
              </button>
            </>
          )}
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
              className={styles.clearFiltersButton}
              onClick={clearFilters}
              disabled={!Object.values(filters).some(Boolean)}
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
          <div className={styles.empty}>
            <p>Nenhum livro registrado ainda.</p>
            <button 
              className={styles.registerButton}
              onClick={() => navigate('/books/register')}
            >
              Registrar Primeiro Livro
            </button>
          </div>
        ) : (
          <>
            <div className={styles.booksGrid}>
              {(filtersApplied ? filteredBooks : books).map(book => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className={`${styles.bookCard} ${selectedBooks.includes(book.id) ? styles.selected : ''}`}
                >
                  <div className={styles.bookHeader}>
                    <div
                      className={styles.checkbox}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBooks.includes(book.id)}
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleBookSelection(book.id);
                        }}
                      />
                    </div>
                    <h3>{book.title}</h3>
                  </div>
                  <p className={styles.bookCode}>Código: {book.code}</p>
                  {book.authors && (
                    <p className={styles.bookAuthors}>
                      {book.authors.join(', ')}
                    </p>
                  )}
                  {book.genres && (
                    <div className={styles.genreTags}>
                      {book.genres.map(genre => (
                        <span key={genre} className={styles.tag}>
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
            {!loading && filteredBooks.length === 0 && filtersApplied && (
              <div className={styles.noResults}>
                <p>Nenhum livro encontrado com os filtros aplicados.</p>
                <button
                  className={styles.clearFiltersButton}
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Books; 