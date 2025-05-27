import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { useAsync } from '../../hooks/useAsync';
import { settingsService } from '../../services/firebase';
import { StudentLoginFormData } from '../../types/common';
import styles from './Login.module.css';

const StudentLogin: React.FC = () => {
  const [formData, setFormData] = useState<StudentLoginFormData>({
    username: '',
    password: ''
  });
  const [schoolName, setSchoolName] = useState('School Library System');
  
  const { studentUser, login } = useStudentAuth();
  const { execute: executeLogin, isLoading, error } = useAsync<void>();
  const navigate = useNavigate();

  useEffect(() => {
    if (studentUser) {
      navigate('/student-dashboard');
    }
  }, [studentUser, navigate]);

  useEffect(() => {
    // Carregar nome da escola
    const loadSchoolName = async () => {
      try {
        const name = await settingsService.getSchoolName();
        setSchoolName(name);
      } catch (error) {
        console.error('Erro ao carregar nome da escola:', error);
      }
    };
    
    loadSchoolName();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await executeLogin(() => login(formData.username, formData.password));
      navigate('/student-dashboard');
    } catch (error) {
      // Erro é gerenciado pelo hook useAsync
      console.error('Falha ao fazer login:', error);
    }
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
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading} 
            className={styles.loginButton}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
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