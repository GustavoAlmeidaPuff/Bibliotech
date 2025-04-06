import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Staff.module.css';

interface StaffForm {
  name: string;
  position: string;
  contact: string;
  notes: string;
}

const RegisterStaff = () => {
  const [formData, setFormData] = useState<StaffForm>({
    name: '',
    position: '',
    contact: '',
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.position) {
      setError('Nome e cargo são campos obrigatórios');
      return;
    }

    if (!currentUser) {
      setError('Você precisa estar logado para registrar funcionários');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepara os dados do funcionário
      const staffData = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser.uid,
      };

      // Referência à coleção de funcionários do usuário
      const staffRef = collection(db, `users/${currentUser.uid}/staff`);
      
      // Adiciona o documento
      await addDoc(staffRef, staffData);
      
      // Redireciona para a lista de funcionários
      navigate('/staff');
    } catch (err) {
      console.error('Error adding staff member:', err);
      if (err instanceof Error) {
        setError(`Erro ao registrar funcionário: ${err.message}`);
      } else {
        setError('Erro ao registrar funcionário. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Registrar Novo Funcionário</h2>
        <button 
          className={styles.cancelButton}
          onClick={() => navigate('/staff')}
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
              <label htmlFor="position">Cargo *</label>
              <input
                type="text"
                id="position"
                value={formData.position}
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
          <h3>Informações Adicionais</h3>
          <div className={styles.formGroup}>
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar Funcionário'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterStaff; 