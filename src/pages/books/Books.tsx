import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { PlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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
        setFilteredBooks(fetchedBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentUser]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBooks(books);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filtered = books.filter(book => {
      const matchesCode = book.code.toLowerCase().includes(searchTermLower);
      const matchesTitle = book.title.toLowerCase().includes(searchTermLower);
      const matchesAuthors = book.authors?.some(author => 
        author.toLowerCase().includes(searchTermLower)
      );
      const matchesGenres = book.genres?.some(genre => 
        genre.toLowerCase().includes(searchTermLower)
      );

      return matchesCode || matchesTitle || matchesAuthors || matchesGenres;
    });

    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const handleSelectBook = (bookId: string) => {
    setSelectedBooks(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId);
      } else {
        return [...prev, bookId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === filteredBooks.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(filteredBooks.map(book => book.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!currentUser || selectedBooks.length === 0) return;
    
    if (!window.confirm(`Tem certeza que deseja deletar ${selectedBooks.length} livro(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      
      for (const bookId of selectedBooks) {
        const bookRef = doc(db, `users/${currentUser.uid}/books/${bookId}`);
        await deleteDoc(bookRef);
      }

      // Atualiza a lista de livros removendo os deletados
      setBooks(prev => prev.filter(book => !selectedBooks.includes(book.id)));
      setSelectedBooks([]);
    } catch (error) {
      console.error('Error deleting books:', error);
      alert('Erro ao deletar livros. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Acervo da Biblioteca</h2>
        <div className={styles.headerButtons}>
          <button 
            className={styles.registerButton}
            onClick={() => navigate('/books/register')}
          >
            <PlusIcon className={styles.buttonIcon} />
            Registrar Livro
          </button>
        </div>
      </div>

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
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <MagnifyingGlassIcon className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Pesquisar por título, código, autor ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            <div className={styles.selectAllContainer}>
              <div className={styles.selectAllWrapper}>
                <div className={styles.selectionControls}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedBooks.length === filteredBooks.length && filteredBooks.length > 0}
                      onChange={handleSelectAll}
                    />
                    <span>Selecionar Todos</span>
                  </label>
                  {selectedBooks.length > 0 && (
                    <button 
                      className={styles.deleteSelectedButton}
                      onClick={handleDeleteSelected}
                    >
                      <TrashIcon className={styles.buttonIcon} />
                      Excluir Selecionados ({selectedBooks.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {filteredBooks.length === 0 ? (
              <div className={styles.noResults}>
                Nenhum livro encontrado para "{searchTerm}"
              </div>
            ) : (
              <div className={styles.booksGrid}>
                {filteredBooks.map(book => (
                  <div key={book.id} className={styles.bookCardWrapper}>
                    <div className={styles.checkboxContainer}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={selectedBooks.includes(book.id)}
                          onChange={() => handleSelectBook(book.id)}
                        />
                      </label>
                    </div>
                    <Link
                      to={`/books/${book.id}`}
                      className={styles.bookCard}
                    >
                      <h3>{book.title}</h3>
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
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Books; 