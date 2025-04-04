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
    shift: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
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

      // Prepara os dados do aluno
      const studentData = {
        ...formData,
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