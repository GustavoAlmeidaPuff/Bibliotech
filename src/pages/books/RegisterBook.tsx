import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTags } from '../../contexts/TagsContext';
import { useAuthors } from '../../contexts/AuthorsContext';
import AutocompleteInput from '../../components/AutocompleteInput';
import styles from './RegisterBook.module.css';

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

interface DuplicateCheck {
  codes: boolean;
  title: boolean;
}

interface DuplicateBook {
  codes: string[];
  title: string;
  id: string;
}

// Lista de gêneros/classes sugeridos
const SUGGESTED_GENRES = [
  'Romance',
  'Ficção Científica',
  'Fantasia',
  'Terror',
  'Suspense',
  'Drama',
  'Aventura',
  'História',
  'Biografia',
  'Autoajuda',
  'Educacional',
  'Infantil',
  'Juvenil',
  'Técnico',
  'Científico',
  'Literatura Brasileira',
  'Literatura Estrangeira',
  'Poesia',
  'Quadrinhos',
  'Mangá',
  'Religião',
  'Filosofia',
  'Psicologia',
  'Sociologia',
  'Política',
  'Economia',
  'Direito',
  'Medicina',
  'Engenharia',
  'Informática'
];

const RegisterBook = () => {
  const [formData, setFormData] = useState<BookForm>({
    codes: [],
    title: '',
    genres: [],
    authors: [],
    publisher: '',
    acquisitionDate: new Date().toISOString().split('T')[0], // Data atual como padrão
    shelf: '',
    collection: '',
    quantity: 1
  });
  
  const [currentCode, setCurrentCode] = useState('');
  const [currentGenre, setCurrentGenre] = useState('');
  const [currentAuthor, setCurrentAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState<DuplicateCheck>({ codes: false, title: false });
  const [duplicateBooks, setDuplicateBooks] = useState<DuplicateBook[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  
  const { currentUser } = useAuth();
  const { genres, addGenre, capitalizeTag } = useTags();
  const { authors, addAuthor, capitalizeAuthor } = useAuthors();
  const navigate = useNavigate();

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

  // Função para verificar duplicatas
  const checkDuplicates = useCallback(async (codes: string[], title: string) => {
    if (!currentUser) return;
    
    try {
      setCheckingDuplicates(true);
      const booksRef = collection(db, `users/${currentUser.uid}/books`);
      
      const foundDuplicates: DuplicateBook[] = [];
      
      // Buscar todos os livros para verificar duplicatas case-insensitive
      const allBooksQuery = query(booksRef);
      const allBooksSnapshot = await getDocs(allBooksQuery);
      
      allBooksSnapshot.docs.forEach(doc => {
        const bookData = doc.data();
        const bookCodes = bookData.codes || (bookData.code ? [bookData.code] : []); // Compatibilidade com versão antiga
        const bookTitle = bookData.title || '';
        
        // Verificar códigos duplicados
        const hasDuplicateCode = codes.some(code => 
          bookCodes.some((bookCode: string) => 
            bookCode.toLowerCase() === code.toLowerCase()
          )
        );
        
        if (hasDuplicateCode) {
          foundDuplicates.push({
            id: doc.id,
            codes: bookCodes,
            title: bookTitle
          });
        }
        
        // Verificar título duplicado (case-insensitive)
        if (title.trim() && bookTitle.toLowerCase() === title.trim().toLowerCase()) {
          if (!foundDuplicates.find(dup => dup.id === doc.id)) {
            foundDuplicates.push({
              id: doc.id,
              codes: bookCodes,
              title: bookTitle
            });
          }
        }
      });
      
      setDuplicateBooks(foundDuplicates);
      setDuplicates({
        codes: foundDuplicates.some(book => 
          codes.some(code => 
            book.codes.some((bookCode: string) => 
              bookCode.toLowerCase() === code.toLowerCase()
            )
          )
        ),
        title: foundDuplicates.some(book => book.title.toLowerCase() === title.trim().toLowerCase())
      });
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
    } finally {
      setCheckingDuplicates(false);
    }
  }, [currentUser]);

  // Verificar duplicatas quando códigos ou título mudam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.codes.length > 0 || formData.title.trim()) {
        checkDuplicates(formData.codes, formData.title.trim());
      } else {
        setDuplicates({ codes: false, title: false });
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [formData.codes, formData.title, currentUser, checkDuplicates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codes.length || !formData.title) {
      setError('Pelo menos um código e o título são campos obrigatórios');
      return;
    }

    if (!currentUser) {
      setError('Você precisa estar logado para registrar livros');
      return;
    }

    // Verificar se há duplicatas e pedir confirmação
    if (duplicates.codes || duplicates.title) {
      const duplicateMessages = [];
      if (duplicates.codes) duplicateMessages.push('códigos');
      if (duplicates.title) duplicateMessages.push('título');
      
      let message = `Pode ser que este(s) ${duplicateMessages.join(' e ')} já exista(m) no sistema.\n\n`;
      message += 'Livros encontrados com dados similares:\n\n';
      
      duplicateBooks.forEach((book, index) => {
        message += `${index + 1}. Códigos: ${book.codes.join(', ')} | Título: ${book.title}\n`;
      });
      
      message += '\nDeseja criar mesmo assim?';
      
      if (!window.confirm(message)) {
        return;
      }
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
                    className={duplicates.codes ? styles.inputError : ''}
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
                  {checkingDuplicates && <div className={styles.checkingIndicator}>Verificando...</div>}
                </div>
                {duplicates.codes && !checkingDuplicates && (
                  <div className={styles.duplicateWarning}>
                    ⚠️ Algum destes códigos já existe no sistema
                  </div>
                )}
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
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={duplicates.title ? styles.inputError : ''}
                  required
                />
                {checkingDuplicates && <div className={styles.checkingIndicator}>Verificando...</div>}
                {duplicates.title && !checkingDuplicates && (
                  <div className={styles.duplicateWarning}>
                    ⚠️ Este título já existe no sistema
                  </div>
                )}
              </div>
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
            {loading ? 'Registrando...' : 'Registrar Livro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterBook; 