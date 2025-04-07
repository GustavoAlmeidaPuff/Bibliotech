import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { LibrarySettings } from '../../contexts/SettingsContext';
import styles from './Login.module.css';

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [schoolName, setSchoolName] = useState('School Library System');
  const { studentUser, studentLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (studentUser) {
      navigate('/student-dashboard');
    }
    
    // Tentar buscar o nome da escola
    const loadSchoolName = async () => {
      try {
        const db = getFirestore();
        // Recupera configurações padrão
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
  }, [studentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await studentLogin(username, password);
      navigate('/student-dashboard');
    } catch (error) {
      console.error('Falha ao fazer login:', error);
      setError('Erro ao fazer login. Verifique suas credenciais.');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logo}></div>
        <h2>{schoolName}</h2>
        <h3>Portal do Aluno</h3>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Nome de Usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          <a href="/login">Acesso para Bibliotecários</a>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin; 