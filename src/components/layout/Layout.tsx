import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { settingsService } from '../../services/firebase';
import { useSettings } from '../../contexts/SettingsContext';
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

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();

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

  // Fechar menu ao navegar (mobile)
  const handleLinkClick = () => {
    setIsMenuOpen(false);
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

      <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.navContent}>
          <div className={styles.navSection}>
            <h2>
              <BookOpenIcon className={styles.navIcon} />
              Livros
            </h2>
            <Link 
              to="/books" 
              className={isActiveLink('/books') ? styles.activeLink : ''}
              onClick={handleLinkClick}
            >
              <ClipboardDocumentListIcon className={styles.linkIcon} />
              Acervo
            </Link>
            <Link 
              to="/student-loans" 
              className={isActiveLink('/student-loans') ? styles.activeLink : ''}
              onClick={handleLinkClick}
            >
              <ArrowPathIcon className={styles.linkIcon} />
              Retiradas Alunos
            </Link>
            <Link 
              to="/staff-loans" 
              className={isActiveLink('/staff-loans') ? styles.activeLink : ''}
              onClick={handleLinkClick}
            >
              <ArrowPathIcon className={styles.linkIcon} />
              Retiradas Professores
            </Link>
          </div>

          <div className={styles.navSection}>
            <h2>
              <UserGroupIcon className={styles.navIcon} />
              Cadastros
            </h2>
            <Link 
              to="/students" 
              className={isActiveLink('/students') ? styles.activeLink : ''}
              onClick={handleLinkClick}
            >
              <AcademicCapIcon className={styles.linkIcon} />
              Alunos
            </Link>
            <Link 
              to="/staff" 
              className={isActiveLink('/staff') ? styles.activeLink : ''}
              onClick={handleLinkClick}
            >
              <UserGroupIcon className={styles.linkIcon} />
              Professores e Funcionários
            </Link>
          </div>

          <div className={styles.navSection}>
            <h2>
              <ArrowPathIcon className={styles.navIcon} />
              Retirar
            </h2>
            <Link 
              to="/student-withdrawals" 
              className={isActiveLink('/student-withdrawals') ? styles.activeLink : ''}
              onClick={handleLinkClick}
            >
              <AcademicCapIcon className={styles.linkIcon} />
              Alunos
            </Link>
            <Link 
              to="/staff-withdrawals" 
              className={isActiveLink('/staff-withdrawals') ? styles.activeLink : ''}
              onClick={handleLinkClick}
            >
              <UserGroupIcon className={styles.linkIcon} />
              Professores e Funcionários
            </Link>
          </div>

          <div className={styles.navSection}>
            <h2>
              <Cog6ToothIcon className={styles.navIcon} />
              Configurações
            </h2>
            <Link 
              to="/dashboard" 
              className={isActiveLink('/dashboard') ? styles.activeLink : ''}
              onClick={handleLinkClick}
            >
              <ChartBarIcon className={styles.linkIcon} />
              Dashboard
            </Link>
            <Link 
              to="/settings" 
              className={isActiveLink('/settings') ? styles.activeLink : ''}
              onClick={handleLinkClick}
            >
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