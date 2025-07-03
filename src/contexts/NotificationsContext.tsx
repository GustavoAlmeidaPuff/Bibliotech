import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'overdue' | 'warning' | 'info';
  studentId: string;
  studentName: string;
  bookTitle: string;
  loanId: string;
  daysOverdue: number;
  read: boolean;
  createdAt: Date;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const generateNotificationFromLoan = (loan: any): Notification => {
    const today = new Date();
    const dueDate = loan.dueDate?.toDate ? loan.dueDate.toDate() : new Date(loan.dueDate);
    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: `overdue-${loan.id}`,
      title: `Aluno(a) ${loan.studentName} está com a devolução do livro "${loan.bookTitle}" atrasada!`,
      message: `O empréstimo deveria ter sido devolvido em ${dueDate.toLocaleDateString('pt-BR')}. Já se passaram ${daysOverdue} dia(s) do prazo.`,
      type: daysOverdue > 7 ? 'overdue' : 'warning',
      studentId: loan.studentId,
      studentName: loan.studentName,
      bookTitle: loan.bookTitle,
      loanId: loan.id,
      daysOverdue,
      read: false,
      createdAt: new Date()
    };
  };

  const fetchOverdueLoans = async (): Promise<Notification[]> => {
    if (!currentUser) return [];

    try {
      const loansRef = collection(db, `users/${currentUser.uid}/loans`);
      const q = query(loansRef, where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);

      const overdueNotifications: Notification[] = [];
      const today = new Date();

      querySnapshot.docs.forEach(doc => {
        const loanData = doc.data();
        const dueDate = loanData.dueDate?.toDate ? loanData.dueDate.toDate() : new Date(loanData.dueDate);
        
        // Verificar se está atrasado
        if (dueDate < today) {
          const notification = generateNotificationFromLoan({
            id: doc.id,
            ...loanData
          });
          overdueNotifications.push(notification);
        }
      });

      return overdueNotifications;
    } catch (error) {
      console.error('Erro ao buscar empréstimos atrasados:', error);
      return [];
    }
  };

  const refreshNotifications = async () => {
    setLoading(true);
    try {
      const overdueNotifications = await fetchOverdueLoans();
      
      // Manter o status de lidas das notificações existentes
      const existingReadIds = new Set(
        notifications.filter(n => n.read).map(n => n.id)
      );

      const updatedNotifications = overdueNotifications.map(notification => ({
        ...notification,
        read: existingReadIds.has(notification.id)
      }));

      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Buscar notificações ao carregar e a cada 5 minutos
  useEffect(() => {
    if (currentUser) {
      refreshNotifications();
      
      const interval = setInterval(refreshNotifications, 5 * 60 * 1000); // 5 minutos
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}; 