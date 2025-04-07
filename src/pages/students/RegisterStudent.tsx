import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './RegisterStudent.module.css';

interface StudentForm {
  name: string;
  classroom: string;
  contact: string;
  address: string;
  number: string;
  neighborhood: string;
  complement: string;
  notes: string;
  shift: string;
  email: string;
  generateCredentials: boolean;
}

const RegisterStudent = () => {
  const [formData, setFormData] = useState<StudentForm>({
    name: '',
    classroom: '',
    contact: '',
    address: '',
    number: '',
    neighborhood: '',
    complement: '',
    notes: '',
    shift: '',
    email: '',
    generateCredentials: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [id]: newValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.classroom) {
      setError('Nome e turma são campos obrigatórios');
      return;
    }

    if (!currentUser) {
      setError('Você precisa estar logado para registrar alunos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Gera nome de usuário e senha se a opção estiver marcada
      let studentCredentials = {};
      if (formData.generateCredentials) {
        // Gera um nome de usuário baseado no nome do aluno (sem espaços, minúsculo)
        const username = formData.name.toLowerCase().replace(/\s+/g, '.');
        // Gera uma senha temporária (primeiras 3 letras do nome + últimos 4 dígitos da data atual)
        const tempPassword = `${username.substring(0, 3)}${Date.now().toString().slice(-4)}`;
        
        studentCredentials = {
          username,
          tempPassword,
          hasCredentials: true
        };
      }

      // Prepara os dados do aluno
      const studentData = {
        ...formData,
        ...studentCredentials,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser.uid, // Adiciona referência ao usuário
      };

      // Referência à coleção de alunos do usuário
      const studentsRef = collection(db, `users/${currentUser.uid}/students`);
      
      // Adiciona o documento
      await addDoc(studentsRef, studentData);
      
      // Redireciona para a lista de alunos
      navigate('/students');
    } catch (err) {
      console.error('Error adding student:', err);
      if (err instanceof Error) {
        setError(`Erro ao registrar aluno: ${err.message}`);
      } else {
        setError('Erro ao registrar aluno. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Registrar Novo Aluno</h2>
        <button 
          className={styles.cancelButton}
          onClick={() => navigate('/students')}
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.formSection}>
          <h3>Informações Básicas</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Nome *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="classroom">Turma *</label>
              <input
                type="text"
                id="classroom"
                value={formData.classroom}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact">Contato</label>
              <input
                type="text"
                id="contact"
                value={formData.contact}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Acesso do Aluno</h3>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email (opcional)</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                id="generateCredentials"
                checked={formData.generateCredentials}
                onChange={handleChange}
              />
              Gerar credenciais de acesso para o aluno
            </label>
            <p className={styles.helpText}>
              Se marcado, um nome de usuário e senha serão gerados automaticamente para que o aluno possa acessar suas estatísticas.
            </p>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Endereço</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="address">Endereço</label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="number">Número</label>
              <input
                type="text"
                id="number"
                value={formData.number}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="neighborhood">Bairro</label>
              <input
                type="text"
                id="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="complement">Complemento</label>
              <input
                type="text"
                id="complement"
                value={formData.complement}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Informações Adicionais</h3>
          <div className={styles.formGroup}>
            <label htmlFor="notes">Observação</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Informações Básicas</h3>
          <div className={styles.formGroup}>
            <label htmlFor="shift">Turno *</label>
            <select
              id="shift"
              value={formData.shift}
              onChange={handleChange}
              className={styles.selectField}
              required
            >
              <option value="" disabled>Selecione o turno</option>
              <option value="manhã">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </select>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar Aluno'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterStudent; 