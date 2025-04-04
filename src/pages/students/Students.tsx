import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Students.module.css';

const Students = () => {
  const [showFilters, setShowFilters] = React.useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Cadastro de Alunos</h2>
        <div className={styles.headerActions}>
          <button
            className={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.buttonIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            Mostrar Filtros
          </button>
          <Link to="/students/register" className={styles.registerButton}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.buttonIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Registrar Aluno
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filters}>
          {/* Filtros serão implementados posteriormente */}
          <p>Filtros em desenvolvimento...</p>
        </div>
      )}

      <div className={styles.content}>
        {/* Lista de alunos será implementada posteriormente */}
        <p>Lista de alunos em construção...</p>
      </div>
    </div>
  );
};

export default Students; 