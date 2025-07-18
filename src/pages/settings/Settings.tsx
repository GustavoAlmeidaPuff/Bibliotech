import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  doc, 
  collection, 
  query, 
  getDocs, 
  deleteDoc,
  getFirestore, 
  setDoc,
  where
} from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import styles from './Settings.module.css';

const Settings = () => {
  const { currentUser } = useAuth();
  const { settings, updateSettings, saveSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  
  // Estado para restauração
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  
  // Estado para apagar empréstimos devolvidos
  const [showDeleteReturnedConfirm, setShowDeleteReturnedConfirm] = useState(false);
  const [deleteReturnedPassword, setDeleteReturnedPassword] = useState('');
  const [deleteReturnedLoading, setDeleteReturnedLoading] = useState(false);
  const [deleteReturnedError, setDeleteReturnedError] = useState('');
  
  // Referência para input de upload de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreFromFileLoading, setRestoreFromFileLoading] = useState(false);
  
  // pega todos os dados do firebase
  const getAllData = async () => {
    if (!currentUser) return null;
    
    const db = getFirestore();
    const collections = ['books', 'students', 'loans', 'staff', 'staffLoans'];
    const allData: Record<string, any[]> = {};
    
    for (const collectionName of collections) {
      const collectionRef = collection(db, `users/${currentUser.uid}/${collectionName}`);
      const querySnapshot = await getDocs(query(collectionRef));
      
      allData[collectionName] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    
    return allData;
  };
  
  // faz o backup dos dados em JSON
  const handleBackupData = async () => {
    try {
      setBackupLoading(true);
      setMessage({ text: '', isError: false });
      
      const data = await getAllData();
      if (!data) {
        throw new Error('Não foi possível obter os dados para backup');
      }
      
      // coloco algumas infos extras no backup
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        userId: currentUser?.uid,
        data
      };
      
      // converte pra JSON e cria um blob
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // truque pra fazer o download automático
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `biblioteca_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage({ 
        text: 'Backup realizado com sucesso! O arquivo foi baixado.', 
        isError: false 
      });
    } catch (error) {
      console.error('Erro ao fazer backup dos dados:', error);
      setMessage({ 
        text: 'Erro ao fazer backup dos dados. Tente novamente.', 
        isError: true 
      });
    } finally {
      setBackupLoading(false);
    }
  };
  
  // restaura os dados de um arquivo de backup
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) {
      return;
    }
    
    try {
      setRestoreFromFileLoading(true);
      setMessage({ text: '', isError: false });
      
      // lê o arquivo como texto
      const text = await file.text();
      const backupData = JSON.parse(text);
      
      // vê se o arquivo é válido
      if (!backupData.data || !backupData.version) {
        throw new Error('Formato de arquivo de backup inválido');
      }
      
      // agora vamos restaurar
      const db = getFirestore();
      const collections = ['books', 'students', 'loans', 'staff', 'staffLoans'];
      
      // primeiro limpo tudo
      await restoreAllData();
      
      // depois restauro os dados do backup
      for (const collectionName of collections) {
        if (Array.isArray(backupData.data[collectionName])) {
          const collectionData = backupData.data[collectionName];
          
          for (const item of collectionData) {
            const { id, ...data } = item;
            await setDoc(
              doc(db, `users/${currentUser.uid}/${collectionName}/${id}`),
              data
            );
          }
        }
      }
      
      setMessage({ 
        text: 'Dados restaurados com sucesso a partir do arquivo de backup!', 
        isError: false 
      });
    } catch (error) {
      console.error('Erro ao restaurar dados do arquivo:', error);
      setMessage({ 
        text: 'Erro ao restaurar dados do arquivo. Verifique se o arquivo é válido.', 
        isError: true 
      });
    } finally {
      setRestoreFromFileLoading(false);
      // limpa o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // apaga tudo do firebase
  const restoreAllData = async () => {
    if (!currentUser) return;
    
    const db = getFirestore();
    const collections = ['books', 'students', 'loans', 'staff', 'staffLoans'];
    
    for (const collectionName of collections) {
      const collectionRef = collection(db, `users/${currentUser.uid}/${collectionName}`);
      const querySnapshot = await getDocs(query(collectionRef));
      
      // deleta todos os documentos de uma vez
      const deletePromises = querySnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, `users/${currentUser.uid}/${collectionName}/${docSnapshot.id}`))
      );
      
      await Promise.all(deletePromises);
    }
  };
  
  // Funções para gerenciar as configurações
  const handleSettingChange = (setting: string, value: any) => {
    updateSettings({ [setting]: value });
  };
  
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setMessage({ text: '', isError: false });
      
      await saveSettings();
      
      setMessage({ text: 'Configurações salvas com sucesso!', isError: false });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ text: 'Erro ao salvar configurações. Tente novamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };
  
  // Funções para restauração de dados
  const handleRestoreDataClick = () => {
    setShowRestoreConfirm(true);
    setPassword('');
    setConfirmPhrase('');
    setRestoreError('');
  };
  
  const cancelRestore = () => {
    setShowRestoreConfirm(false);
    setPassword('');
    setConfirmPhrase('');
    setRestoreError('');
  };
  
  const handleRestoreConfirm = async () => {
    if (!currentUser || !currentUser.email) {
      setRestoreError('Usuário não autenticado.');
      return;
    }
    
    // Verificar a frase de confirmação
    const expectedPhrase = 'eu quero restaurar todos os dados da minha biblioteca';
    if (confirmPhrase.toLowerCase().trim() !== expectedPhrase) {
      setRestoreError('A frase de confirmação não corresponde exatamente ao esperado.');
      return;
    }
    
    try {
      setRestoreLoading(true);
      setRestoreError('');
      
      // Reautenticar o usuário com a senha fornecida
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Proceder com a restauração de dados
      await restoreAllData();
      
      setShowRestoreConfirm(false);
      setMessage({ text: 'Todos os dados foram restaurados com sucesso!', isError: false });
    } catch (error) {
      console.error('Erro ao restaurar dados:', error);
      
      if (error instanceof Error) {
        // Verificar se é erro de autenticação
        if (error.message.includes('auth')) {
          setRestoreError('Senha incorreta. Por favor, verifique e tente novamente.');
        } else {
          setRestoreError(`Erro ao restaurar dados: ${error.message}`);
        }
      } else {
        setRestoreError('Erro desconhecido ao restaurar dados.');
      }
    } finally {
      setRestoreLoading(false);
    }
  };

  // Funções para apagar empréstimos devolvidos
  const handleDeleteReturnedLoansClick = () => {
    setShowDeleteReturnedConfirm(true);
    setDeleteReturnedPassword('');
    setDeleteReturnedError('');
  };
  
  const cancelDeleteReturned = () => {
    setShowDeleteReturnedConfirm(false);
    setDeleteReturnedPassword('');
    setDeleteReturnedError('');
  };
  
  const handleDeleteReturnedConfirm = async () => {
    if (!currentUser || !currentUser.email) {
      setDeleteReturnedError('Usuário não autenticado.');
      return;
    }
    
    try {
      setDeleteReturnedLoading(true);
      setDeleteReturnedError('');
      
      // Reautenticar o usuário com a senha fornecida
      const credential = EmailAuthProvider.credential(currentUser.email, deleteReturnedPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Proceder com a exclusão de empréstimos devolvidos
      await deleteReturnedLoans();
      
      setShowDeleteReturnedConfirm(false);
      setMessage({ 
        text: 'Todos os registros de empréstimos devolvidos foram excluídos com sucesso!', 
        isError: false 
      });
    } catch (error) {
      console.error('Erro ao excluir empréstimos devolvidos:', error);
      
      if (error instanceof Error) {
        // Verificar se é erro de autenticação
        if (error.message.includes('auth')) {
          setDeleteReturnedError('Senha incorreta. Por favor, verifique e tente novamente.');
        } else {
          setDeleteReturnedError(`Erro ao excluir empréstimos devolvidos: ${error.message}`);
        }
      } else {
        setDeleteReturnedError('Erro desconhecido ao excluir empréstimos devolvidos.');
      }
    } finally {
      setDeleteReturnedLoading(false);
    }
  };
  
  // apaga os empréstimos que já foram devolvidos
  const deleteReturnedLoans = async () => {
    if (!currentUser) return;
    
    const db = getFirestore();
    
    // pega os empréstimos devolvidos dos estudantes
    const loansRef = collection(db, `users/${currentUser.uid}/loans`);
    const returnedLoansQuery = query(loansRef, where('status', '==', 'returned'));
    const returnedSnapshot = await getDocs(returnedLoansQuery);
    
    // deleta todos os empréstimos devolvidos
    const deletePromises = returnedSnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, `users/${currentUser.uid}/loans/${docSnapshot.id}`))
    );
    
    await Promise.all(deletePromises);
    
    // também deleta dos funcionários se tiver
    const staffLoansRef = collection(db, `users/${currentUser.uid}/staffLoans`);
    const returnedStaffLoansQuery = query(staffLoansRef, where('status', '==', 'returned'));
    const returnedStaffSnapshot = await getDocs(returnedStaffLoansQuery);
    
    const deleteStaffPromises = returnedStaffSnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, `users/${currentUser.uid}/staffLoans/${docSnapshot.id}`))
    );
    
    await Promise.all(deleteStaffPromises);
  };

  return (
    <div className={styles.container}>
      <h2>Configurações da Biblioteca</h2>
      
      {message.text && (
        <div className={message.isError ? styles.errorMessage : styles.successMessage}>
          {message.text}
        </div>
      )}
      
      <div className={styles.content}>
        <div className={styles.settingsSection}>
          <h3>Configurações Gerais</h3>
          
          <div className={styles.settingGroup}>
            <label htmlFor="schoolName">Nome da Escola/Biblioteca</label>
            <input
              type="text"
              id="schoolName"
              value={settings.schoolName}
              onChange={(e) => handleSettingChange('schoolName', e.target.value)}
              className={styles.textInput}
              placeholder="Nome que aparecerá no cabeçalho"
              maxLength={50}
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label htmlFor="loanDuration">Duração padrão do empréstimo (dias)</label>
            <input
              type="number"
              id="loanDuration"
              min="1"
              max="90"
              value={settings.loanDuration}
              onChange={(e) => handleSettingChange('loanDuration', parseInt(e.target.value))}
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label htmlFor="maxBooksPerStudent">Máximo de livros por aluno</label>
            <input
              type="number"
              id="maxBooksPerStudent"
              min="1"
              max="10"
              value={settings.maxBooksPerStudent}
              onChange={(e) => handleSettingChange('maxBooksPerStudent', parseInt(e.target.value))}
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
              />
              Habilitar notificações
            </label>
          </div>
          
          <div className={styles.settingGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.useDistinctCodes}
                onChange={(e) => handleSettingChange('useDistinctCodes', e.target.checked)}
              />
              Minha biblioteca usa códigos distintos para o mesmo título
            </label>
            <p className={styles.helpText}>
              Quando ativado, cada exemplar físico terá seu próprio código e a quantidade será calculada automaticamente pelo número de códigos. Quando desativado, você define manualmente a quantidade de exemplares para um mesmo Código.
            </p>
          </div>

          <div className={styles.buttonContainer}>
            <button 
              className={styles.saveButton}
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
        
        <div className={styles.settingsSection}>
          <h3>Backup e Restauração</h3>
          
          <div className={styles.backupSection}>
            <h4>Backup de Dados</h4>
            <p>
              Faça o backup de todos os dados da sua biblioteca. O arquivo pode ser usado
              para restaurar os dados posteriormente.
            </p>
            
            <button 
              className={styles.actionButton}
              onClick={handleBackupData}
              disabled={backupLoading}
            >
              {backupLoading ? 'Gerando backup...' : 'Fazer Backup dos Dados'}
            </button>
            
            <h4>Restaurar a partir de Backup</h4>
            <p>
              Restaure os dados da biblioteca a partir de um arquivo de backup.
              Seus dados atuais serão substituídos.
            </p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{ display: 'none' }}
            />
            
            <button 
              className={styles.actionButton}
              onClick={triggerFileInput}
              disabled={restoreFromFileLoading}
            >
              {restoreFromFileLoading ? 'Restaurando...' : 'Carregar Arquivo de Backup'}
            </button>
          </div>
          
          <div className={styles.dangerZone}>
            <h4>Zona de Perigo</h4>
            <p>
              As ações abaixo são irreversíveis. Tenha certeza do que está fazendo antes de prosseguir.
            </p>
            
            <button 
              className={styles.dangerButton}
              onClick={handleDeleteReturnedLoansClick}
            >
              Apagar Empréstimos Devolvidos
            </button>
            <p className={styles.helpText}>
              Esta ação apagará permanentemente todos os registros de empréstimos já devolvidos.
            </p>
            
            <button 
              className={styles.dangerButton}
              onClick={handleRestoreDataClick}
            >
              Restaurar Todos os Dados
            </button>
            <p className={styles.helpText}>
              Esta ação apagará todos os livros, alunos, empréstimos e outros registros do sistema.
            </p>
          </div>
        </div>
        
        <div className={styles.settingsSection}>
          <h3>Suporte</h3>
          
          <div className={styles.settingGroup}>
            <p className={styles.helpText}>
              Precisa de ajuda? Entre em contato com o suporte:
            </p>
            <a 
              href="https://wa.me/5551997188572" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.supportButton}
            >
              Contatar Suporte via WhatsApp
            </a>
          </div>
        </div>
      </div>
      
      {showRestoreConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Confirmar Restauração de Dados</h3>
            
            <p className={styles.warningText}>
              <strong>Atenção:</strong> Esta ação apagará <strong>permanentemente</strong> todos os
              registros da sua biblioteca, incluindo livros, alunos e histórico de empréstimos.
              Esta ação é irreversível!
            </p>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Digite sua senha para confirmar:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPhrase">Digite a frase abaixo exatamente como aparece:</label>
              <div className={styles.confirmationPhrase}>
                eu quero restaurar todos os dados da minha biblioteca
              </div>
              <input
                type="text"
                id="confirmPhrase"
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder="Digite a frase de confirmação..."
              />
            </div>
            
            {restoreError && (
              <div className={styles.errorMessage}>
                {restoreError}
              </div>
            )}
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={cancelRestore}
                disabled={restoreLoading}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmDangerButton}
                onClick={handleRestoreConfirm}
                disabled={!password || !confirmPhrase || restoreLoading}
              >
                {restoreLoading ? 'Restaurando...' : 'Confirmar Restauração'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showDeleteReturnedConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Confirmar Exclusão de Empréstimos Devolvidos</h3>
            
            <p className={styles.warningText}>
              <strong>Atenção:</strong> Esta ação apagará <strong>permanentemente</strong> todos os
              registros de empréstimos já devolvidos do sistema. Esta ação é irreversível!
            </p>
            
            <div className={styles.formGroup}>
              <label htmlFor="deleteReturnedPassword">Digite sua senha para confirmar:</label>
              <input
                type="password"
                id="deleteReturnedPassword"
                value={deleteReturnedPassword}
                onChange={(e) => setDeleteReturnedPassword(e.target.value)}
                placeholder="Sua senha"
              />
            </div>
            
            {deleteReturnedError && (
              <div className={styles.errorMessage}>
                {deleteReturnedError}
              </div>
            )}
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={cancelDeleteReturned}
                disabled={deleteReturnedLoading}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmDangerButton}
                onClick={handleDeleteReturnedConfirm}
                disabled={!deleteReturnedPassword || deleteReturnedLoading}
              >
                {deleteReturnedLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 