import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { PlusIcon, TrashIcon, FunnelIcon, XMarkIcon, ListBulletIcon, Squares2X2Icon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import styles from './Books.module.css';

interface Book {
  id: string;
  code?: string;
  codes?: string[];
  title: string;
  genres?: string[];
  authors?: string[];
  publisher?: string;
  acquisitionDate?: string;
  shelf?: string;
  collection?: string;
  quantity?: number;
  createdAt?: number;
}

interface Filters {
  title: string;
  code: string;
  author: string;
}

type SortOption = 'alphabetical' | 'dateAdded';

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<SortOption>('dateAdded');
  const [filters, setFilters] = useState<Filters>({
    title: '',
    code: '',
    author: ''
  });
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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

  const fetchBooks = useCallback(async () => {
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
      
      setBooks(fetchedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const sortBooks = (booksToSort: Book[]) => {
    const booksCopy = [...booksToSort];

    if (sortBy === 'alphabetical') {
      return booksCopy.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Sort by date added (createdAt timestamp) or by ID if createdAt is not available
      return booksCopy.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt - a.createdAt; // newest first
        } else {
          return a.id.localeCompare(b.id); // fallback to id
        }
      });
    }
  };

  const booksToDisplay = () => {
    const booksToSort = filtersApplied ? filteredBooks : books;
    return sortBooks(booksToSort);
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
        getAllCodes(book).some(code => 
          code.toLowerCase().includes(filters.code.toLowerCase())
        )
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
          {selectedBooks.length > 0 && (
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
          )}
          {selectedBooks.length === 0 && (
            <>
              <div className={styles.viewOptions}>
                <button
                  className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Visualização em Lista"
                >
                  <ListBulletIcon className={styles.buttonIcon} />
                </button>
                <button
                  className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Visualização em Grade"
                >
                  <Squares2X2Icon className={styles.buttonIcon} />
                </button>
              </div>
              <div className={styles.sortOptions}>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className={styles.sortSelect}
                >
                  <option value="dateAdded">Ordem de Registro</option>
                  <option value="alphabetical">Ordem Alfabética (A-Z)</option>
                </select>
                <ArrowsUpDownIcon className={styles.sortIcon} />
              </div>
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
            {viewMode === 'grid' ? (
              <div className={styles.booksGrid}>
                {booksToDisplay().map(book => (
                  <div
                    key={book.id}
                    className={`${styles.bookCard} ${selectedBooks.includes(book.id) ? styles.selected : ''}`}
                  >
                    <div className={styles.bookHeader}>
                      <div
                        className={styles.checkbox}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookSelection(book.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBooks.includes(book.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                          }}
                          className='checkboxInput'
                        />
                      </div>
                      <h3>{book.title}</h3>
                    </div>
                    <Link
                      to={`/books/${book.id}`}
                      className={styles.bookLink}
                    >
                      <p className={styles.bookCode}>Código: {getDisplayCode(book)}</p>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.booksList}>
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Título</th>
                      <th>Código</th>
                      <th>Autor</th>
                      <th>Gêneros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booksToDisplay().map(book => (
                      <tr 
                        key={book.id} 
                        className={selectedBooks.includes(book.id) ? styles.selected : ''}
                      >
                        <td>
                          <div
                            className={styles.checkbox}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookSelection(book.id);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedBooks.includes(book.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                              }}
                              className={styles.checkboxInput}
                            />
                          </div>
                        </td>
                        <td onClick={() => navigate(`/books/${book.id}`)} style={{ cursor: 'pointer' }}>{book.title}</td>
                        <td onClick={() => navigate(`/books/${book.id}`)} style={{ cursor: 'pointer' }}>{getDisplayCode(book)}</td>
                        <td onClick={() => navigate(`/books/${book.id}`)} style={{ cursor: 'pointer' }}>{book.authors?.join(', ') || '-'}</td>
                        <td onClick={() => navigate(`/books/${book.id}`)} style={{ cursor: 'pointer' }}>
                          {book.genres?.map(genre => (
                            <span key={genre} className={styles.tag}>
                              {genre}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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