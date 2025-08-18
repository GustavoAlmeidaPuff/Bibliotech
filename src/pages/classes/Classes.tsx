import React from 'react';
import styles from './Classes.module.css';

const Classes: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gerenciar Turmas</h1>
      </div>
      
      <div className={styles.constructionArea}>
        {/* Fita de isolamento */}
        <div className={styles.cautionTape}>
          <div className={styles.tapeStripe}></div>
        </div>
        
        <div className={styles.messageArea}>
          <h2>🚧 Área em Construção 🚧</h2>
          <p>Esta funcionalidade está sendo desenvolvida com muito carinho!</p>
          <p>Em breve você poderá gerenciar todas as turmas da biblioteca aqui.</p>
          
          <div className={styles.notificationAlert}>
            <div className={styles.bellIcon}>🔔</div>
            <div className={styles.alertText}>
              <strong>Fique ligado!</strong> Ative as notificações (sininho no canto superior direito) para ser avisado quando esta funcionalidade estiver pronta!
            </div>
          </div>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📚</span>
              <span>Cadastro de turmas</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>👨‍🎓</span>
              <span>Vínculo de alunos</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🎓</span>
              <span>Formatura das turmas</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📊</span>
              <span>Relatórios por turma</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classes;
