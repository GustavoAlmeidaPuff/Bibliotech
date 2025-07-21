import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useAsync } from '../../hooks/useAsync';
import styles from './UpdateNotification.module.css';

interface UpdateNotificationFormData {
  title: string;
  content: string;
}

const UpdateNotification: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { sendUpdateNotificationToAllUsers } = useNotifications();
  const { execute: executeSend, isLoading, error } = useAsync<void>();
  
  const [formData, setFormData] = useState<UpdateNotificationFormData>({
    title: '',
    content: ''
  });
  
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Verificar se é admin
  const isAdmin = currentUser?.email === 'admin@admin.com';

  // Redirecionar se não for admin
  React.useEffect(() => {
    if (currentUser && !isAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, isAdmin, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage({ text: 'Por favor, preencha todos os campos.', isError: true });
      return;
    }

    try {
      await executeSend(() => sendUpdateNotificationToAllUsers(formData.title, formData.content));
      setMessage({ text: 'Notificação enviada com sucesso para todos os usuários!', isError: false });
      
      // Limpar formulário após sucesso
      setFormData({ title: '', content: '' });
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/settings');
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      setMessage({ text: 'Erro ao enviar notificação. Tente novamente.', isError: true });
    }
  };

  const handleCancel = () => {
    navigate('/settings');
  };

  if (!isAdmin) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Criar Notificação de Atualização</h2>
        <p className={styles.subtitle}>
          Esta notificação será enviada para todos os usuários do sistema.
        </p>
      </div>

      {message && (
        <div className={message.isError ? styles.errorMessage : styles.successMessage}>
          {message.text}
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Título da Notificação *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ex: Nova atualização disponível!"
            maxLength={100}
            required
            disabled={isLoading}
            className={styles.input}
          />
          <span className={styles.charCount}>{formData.title.length}/100</span>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content">Conteúdo da Notificação *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Descreva as novidades e melhorias incluídas nesta atualização..."
            rows={8}
            maxLength={2000}
            required
            disabled={isLoading}
            className={styles.textarea}
          />
          <span className={styles.charCount}>{formData.content.length}/2000</span>
        </div>

        <div className={styles.preview}>
          <h4>Pré-visualização:</h4>
          <div className={styles.previewBox}>
            <div className={styles.previewTitle}>
              {formData.title || 'Título da notificação aparecerá aqui'}
            </div>
            <div className={styles.previewContent}>
              {formData.content || 'Conteúdo da notificação aparecerá aqui'}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            type="button" 
            onClick={handleCancel}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
          >
            {isLoading ? 'Enviando...' : 'Notificar Todos os Usuários'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateNotification; 