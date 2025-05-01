import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
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
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { isSticky } = useScrollPosition();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Função para verificar se o link atual corresponde à página atual
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/dashboard" className={styles.logoLink}>
            <div className={styles.logoWrapper}>
              <img src="/images/sys/logo.png" alt="Bibliotech Logo" className={styles.logo} />
            </div>
            <h1>{settings.schoolName}</h1>
          </Link>
          <button
            className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={styles.menuIcon}></span>
          </button>
        </div>
      </header>

      <nav className={`${styles.nav} ${isSticky ? styles.sticky : ''} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.navContent}>
          <div className={styles.navSection}>
            <h2>
              <BookOpenIcon className={styles.navIcon} />
              Livros
            </h2>
            <Link to="/books" className={isActiveLink('/books') ? styles.activeLink : ''}>
              <ClipboardDocumentListIcon className={styles.linkIcon} />
              Acervo
            </Link>
            <Link to="/student-loans" className={isActiveLink('/student-loans') ? styles.activeLink : ''}>
              <ArrowPathIcon className={styles.linkIcon} />
              Locações Alunos
            </Link>
            <Link to="/staff-loans" className={isActiveLink('/staff-loans') ? styles.activeLink : ''}>
              <ArrowPathIcon className={styles.linkIcon} />
              Locações Professores
            </Link>
          </div>

          <div className={styles.navSection}>
            <h2>
              <UserGroupIcon className={styles.navIcon} />
              Cadastros
            </h2>
            <Link to="/students" className={isActiveLink('/students') ? styles.activeLink : ''}>
              <AcademicCapIcon className={styles.linkIcon} />
              Alunos
            </Link>
            <Link to="/staff" className={isActiveLink('/staff') ? styles.activeLink : ''}>
              <UserGroupIcon className={styles.linkIcon} />
              Professores e Funcionários
            </Link>
          </div>

          <div className={styles.navSection}>
            <h2>
              <ArrowPathIcon className={styles.navIcon} />
              Retiradas
            </h2>
            <Link to="/student-withdrawals" className={isActiveLink('/student-withdrawals') ? styles.activeLink : ''}>
              <AcademicCapIcon className={styles.linkIcon} />
              Alunos
            </Link>
            <Link to="/staff-withdrawals" className={isActiveLink('/staff-withdrawals') ? styles.activeLink : ''}>
              <UserGroupIcon className={styles.linkIcon} />
              Professores e Funcionários
            </Link>
          </div>

          <div className={styles.navSection}>
            <h2>
              <Cog6ToothIcon className={styles.navIcon} />
              Configurações
            </h2>
            <Link to="/dashboard" className={isActiveLink('/dashboard') ? styles.activeLink : ''}>
              <ChartBarIcon className={styles.linkIcon} />
              Dashboard
            </Link>
            <Link to="/settings" className={isActiveLink('/settings') ? styles.activeLink : ''}>
              <Cog6ToothIcon className={styles.linkIcon} />
              Configurações da Biblioteca
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <ArrowRightOnRectangleIcon className={styles.linkIcon} />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 