import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, BookOpen, Calendar, Check, X, Loader } from 'lucide-react';
import BottomNavigation from '../../components/student/BottomNavigation';
import { reservationService } from '../../services/reservationService';
import { studentService } from '../../services/studentService';
import styles from './ReserveBook.module.css';

interface BookData {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  available: boolean;
  availableCopies: number;
  userId: string;
}

const ReserveBook: React.FC = () => {
  const navigate = useNavigate();
  const { studentId, bookId } = useParams<{ studentId: string; bookId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [book, setBook] = useState<BookData | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [studentId, bookId]);

  const loadData = async () => {
    if (!studentId || !bookId) return;

    try {
      setLoading(true);
      
      // Buscar dados do aluno
      const studentData = await studentService.findStudentById(studentId);
      if (!studentData) {
        setError('Aluno não encontrado');
        return;
      }
      setStudent(studentData);

      // Buscar dados do livro
      const bookData = await studentService.getBookById(bookId, studentData.userId);
      if (!bookData) {
        setError('Livro não encontrado');
        return;
      }
      setBook({
        id: bookData.id,
        title: bookData.title,
        author: bookData.author,
        coverUrl: bookData.coverUrl,
        available: bookData.available,
        availableCopies: bookData.availableCopies,
        userId: studentData.userId
      });

      // Mostrar confirmação automaticamente
      setShowConfirmation(true);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (!book || !student) return;

    try {
      setCreating(true);
      setError('');

      await reservationService.createReservation(
        student.userId,
        studentId!,
        student.name,
        bookId!,
        book.title,
        book.author,
        book.coverUrl,
        book.availableCopies > 0
      );

      setSuccess(true);
      setShowConfirmation(false);

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate(`/student-dashboard/${studentId}/home`);
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao criar reserva:', error);
      setError(error.message || 'Erro ao criar reserva. Tente novamente.');
      setCreating(false);
    }
  };

  const handleCancelReservation = () => {
    navigate(`/student-dashboard/${studentId}/book/${bookId}`);
  };

  const handleBack = () => {
    navigate(`/student-dashboard/${studentId}/book/${bookId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <button onClick={handleBack} className={styles.backButton}>
              <ArrowLeft size={24} />
            </button>
            <h1>Carregando...</h1>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <Loader size={48} className={styles.spinner} />
            <p>Carregando informações...</p>
          </div>
        </main>
        <BottomNavigation studentId={studentId || ''} activePage="home" />
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <button onClick={handleBack} className={styles.backButton}>
              <ArrowLeft size={24} />
            </button>
            <h1>Erro</h1>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.errorContainer}>
            <X size={64} className={styles.errorIcon} />
            <h2>Erro ao carregar</h2>
            <p>{error}</p>
            <button onClick={handleBack} className={styles.backButton}>
              Voltar
            </button>
          </div>
        </main>
        <BottomNavigation studentId={studentId || ''} activePage="home" />
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Reserva Confirmada!</h1>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <Check size={64} />
            </div>
            <h2>Reserva realizada com sucesso!</h2>
            <p className={styles.successMessage}>
              {book?.availableCopies && book.availableCopies > 0 ? (
                <>
                  ✅ Seu livro está pronto para retirada!<br/>
                  Você tem 7 dias para pegá-lo na biblioteca.
                </>
              ) : (
                <>
                  📋 Você entrou na fila de espera!<br/>
                  Quando o livro for devolvido, você será notificado.
                </>
              )}
            </p>
            <p className={styles.redirectMessage}>
              Redirecionando para o início...
            </p>
          </div>
        </main>
        <BottomNavigation studentId={studentId || ''} activePage="home" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={handleBack} className={styles.backButton}>
            <ArrowLeft size={24} />
          </button>
          <h1>Reservar Livro</h1>
        </div>
      </header>

      <main className={styles.main}>
        {showConfirmation && book && (
          <div className={styles.confirmationContainer}>
            {/* Book Preview */}
            <div className={styles.bookPreview}>
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className={styles.bookCover} />
              ) : (
                <div className={styles.coverPlaceholder}>
                  <BookOpen size={48} />
                </div>
              )}
              <div className={styles.bookInfo}>
                <h2>{book.title}</h2>
                <p>{book.author || 'Autor não informado'}</p>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className={styles.confirmationMessage}>
              <div className={styles.iconContainer}>
                {book.availableCopies > 0 ? (
                  <Heart size={48} className={styles.heartIcon} />
                ) : (
                  <Calendar size={48} className={styles.calendarIcon} />
                )}
              </div>
              
              <h3>
                {book.availableCopies > 0 
                  ? 'Reservar este livro?' 
                  : 'Entrar na fila de espera?'
                }
              </h3>
              
              <p className={styles.description}>
                {book.availableCopies > 0 ? (
                  <>
                    ✅ <strong>Este livro está disponível!</strong><br/>
                    Você poderá pegá-lo na biblioteca quando quiser.<br/>
                    <em>Prazo: 7 dias para retirada</em>
                  </>
                ) : (
                  <>
                    📋 <strong>Este livro está emprestado.</strong><br/>
                    Você entrará na fila de espera e será notificado quando for devolvido.<br/>
                    <em>Você receberá uma notificação via WhatsApp</em>
                  </>
                )}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                <X size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.buttonGroup}>
              <button 
                onClick={handleCancelReservation}
                className={styles.cancelButton}
                disabled={creating}
              >
                <X size={20} />
                Não, voltar
              </button>
              <button 
                onClick={handleConfirmReservation}
                className={styles.confirmButton}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader size={20} className={styles.spinner} />
                    Reservando...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Sim, reservar
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation studentId={studentId || ''} activePage="home" />
    </div>
  );
};

export default ReserveBook;
