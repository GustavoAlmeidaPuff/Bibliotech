import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { LibrarySettings } from '../../contexts/SettingsContext';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [schoolName, setSchoolName] = useState('School Library System');
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
    
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
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to log in:', error);
      setError('Erro ao fazer login. Verifique suas credenciais.');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logo}></div>
        <h2>{schoolName}</h2>
        {error && <div className={styles.error}>{error}</div>}
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
          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className={styles.loginButton}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className={styles.links}>
          <Link to="/forgot-password">Esqueceu a senha?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 