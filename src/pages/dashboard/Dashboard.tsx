import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
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
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './Dashboard.module.css';

// Registrando os componentes do Chart.js
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

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
}

interface Student {
  id: string;
  name: string;
  classroom: string;
}

interface Loan {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  status: 'active' | 'returned';
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  createdAt: Date;
  completed?: boolean;
  readingProgress?: number;
}

interface Book {
  id: string;
  title: string;
  authors?: string[];
  genres?: string[];
  code: string;
}

interface TopStudent {
  id: string;
  name: string;
  classroom: string;
  booksRead: number;
}

interface GenreData {
  genre: string;
  count: number;
}

interface TopBook {
  id: string;
  title: string;
  borrowCount: number;
}

interface ClassroomPerformance {
  classroom: string;
  booksRead: number;
  averageCompletion: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => (
  <div className={styles.statCard}>
    <h3>{title}</h3>
    <div className={styles.value}>{value}</div>
    <p>{description}</p>
  </div>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Estados para estatísticas principais
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [overdueLoansCount, setOverdueLoansCount] = useState(0);
  const [totalBooksCount, setTotalBooksCount] = useState(0);
  const [activeReadersCount, setActiveReadersCount] = useState(0);
  
  // Estados para gráficos e insights
  const [genreData, setGenreData] = useState<GenreData[]>([]);
  const [topBooks, setTopBooks] = useState<TopBook[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [classroomPerformance, setClassroomPerformance] = useState<ClassroomPerformance[]>([]);
  const [monthlyLoanData, setMonthlyLoanData] = useState<{labels: string[], borrowed: number[], returned: number[]}>({
    labels: [],
    borrowed: [],
    returned: []
  });
  const [completionRateData, setCompletionRateData] = useState<{labels: string[], rates: number[]}>({
    labels: [],
    rates: []
  });

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // 1. Buscar todos os livros
      const booksRef = collection(db, `users/${currentUser.uid}/books`);
      const booksSnapshot = await getDocs(booksRef);
      const books = booksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      
      setTotalBooksCount(books.length);
      
      // 2. Buscar todos os empréstimos
      const loansRef = collection(db, `users/${currentUser.uid}/loans`);
      const loansSnapshot = await getDocs(loansRef);
      const loans = loansSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Converter timestamps para Date
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
      
      // 3. Buscar todos os alunos
      const studentsRef = collection(db, `users/${currentUser.uid}/students`);
      const studentsSnapshot = await getDocs(studentsRef);
      const students = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      // 4. Calcular estatísticas principais
      processMainStats(loans, students);
      
      // 5. Processar dados para os gráficos
      processGenreData(loans, books);
      processTopBooks(loans);
      processTopStudents(loans, students);
      processClassroomPerformance(loans, students);
      processMonthlyLoanData(loans);
      processCompletionRateData(loans);
      
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMainStats = (loans: Loan[], students: Student[]) => {
    // Contagem de empréstimos ativos
    const activeLoans = loans.filter(loan => loan.status === 'active');
    setActiveLoansCount(activeLoans.length);
    
    // Contagem de empréstimos atrasados
    const now = new Date();
    const overdueLoans = activeLoans.filter(loan => loan.dueDate < now);
    setOverdueLoansCount(overdueLoans.length);
    
    // Contagem de leitores ativos (alunos com empréstimos ativos ou que leram no último trimestre)
    const threeMonthsAgo = subMonths(new Date(), 3);
    
    // Conjunto de IDs únicos de alunos que têm empréstimos ativos ou recentes
    const activeReaderIds = new Set(
      loans.filter(loan => 
        loan.status === 'active' || 
        (loan.returnDate && loan.returnDate >= threeMonthsAgo)
      ).map(loan => loan.studentId)
    );
    
    setActiveReadersCount(activeReaderIds.size);
  };

  const processGenreData = (loans: Loan[], books: Book[]) => {
    // Mapear empréstimos para gêneros
    const genreCounts: Record<string, number> = {};
    
    loans.forEach(loan => {
      const book = books.find(b => b.id === loan.bookId);
      
      if (book?.genres && book.genres.length > 0) {
        book.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });
    
    // Converter para array e ordenar
    const genreArray = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Pegar os 8 principais
    
    setGenreData(genreArray);
  };

  const processTopBooks = (loans: Loan[]) => {
    // Contar empréstimos por livro
    const bookBorrowCounts: Record<string, { id: string, title: string, count: number }> = {};
    
    loans.forEach(loan => {
      if (!bookBorrowCounts[loan.bookId]) {
        bookBorrowCounts[loan.bookId] = {
          id: loan.bookId,
          title: loan.bookTitle,
          count: 0
        };
      }
      
      bookBorrowCounts[loan.bookId].count++;
    });
    
    // Converter para array e ordenar
    const topBooksArray = Object.values(bookBorrowCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 livros
      .map(item => ({
        id: item.id,
        title: item.title,
        borrowCount: item.count
      }));
    
    setTopBooks(topBooksArray);
  };

  const processTopStudents = (loans: Loan[], students: Student[]) => {
    // Contar livros lidos por aluno
    const studentReadCounts: Record<string, { id: string, name: string, classroom: string, count: number }> = {};
    
    // Inicializar todos os alunos com contagem 0
    students.forEach(student => {
      studentReadCounts[student.id] = {
        id: student.id,
        name: student.name,
        classroom: student.classroom || 'N/A',
        count: 0
      };
    });
    
    // Contar apenas livros marcados como concluídos
    loans.forEach(loan => {
      if (loan.status === 'returned' && loan.completed) {
        if (studentReadCounts[loan.studentId]) {
          studentReadCounts[loan.studentId].count++;
        }
      }
    });
    
    // Converter para array e ordenar
    const topStudentsArray = Object.values(studentReadCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 alunos
      .map(item => ({
        id: item.id,
        name: item.name,
        classroom: item.classroom,
        booksRead: item.count
      }));
    
    setTopStudents(topStudentsArray);
  };

  const processClassroomPerformance = (loans: Loan[], students: Student[]) => {
    // Agrupar alunos por turma
    const classroomStudents: Record<string, string[]> = {};
    
    students.forEach(student => {
      const classroom = student.classroom || 'Sem Turma';
      if (!classroomStudents[classroom]) {
        classroomStudents[classroom] = [];
      }
      classroomStudents[classroom].push(student.id);
    });
    
    // Calcular desempenho por turma
    const classroomStats: Record<string, { totalRead: number, totalStudents: number, completionSum: number, completionCount: number }> = {};
    
    // Inicializar estatísticas
    Object.keys(classroomStudents).forEach(classroom => {
      classroomStats[classroom] = {
        totalRead: 0,
        totalStudents: classroomStudents[classroom].length,
        completionSum: 0,
        completionCount: 0
      };
    });
    
    // Processar empréstimos
    loans.forEach(loan => {
      const student = students.find(s => s.id === loan.studentId);
      if (student) {
        const classroom = student.classroom || 'Sem Turma';
        
        // Contar livros lidos
        if (loan.status === 'returned' && loan.completed) {
          classroomStats[classroom].totalRead++;
        }
        
        // Somar taxas de progresso
        if (loan.status === 'returned' && typeof loan.readingProgress === 'number') {
          classroomStats[classroom].completionSum += loan.readingProgress;
          classroomStats[classroom].completionCount++;
        }
      }
    });
    
    // Calcular médias e formatar dados
    const performanceData = Object.entries(classroomStats)
      .map(([classroom, stats]) => ({
        classroom,
        booksRead: stats.totalRead,
        averageCompletion: stats.completionCount > 0 
          ? Math.round(stats.completionSum / stats.completionCount) 
          : 0
      }))
      .sort((a, b) => b.booksRead - a.booksRead);
    
    setClassroomPerformance(performanceData);
  };

  const processMonthlyLoanData = (loans: Loan[]) => {
    // Gerar dados para os últimos 6 meses
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i);
      return {
        label: format(date, 'MMM/yy', { locale: ptBR }),
        startDate: startOfMonth(date),
        endDate: endOfMonth(date)
      };
    }).reverse();
    
    const monthlyData = last6Months.map(month => {
      // Empréstimos iniciados no mês
      const borrowed = loans.filter(loan => 
        loan.borrowDate >= month.startDate && 
        loan.borrowDate <= month.endDate
      ).length;
      
      // Livros devolvidos no mês
      const returned = loans.filter(loan => 
        loan.status === 'returned' && 
        loan.returnDate && 
        loan.returnDate >= month.startDate && 
        loan.returnDate <= month.endDate
      ).length;
      
      return {
        label: month.label,
        borrowed,
        returned
      };
    });
    
    setMonthlyLoanData({
      labels: monthlyData.map(d => d.label),
      borrowed: monthlyData.map(d => d.borrowed),
      returned: monthlyData.map(d => d.returned)
    });
  };

  const processCompletionRateData = (loans: Loan[]) => {
    // Agrupar por mês e calcular taxa de conclusão
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i);
      return {
        label: format(date, 'MMM/yy', { locale: ptBR }),
        startDate: startOfMonth(date),
        endDate: endOfMonth(date)
      };
    }).reverse();
    
