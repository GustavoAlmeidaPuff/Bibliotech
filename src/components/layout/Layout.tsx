import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Layout.module.css';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>School Library System</h1>
          <button
            className={styles.menuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={styles.menuIcon}></span>
          </button>
        </div>
        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
          <div className={styles.navSection}>
            <h2>Cadastros</h2>
            <Link to="/students">Alunos</Link>
            <Link to="/staff">Professores e Funcionários</Link>
          </div>
          <div className={styles.navSection}>
            <h2>Livros</h2>
            <Link to="/books">Acervo</Link>
            <Link to="/student-loans">Locações Alunos</Link>
            <Link to="/staff-loans">Locações Professores</Link>
          </div>
          <div className={styles.navSection}>
            <h2>Retiradas e Devoluções</h2>
            <Link to="/student-returns">Alunos</Link>
            <Link to="/staff-returns">Professores e Funcionários</Link>
          </div>
          <div className={styles.navSection}>
            <h2>Configurações</h2>
            <Link to="/settings">Configurações da Biblioteca</Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Sair
            </button>
          </div>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 