import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import styles from './Layout.module.css';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { scrolled, visible } = useScrollPosition();

  // Fecha o menu quando mudar de página
  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

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
      <header 
        className={`${styles.header} 
          ${scrolled ? styles.scrolled : ''} 
          ${!visible ? styles.hidden : ''}`}
      >
        <div className={styles.headerContent}>
          <Link to="/dashboard" className={styles.logoLink}>
            <BookOpenIcon className={styles.logoIcon} />
            <h1>School Library System</h1>
          </Link>
          <button
            className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={styles.menuIcon}></span>
          </button>
        </div>
        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
          <div className={styles.navSection}>
            <h2>
              <UserGroupIcon className={styles.navIcon} />
              Cadastros
            </h2>
            <Link to="/students">
              <AcademicCapIcon className={styles.linkIcon} />
              Alunos
            </Link>
            <Link to="/staff">
              <UserGroupIcon className={styles.linkIcon} />
              Professores e Funcionários
            </Link>
          </div>
          <div className={styles.navSection}>
            <h2>
              <BookOpenIcon className={styles.navIcon} />
              Livros
            </h2>
            <Link to="/books">
              <ClipboardDocumentListIcon className={styles.linkIcon} />
              Acervo
            </Link>
            <Link to="/student-loans">
              <ArrowPathIcon className={styles.linkIcon} />
              Locações Alunos
            </Link>
            <Link to="/staff-loans">
              <ArrowPathIcon className={styles.linkIcon} />
              Locações Professores
            </Link>
          </div>
          <div className={styles.navSection}>
            <h2>
              <ArrowPathIcon className={styles.navIcon} />
              Retiradas e Devoluções
            </h2>
            <Link to="/student-returns">
              <AcademicCapIcon className={styles.linkIcon} />
              Alunos
            </Link>
            <Link to="/staff-returns">
              <UserGroupIcon className={styles.linkIcon} />
              Professores e Funcionários
            </Link>
          </div>
          <div className={styles.navSection}>
            <h2>
              <Cog6ToothIcon className={styles.navIcon} />
              Configurações
            </h2>
            <Link to="/dashboard">
              <ChartBarIcon className={styles.linkIcon} />
              Dashboard
            </Link>
            <Link to="/settings">
              <Cog6ToothIcon className={styles.linkIcon} />
              Configurações da Biblioteca
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <ArrowRightOnRectangleIcon className={styles.linkIcon} />
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