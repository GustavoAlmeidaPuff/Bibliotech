import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTags } from '../../contexts/TagsContext';
import { useAuthors } from '../../contexts/AuthorsContext';
import AutocompleteInput from '../../components/AutocompleteInput';
import styles from './RegisterBook.module.css'; // Reusando os estilos do RegisterBook

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

const EditBook = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [formData, setFormData] = useState<BookForm>({
    code: '',
    title: '',
    genres: [],
    authors: [],
    publisher: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    shelf: '',
    collection: '',
    quantity: 1
  });
  
  const [currentGenre, setCurrentGenre] = useState('');
  const [currentAuthor, setCurrentAuthor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  const { genres, addGenre, capitalizeTag } = useTags();
  const { authors, addAuthor, capitalizeAuthor } = useAuthors();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      if (!currentUser || !bookId) return;

      try {
        const bookRef = doc(db, `users/${currentUser.uid}/books/${bookId}`);
        const bookSnap = await getDoc(bookRef);

        if (bookSnap.exists()) {
          const bookData = bookSnap.data() as BookForm;
          setFormData(bookData);
          
          // Adiciona os gêneros e autores às listas de sugestões
          bookData.genres.forEach(addGenre);
          bookData.authors.forEach(addAuthor);
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
    
    if (!formData.code || !formData.title) {
      setError('Código e título são campos obrigatórios');
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
                <label htmlFor="publisher">Editora</label>
                <input
                  type="text"
                  id="publisher"
                  value={formData.publisher}
                  onChange={e => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
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
              <label htmlFor="quantity">Quantidade</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={formData.quantity}
                onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
            </div>
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
    </div>
  );
};

export default EditBook; 