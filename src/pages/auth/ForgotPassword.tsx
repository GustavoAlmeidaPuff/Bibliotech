import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { LibrarySettings } from '../../contexts/SettingsContext';
import styles from './Login.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [schoolName, setSchoolName] = useState('School Library System');
  const { resetPassword } = useAuth();

  useEffect(() => {
    // Tentar buscar o nome da escola
    const loadSchoolName = async () => {
      try {
        const db = getFirestore();
        // Recupera o primeiro usuário para obter as configurações
        // Em um sistema com múltiplos usuários, isso poderia ser melhorado
        const usersSnapshot = await getDoc(doc(db, 'users', 'defaultSettings'));
        
        if (usersSnapshot.exists()) {
          const settingsRef = doc(db, 'users', usersSnapshot.id, 'settings', 'library');
          const settingsDoc = await getDoc(settingsRef);
          
          if (settingsDoc.exists()) {
            const settings = settingsDoc.data() as LibrarySettings;
            if (settings.schoolName) {
              setSchoolName(settings.schoolName);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar nome da escola:', error);
      }
    };
    
    loadSchoolName();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Verifique seu email para instruções de recuperação de senha.');
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      setError('Erro ao enviar email de recuperação. Verifique se o email está correto.');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logo}></div>
        <h2>{schoolName}</h2>
        <h3>Recuperação de Senha</h3>
        
        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className={styles.loginButton}>
            {loading ? 'Enviando...' : 'Recuperar Senha'}
          </button>
        </form>
        
        <div className={styles.links}>
          <Link to="/login">Voltar para Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 