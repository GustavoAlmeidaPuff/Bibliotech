import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './RegisterBook.module.css';

interface BookForm {
  code: string;
  title: string;
  genres: string[];
  authors: string[];
  publisher: string;
  acquisitionDate: string;
  shelf: string;
  collection: string;
  quantity: number;
}

const RegisterBook = () => {
  const [formData, setFormData] = useState<BookForm>({
    code: '',
    title: '',
    genres: [],
    authors: [],
    publisher: '',
    acquisitionDate: '',
    shelf: '',
    collection: '',
    quantity: 1
  });
  
  const [currentGenre, setCurrentGenre] = useState('');
  const [currentAuthor, setCurrentAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.title) {
      setError('Código e título são campos obrigatórios');
      return;
    }

    if (!currentUser) {
      setError('Você precisa estar logado para registrar livros');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepara os dados do livro
      const bookData = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser.uid, // Adiciona referência ao usuário
        status: 'available', // Status inicial do livro
      };

      // Referência à coleção de livros do usuário
      const booksRef = collection(db, `users/${currentUser.uid}/books`);
      
      // Adiciona o documento
      await addDoc(booksRef, bookData);
      
      // Redireciona para a lista de livros
      navigate('/books');
    } catch (err) {
      console.error('Error adding book:', err);
      if (err instanceof Error) {
        setError(`Erro ao registrar livro: ${err.message}`);
      } else {
        setError('Erro ao registrar livro. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenreKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentGenre.trim()) {
      e.preventDefault();
      if (!formData.genres.includes(currentGenre.trim())) {
        setFormData(prev => ({
          ...prev,
          genres: [...prev.genres, currentGenre.trim()]
        }));
      }
      setCurrentGenre('');
    }
  };

  const handleAuthorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentAuthor.trim()) {
      e.preventDefault();
      if (!formData.authors.includes(currentAuthor.trim())) {
        setFormData(prev => ({
          ...prev,
          authors: [...prev.authors, currentAuthor.trim()]
        }));
      }
      setCurrentAuthor('');
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Registrar Novo Livro</h2>
        <button 
          className={styles.cancelButton}
          onClick={() => navigate('/books')}
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.formGroup}>
          <label htmlFor="code">Código *</label>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title">Título *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="genres">Gêneros/Classes (pressione Enter para adicionar)</label>
          <input
            type="text"
            id="genres"
            value={currentGenre}
            onChange={e => setCurrentGenre(e.target.value)}
            onKeyDown={handleGenreKeyDown}
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
          <label htmlFor="authors">Autores (pressione Enter para adicionar)</label>
          <input
            type="text"
            id="authors"
            value={currentAuthor}
            onChange={e => setCurrentAuthor(e.target.value)}
            onKeyDown={handleAuthorKeyDown}
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
          <label htmlFor="publisher">Editora</label>
          <input
            type="text"
            id="publisher"
            value={formData.publisher}
            onChange={e => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
          />
        </div>

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

        <div className={styles.formGroup}>
          <label htmlFor="collection">Coleção</label>
          <input
            type="text"
            id="collection"
            value={formData.collection}
            onChange={e => setFormData(prev => ({ ...prev, collection: e.target.value }))}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="quantity">Quantidade</label>
          <input
            type="number"
            id="quantity"
            min="1"
            value={formData.quantity}
            onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar Livro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterBook; 