import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { settingsService } from '../../services/firebase';
import { useSettings } from '../../contexts/SettingsContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import styles from './Layout.module.css';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const { notifications, unreadCount, markAllAsRead, deleteNotification, loading } = useNotifications();

  // Marcar todas como lidas ao abrir
  useEffect(() => {
    if (isNotificationsOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isNotificationsOpen, unreadCount, markAllAsRead]);

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

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}min atrás`;
    } else if (diffInMinutes < 1440) { // 24 horas
      return `${Math.floor(diffInMinutes / 60)}h atrás`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d atrás`;
    }
  };

  const handleBackdropClick = () => {
    setIsNotificationsOpen(false);
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className={styles.notificationButton}
              onClick={() => setIsNotificationsOpen(true)}
              aria-label="Abrir notificações"
              style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <BellIcon width={28} height={28} style={{ color: 'white' }} />
              {unreadCount > 0 && (
                <span className={styles.notificationBadge}>{unreadCount}</span>
              )}
            </button>
            <button
              className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={styles.menuIcon}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop para fechar notificações */}
      {isNotificationsOpen && (
        <div className={styles.notificationsBackdrop} onClick={handleBackdropClick}></div>
      )}

      {/* Gaveta de Notificações */}
      {isNotificationsOpen && (
        <div className={styles.notificationsDrawer}>
          <div className={styles.notificationsHeader}>
            <h3>Notificações</h3>
            <button
              className={styles.closeDrawerButton}
              onClick={() => setIsNotificationsOpen(false)}
              aria-label="Fechar notificações"
            >
              ×
            </button>
          </div>
          <div className={styles.notificationsList}>
            {loading ? (
              <div className={styles.emptyNotifications}>Carregando notificações...</div>
            ) : notifications.length === 0 ? (
              <div className={styles.emptyNotifications}>
                <div style={{ marginBottom: '0.5rem' }}>🎉</div>
                Nenhuma notificação pendente, está tudo em dia!
              </div>
            ) : (
              notifications.map(notification => (
                <div key={notification.id} className={`${styles.notificationItem} ${notification.read ? styles.read : ''}`}>
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <div className={styles.notificationTitle}>
                        {notification.title}
                      </div>
                      <button
                        className={styles.deleteNotificationButton}
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        aria-label="Deletar notificação"
                        title="Deletar notificação"
                      >
                        ×
                      </button>
                    </div>
                    <div className={styles.notificationMessage}>
                      {notification.message}
                    </div>
                    <div className={styles.notificationMeta}>
                      <span className={styles.notificationTime}>
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                      <span className={`${styles.notificationBadgeType} ${styles[notification.type]}`}>
                        {notification.daysOverdue} dia(s) de atraso
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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