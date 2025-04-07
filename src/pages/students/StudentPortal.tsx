import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './StudentPortal.module.css';

interface Student {
  id: string;
  userId: string; // ID do bibliotecário/usuário que cadastrou o aluno
  name: string;
  classroom: string;
  shift: string;
  username: string;
}

interface Loan {
  id: string;
  bookTitle: string;
  bookId: string;
  borrowDate: {
    seconds: number;
    nanoseconds: number;
  };
  expectedReturnDate: {
    seconds: number;
    nanoseconds: number;
  };
  returnDate?: {
    seconds: number;
    nanoseconds: number;
  };
  status: 'emprestado' | 'devolvido' | 'atrasado';
}

interface StatisticsSummary {
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  lateLoans: number;
  favoriteGenre?: string;
  mostBorrowedBook?: string;
}

const StudentPortal = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [statistics, setStatistics] = useState<StatisticsSummary>({
    totalLoans: 0,
    activeLoans: 0,
    returnedLoans: 0,
    lateLoans: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o aluno está logado
    const storedStudentData = localStorage.getItem('studentData');
    
    if (!storedStudentData) {
      // Redirecionar para a página de login de aluno se não estiver logado
      navigate('/student-login');
      return;
    }

    const studentData = JSON.parse(storedStudentData);
    setStudent(studentData);
    
    fetchLoans(studentData.userId, studentData.id);
  }, [navigate]);

  const fetchLoans = async (userId: string, studentId: string) => {
    try {
      setLoading(true);
      
      // Buscar empréstimos do aluno
      const loansRef = collection(db, `users/${userId}/loans`);
      const q = query(
        loansRef,
        where('studentId', '==', studentId),
        orderBy('borrowDate', 'desc')
      );
      
      const loansSnapshot = await getDocs(q);
      
      if (!loansSnapshot.empty) {
        const loansList = loansSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Loan[];
        
        setLoans(loansList);
        
        // Calcular estatísticas
        const stats = calculateStatistics(loansList);
        setStatistics(stats);
      } else {
        console.log('Nenhum empréstimo encontrado para este aluno');
      }
    } catch (error) {
      console.error('Erro ao buscar empréstimos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (loansList: Loan[]): StatisticsSummary => {
    const stats: StatisticsSummary = {
      totalLoans: loansList.length,
      activeLoans: 0,
      returnedLoans: 0,
      lateLoans: 0
    };
    
    // Contagem de status
    loansList.forEach(loan => {
      if (loan.status === 'emprestado') {
        stats.activeLoans++;
      } else if (loan.status === 'devolvido') {
        stats.returnedLoans++;
      } else if (loan.status === 'atrasado') {
        stats.lateLoans++;
      }
    });
    
    // Poderia implementar estatísticas mais detalhadas como gênero favorito,
    // livro mais emprestado, etc., mas precisaríamos de mais dados
    
    return stats;
  };

  const handleLogout = () => {
    localStorage.removeItem('studentData');
    navigate('/student-login');
  };

  const formatDate = (dateObj: { seconds: number; nanoseconds: number }) => {
    if (!dateObj) return '-';
    const date = new Date(dateObj.seconds * 1000);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Portal do Aluno</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>Sair</button>
      </div>
      
      {student && (
        <div className={styles.studentInfo}>
          <h2>{student.name}</h2>
          <p>Turma: {student.classroom} - Turno: {student.shift}</p>
        </div>
      )}
      
      <div className={styles.statisticsCard}>
        <h3>Minhas Estatísticas</h3>
        <div className={styles.statisticsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statistics.totalLoans}</div>
            <div className={styles.statLabel}>Total de Empréstimos</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statistics.activeLoans}</div>
            <div className={styles.statLabel}>Empréstimos Ativos</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statistics.returnedLoans}</div>
            <div className={styles.statLabel}>Livros Devolvidos</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statistics.lateLoans}</div>
            <div className={styles.statLabel}>Atrasos</div>
          </div>
        </div>
      </div>
      
      <div className={styles.loansSection}>
        <h3>Meus Empréstimos</h3>
        
        {loans.length === 0 ? (
          <p className={styles.noLoans}>Você ainda não possui empréstimos.</p>
        ) : (
          <div className={styles.loansTable}>
            <table>
              <thead>
                <tr>
                  <th>Livro</th>
                  <th>Data de Empréstimo</th>
                  <th>Data de Devolução</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan.id} className={styles[loan.status]}>
                    <td>{loan.bookTitle}</td>
                    <td>{formatDate(loan.borrowDate)}</td>
                    <td>{loan.returnDate ? formatDate(loan.returnDate) : 'Não devolvido'}</td>
                    <td>
                      <span className={styles.status}>
                        {loan.status === 'emprestado' ? 'Emprestado' : 
                         loan.status === 'devolvido' ? 'Devolvido' : 'Atrasado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPortal; 