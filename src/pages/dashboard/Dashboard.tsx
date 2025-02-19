import React from 'react';
import styles from './Dashboard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => (
  <div className={styles.statCard}>
    <h3>{title}</h3>
    <div className={styles.value}>{value}</div>
    <p>{description}</p>
  </div>
);

const Dashboard: React.FC = () => {
  // These will be replaced with real data from Firebase later
  const stats = [
    {
      title: 'Livros Emprestados',
      value: '42',
      description: 'Total de livros atualmente emprestados'
    },
    {
      title: 'Devoluções Pendentes',
      value: '7',
      description: 'Livros com devolução próxima ou atrasada'
    },
    {
      title: 'Livros no Acervo',
      value: '1,234',
      description: 'Total de livros disponíveis'
    },
    {
      title: 'Leitores Ativos',
      value: '156',
      description: 'Alunos e professores com empréstimos ativos'
    }
  ];

  return (
    <div className={styles.dashboard}>
      <h2>Dashboard</h2>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <div className={styles.charts}>
        <div className={styles.chartCard}>
          <h3>Empréstimos por Categoria</h3>
          <div className={styles.chartPlaceholder}>
            Gráfico de empréstimos por categoria será exibido aqui
          </div>
        </div>
        <div className={styles.chartCard}>
          <h3>Livros Mais Populares</h3>
          <div className={styles.chartPlaceholder}>
            Lista dos livros mais emprestados será exibida aqui
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 