    const completionData = last6Months.map(month => {
      // Empréstimos devolvidos neste mês
      const returnedLoans = loans.filter(loan => 
        loan.status === 'returned' && 
        loan.returnDate && 
        loan.returnDate >= month.startDate && 
        loan.returnDate <= month.endDate
      );
      
      // Calcular taxa média de conclusão
      let completionRate = 0;
      if (returnedLoans.length > 0) {
        const completedCount = returnedLoans.filter(loan => loan.completed).length;
        completionRate = Math.round((completedCount / returnedLoans.length) * 100);
      }
      
      return {
        label: month.label,
        rate: completionRate
      };
    });
    
    setCompletionRateData({
      labels: completionData.map(d => d.label),
      rates: completionData.map(d => d.rate)
    });
  };

  // Dados para os cards principais
  const stats = [
    {
      title: 'Livros Emprestados',
      value: activeLoansCount,
      description: 'Total de livros atualmente emprestados'
    },
    {
      title: 'Devoluções Pendentes',
      value: overdueLoansCount,
      description: 'Livros com devolução atrasada'
    },
    {
      title: 'Livros no Acervo',
      value: totalBooksCount,
      description: 'Total de livros disponíveis'
    },
    {
      title: 'Leitores Ativos',
      value: activeReadersCount,
      description: 'Alunos com leituras no trimestre'
    }
  ];

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <h2>Dashboard</h2>
        <div className={styles.loading}>Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h2>Dashboard</h2>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      
      <div className={styles.charts}>
        {/* Gráfico de Empréstimos por Categoria */}
        <div className={styles.chartCard}>
          <h3>Empréstimos por Categoria</h3>
          {genreData.length > 0 ? (
            <div className={styles.chartContainer}>
              <Pie
                data={{
                  labels: genreData.map(item => item.genre),
                  datasets: [
                    {
                      data: genreData.map(item => item.count),
                      backgroundColor: [
                        '#4a90e2',
                        '#50c878',
                        '#f78fb3',
                        '#f5cd79',
                        '#778beb',
                        '#e77f67',
                        '#cf6a87',
                        '#786fa6'
                      ],
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 15,
                        font: {
                          size: 11
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className={styles.chartPlaceholder}>
              Nenhum dado disponível
            </div>
          )}
        </div>
        
        {/* Lista de Livros Mais Populares */}
        <div className={styles.chartCard}>
          <h3>Livros Mais Populares</h3>
          {topBooks.length > 0 ? (
            <div className={styles.popularBooksContainer}>
              <table className={styles.topItemsTable}>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Empréstimos</th>
                  </tr>
                </thead>
                <tbody>
                  {topBooks.map((book, index) => (
                    <tr key={book.id} className={index === 0 ? styles.topRanked : ''}>
                      <td>{book.title}</td>
                      <td>{book.borrowCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.chartPlaceholder}>
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>
      
      <h2 className={styles.sectionTitle}>Métricas de Desempenho</h2>
      
      <div className={styles.charts}>
        {/* Gráfico de Evolução Mensal */}
        <div className={styles.chartCard}>
          <h3>Evolução Mensal</h3>
          {monthlyLoanData.labels.length > 0 ? (
            <div className={styles.chartContainer}>
              <Line
                data={{
                  labels: monthlyLoanData.labels,
                  datasets: [
                    {
                      label: 'Empréstimos',
                      data: monthlyLoanData.borrowed,
                      borderColor: '#4a90e2',
                      backgroundColor: 'rgba(74, 144, 226, 0.5)',
                      tension: 0.3
                    },
                    {
                      label: 'Devoluções',
                      data: monthlyLoanData.returned,
                      borderColor: '#50c878',
                      backgroundColor: 'rgba(80, 200, 120, 0.5)',
                      tension: 0.3
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top'
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
          ) : (
            <div className={styles.chartPlaceholder}>
              Nenhum dado disponível
            </div>
          )}
        </div>
        
        {/* Taxa de Conclusão de Leitura */}
        <div className={styles.chartCard}>
          <h3>Taxa de Conclusão de Leitura</h3>
          {completionRateData.labels.length > 0 ? (
            <div className={styles.chartContainer}>
              <Bar
                data={{
                  labels: completionRateData.labels,
                  datasets: [
                    {
                      label: 'Taxa de Conclusão (%)',
                      data: completionRateData.rates,
                      backgroundColor: '#778beb'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className={styles.chartPlaceholder}>
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.charts}>
        {/* Top Alunos */}
        <div className={styles.chartCard}>
          <h3>Ranking de Alunos</h3>
          {topStudents.length > 0 ? (
            <div className={styles.rankingContainer}>
              <table className={styles.topItemsTable}>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Turma</th>
                    <th>Livros Lidos</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((student, index) => (
                    <tr key={student.id} className={index === 0 ? styles.topRanked : ''}>
                      <td>{student.name}</td>
                      <td>{student.classroom}</td>
                      <td>{student.booksRead}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.chartPlaceholder}>
              Nenhum dado disponível
            </div>
          )}
        </div>
        
        {/* Desempenho por Turma */}
        <div className={styles.chartCard}>
          <h3>Desempenho por Turma</h3>
          {classroomPerformance.length > 0 ? (
            <div className={styles.chartContainer}>
              <Bar
                data={{
                  labels: classroomPerformance.map(c => c.classroom),
                  datasets: [
                    {
                      label: 'Livros Lidos',
                      data: classroomPerformance.map(c => c.booksRead),
                      backgroundColor: '#4a90e2'
                    },
                    {
                      label: 'Taxa Média de Conclusão (%)',
                      data: classroomPerformance.map(c => c.averageCompletion),
                      backgroundColor: '#f78fb3'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top'
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
          ) : (
            <div className={styles.chartPlaceholder}>
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 