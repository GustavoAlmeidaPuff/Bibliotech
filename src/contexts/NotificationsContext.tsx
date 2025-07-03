import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, getDocs, where, doc, setDoc, getDoc } from 'firebase/firestore';
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
  deleteNotification: (notificationId: string) => void;
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
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [deletedNotifications, setDeletedNotifications] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter(n => !n.read).length;

  // Carregar notificações lidas do Firebase
  const loadReadNotifications = async (): Promise<Set<string>> => {
    if (!currentUser) return new Set();

    try {
      const readNotificationsRef = doc(db, `users/${currentUser.uid}/settings/readNotifications`);
      const readNotificationsDoc = await getDoc(readNotificationsRef);
      
      if (readNotificationsDoc.exists()) {
        const data = readNotificationsDoc.data();
        return new Set(data.readIds || []);
      }
      
      return new Set();
    } catch (error) {
      console.error('Erro ao carregar notificações lidas:', error);
      return new Set();
    }
  };

  // Carregar notificações deletadas do Firebase
  const loadDeletedNotifications = async (): Promise<Set<string>> => {
    if (!currentUser) return new Set();

    try {
      const deletedNotificationsRef = doc(db, `users/${currentUser.uid}/settings/deletedNotifications`);
      const deletedNotificationsDoc = await getDoc(deletedNotificationsRef);
      
      if (deletedNotificationsDoc.exists()) {
        const data = deletedNotificationsDoc.data();
        return new Set(data.deletedIds || []);
      }
      
      return new Set();
    } catch (error) {
      console.error('Erro ao carregar notificações deletadas:', error);
      return new Set();
    }
  };

  // Salvar notificações lidas no Firebase
  const saveReadNotifications = async (readIds: Set<string>) => {
    if (!currentUser) return;

    try {
      const readNotificationsRef = doc(db, `users/${currentUser.uid}/settings/readNotifications`);
      await setDoc(readNotificationsRef, {
        readIds: Array.from(readIds),
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Erro ao salvar notificações lidas:', error);
    }
  };

  // Salvar notificações deletadas no Firebase
  const saveDeletedNotifications = async (deletedIds: Set<string>) => {
    if (!currentUser) return;

    try {
      const deletedNotificationsRef = doc(db, `users/${currentUser.uid}/settings/deletedNotifications`);
      await setDoc(deletedNotificationsRef, {
        deletedIds: Array.from(deletedIds),
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Erro ao salvar notificações deletadas:', error);
    }
  };

  const generateNotificationFromLoan = (loan: any, isRead: boolean = false): Notification => {
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
      read: isRead,
      createdAt: new Date()
    };
  };

  const fetchOverdueLoans = async (): Promise<Notification[]> => {
    if (!currentUser) return [];

    try {
      // Carregar notificações lidas e deletadas
      const [readIds, deletedIds] = await Promise.all([
        loadReadNotifications(),
        loadDeletedNotifications()
      ]);
      
      setReadNotifications(readIds);
      setDeletedNotifications(deletedIds);

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
          const notificationId = `overdue-${doc.id}`;
          
          // Não incluir notificações deletadas
          if (!deletedIds.has(notificationId)) {
            const isRead = readIds.has(notificationId);
            
            const notification = generateNotificationFromLoan({
              id: doc.id,
              ...loanData
            }, isRead);
            
            overdueNotifications.push(notification);
          }
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
      setNotifications(overdueNotifications);
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const newReadNotifications = new Set(readNotifications);
    newReadNotifications.add(notificationId);
    
    setReadNotifications(newReadNotifications);
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    // Salvar no Firebase
    await saveReadNotifications(newReadNotifications);
  };

  const markAllAsRead = async () => {
    const allNotificationIds = notifications.map(n => n.id);
    const newReadNotifications = new Set([...Array.from(readNotifications), ...allNotificationIds]);
    
    setReadNotifications(newReadNotifications);
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Salvar no Firebase
    await saveReadNotifications(newReadNotifications);
  };

  const deleteNotification = async (notificationId: string) => {
    const newDeletedNotifications = new Set(deletedNotifications);
    newDeletedNotifications.add(notificationId);
    
    setDeletedNotifications(newDeletedNotifications);
    
    // Remover da lista local
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );

    // Salvar no Firebase
    await saveDeletedNotifications(newDeletedNotifications);
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
    deleteNotification,
    refreshNotifications
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}; 