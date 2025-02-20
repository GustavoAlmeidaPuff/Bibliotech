import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { PlusIcon } from '@heroicons/react/24/outline';
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
  const [loading, setLoading] = useState(true);
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
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentUser]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Acervo da Biblioteca</h2>
        <button 
          className={styles.registerButton}
          onClick={() => navigate('/books/register')}
        >
          <PlusIcon className={styles.buttonIcon} />
          Registrar Livro
        </button>
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
          <div className={styles.booksGrid}>
            {books.map(book => (
              <Link
                key={book.id}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books; 