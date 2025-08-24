import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './StudentDashboard.module.css';

// Registrando os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Loan {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'active' | 'returned';
  genres?: string[];
  createdAt: Date;
  completed: boolean;
  readPercentage?: number; // Percentual lido do livro
}

interface Book {
  id: string;
  title: string;
  genres?: string[];
  authors?: string[];
  description?: string;
}

const StudentDashboard = () => {
  const { studentUser, logout } = useStudentAuth();
  const navigate = useNavigate();
  
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dados processados para gráficos
  const [genresData, setGenresData] = useState<{labels: string[], data: number[]}>({ labels: [], data: [] });
  const [monthlyLoansData, setMonthlyLoansData] = useState<{
    labels: string[], 
    borrowed: number[],
    completed: number[]
  }>({ 
    labels: [], 
    borrowed: [],
    completed: [] 
  });
  
  // Métricas calculadas
  const [totalBooksRead, setTotalBooksRead] = useState(0);
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [readingSpeed, setReadingSpeed] = useState(0);
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);

  useEffect(() => {
    if (!studentUser) {
      navigate('/student-login');
      return;
    }
    
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Buscar todos os empréstimos do estudante
        const loansRef = collection(db, `users/${studentUser.userId}/loans`);
        const q = query(
          loansRef,
          where('studentId', '==', studentUser.id)
        );
        
        const loansSnap = await getDocs(q);
        
        // Se não há empréstimos, parar por aqui
        if (loansSnap.empty) {
          setLoading(false);
          return;
        }
        
        // Processar todos os empréstimos
        const loansData = loansSnap.docs.map(doc => {
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
        }) as Loan[];
        
        setLoans(loansData);
        
        // Separar empréstimos ativos
        const active = loansData.filter(loan => loan.status === 'active');
        setActiveLoans(active);
        
        // Buscar detalhes dos livros emprestados para obter gêneros
        const bookIds = Array.from(new Set(loansData.map(loan => loan.bookId)));
        const booksData: Book[] = [];
        
        for (const bookId of bookIds) {
          const bookRef = doc(db, `users/${studentUser.userId}/books/${bookId}`);
          const bookSnap = await getDoc(bookRef);
          
          if (bookSnap.exists()) {
            booksData.push({
              id: bookSnap.id,
              ...bookSnap.data()
            } as Book);
          }
        }
        
        setBooks(booksData);
        
        // Processar dados para visualizações
        processData(loansData, booksData);
      } catch (error) {
        console.error('Erro ao buscar dados do estudante:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [studentUser, navigate]);
  
  const processData = (loansData: Loan[], booksData: Book[]) => {
    if (loansData.length === 0) return;
    
    // Total de livros lidos (consideramos apenas os devolvidos)
    const completedLoans = loansData.filter(loan => loan.status === 'returned');
    setTotalBooksRead(completedLoans.length);
    
    // Calcular gêneros mais lidos
    const genreCounts: {[key: string]: number} = {};
    
    loansData.forEach(loan => {
      const book = booksData.find(b => b.id === loan.bookId);
      
      if (book?.genres) {
        book.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });
    
    // Ordenar gêneros por popularidade
    const sortedGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 gêneros
    
    if (sortedGenres.length > 0) {
      setFavoriteGenre(sortedGenres[0][0]);
      
      setGenresData({
        labels: sortedGenres.map(([genre]) => genre),
        data: sortedGenres.map(([, count]) => count)
      });
    }
    
    // Empréstimos por mês (últimos 6 meses)
    const lastSixMonths = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i);
      return {
        label: format(date, 'MMM/yyyy', { locale: ptBR }),
        startDate: startOfMonth(date),
        endDate: endOfMonth(date)
      };
    }).reverse();
    
    const monthlyLoans = lastSixMonths.map(month => {
      // Todos os empréstimos realizados no mês
      const borrowedCount = loansData.filter(loan => 
        isWithinInterval(loan.borrowDate, {
          start: month.startDate,
          end: month.endDate
        })
      ).length;
      
      // Livros lidos/completados no mês
      const completedCount = completedLoans.filter(loan => 
        loan.returnDate && isWithinInterval(loan.returnDate, {
          start: month.startDate,
          end: month.endDate
        })
      ).length;
      
      return {
        month: month.label,
        borrowed: borrowedCount,
        completed: completedCount
      };
    });
    
    setMonthlyLoansData({
      labels: monthlyLoans.map(m => m.month),
      borrowed: monthlyLoans.map(m => m.borrowed),
      completed: monthlyLoans.map(m => m.completed)
    });
    
    // Calcular velocidade média de leitura (em dias)
    if (completedLoans.length > 0) {
      const readingTimes = completedLoans.map(loan => {
        const borrowDate = loan.borrowDate;
        const returnDate = loan.returnDate || new Date();
        const diffTime = Math.abs(returnDate.getTime() - borrowDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      });
      
      const avgReadingTime = readingTimes.reduce((a, b) => a + b, 0) / readingTimes.length;
      setReadingSpeed(Math.round(avgReadingTime * 10) / 10); // Arredonda para 1 casa decimal
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/student-login');
  };
  
  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.loading}>Carregando seus dados...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          <div className={styles.header}>
            <div className={styles.studentInfo}>
              <h2>Olá, {studentUser?.name}!</h2>
              <p>Turma: {studentUser?.className}</p>
            </div>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Sair
            </button>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total de Livros Lidos</h3>
              <div className={styles.statValue}>{totalBooksRead}</div>
            </div>
            
            {favoriteGenre && (
              <div className={styles.statCard}>
                <h3>Gênero Favorito</h3>
                <div className={styles.statValue}>{favoriteGenre}</div>
              </div>
            )}
            
            {readingSpeed > 0 && (
              <div className={styles.statCard}>
                <h3>Tempo Médio de Leitura</h3>
                <div className={styles.statValue}>{readingSpeed} dias</div>
              </div>
            )}
          </div>

          {loans.length > 0 ? (
            <>
              <div className={styles.chartsContainer}>
                {genresData.labels.length > 0 && (
                  <div className={styles.chart}>
                    <h3>Gêneros Mais Lidos</h3>
                    <Pie 
                      data={{
                        labels: genresData.labels,
                        datasets: [
                          {
                            data: genresData.data,
                            backgroundColor: [
                              '#4a6da7', 
                              '#6987b9', 
                              '#87a2cb', 
                              '#a6bcdc', 
                              '#c4d7ed'
                            ],
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }}
                    />
                  </div>
                )}

                {monthlyLoansData.labels.length > 0 && (
                  <div className={styles.chart}>
                    <h3>Histórico de Leitura</h3>
                    <Bar 
                      data={{
                        labels: monthlyLoansData.labels,
                        datasets: [
                          {
                            label: 'Emprestados',
                            data: monthlyLoansData.borrowed,
                            backgroundColor: '#6987b9',
                          },
                          {
                            label: 'Lidos',
                            data: monthlyLoansData.completed,
                            backgroundColor: '#4a6da7',
                          }
                        ]
                      }}
                      options={{
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {activeLoans.length > 0 && (
                <div className={styles.activeLoansSection}>
                  <h3>Livros Emprestados Atualmente</h3>
                  <div className={styles.loansList}>
                    {activeLoans.map(loan => (
                      <div 
                        key={loan.id} 
                        className={styles.loanCard}
                        onClick={() => navigate(`/student-loan-detail/${loan.id}`)}
                        style={{ cursor: 'pointer' }}
                        title="Clique para ver detalhes do empréstimo"
                      >
                        <div className={styles.loanTitle}>{loan.bookTitle}</div>
                        <div className={styles.loanDetails}>
                          <div>Emprestado: {format(loan.borrowDate, 'dd/MM/yyyy')}</div>
                          <div>Devolução: {format(loan.dueDate, 'dd/MM/yyyy')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>Você ainda não tem empréstimos registrados.</p>
              <p>Visite a biblioteca para começar sua jornada de leitura!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentDashboard; 