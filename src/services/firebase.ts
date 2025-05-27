import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { Student } from '../types/common';

const firebaseConfig = {
  apiKey: "AIzaSyBaukjjy1nr7HognROeHmdQADjfbvSmu64",
  authDomain: "shoollibsystem.firebaseapp.com",
  projectId: "shoollibsystem",
  storageBucket: "shoollibsystem.firebasestorage.app",
  messagingSenderId: "540876175554",
  appId: "1:540876175554:web:bada4caa3945d1a667a35b",
  measurementId: "G-CQ0JZFYRKC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth services
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  },
};

// Student auth services
export const studentAuthService = {
  authenticate: async (username: string, password: string): Promise<Student> => {
    // Buscar lista de todos os usuários da biblioteca
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    for (const libraryDoc of usersSnapshot.docs) {
      // Para cada bibliotecário, procurar na coleção de alunos
      const studentsCollRef = collection(db, `users/${libraryDoc.id}/students`);
      const studentQuery = query(
        studentsCollRef,
        where('username', '==', username),
        where('hasCredentials', '==', true)
      );
      
      const studentSnapshot = await getDocs(studentQuery);
      
      if (!studentSnapshot.empty) {
        const doc = studentSnapshot.docs[0];
        const studentData = doc.data();
        
        // Verificar a senha
        if (studentData.tempPassword === password) {
          return {
            id: doc.id,
            name: studentData.name,
            className: studentData.className,
            userId: libraryDoc.id,
            username: studentData.username,
            hasCredentials: studentData.hasCredentials,
            tempPassword: studentData.tempPassword,
          };
        }
      }
    }
    
    throw new Error('Nome de usuário ou senha incorretos');
  },
};

// Settings services
export const settingsService = {
  getSchoolName: async (): Promise<string> => {
    try {
      const settingsDoc = await getDoc(doc(db, 'users', 'defaultSettings'));
      
      if (settingsDoc.exists()) {
        const settingsRef = doc(db, 'users', settingsDoc.id, 'settings', 'library');
        const librarySettingsDoc = await getDoc(settingsRef);
        
        if (librarySettingsDoc.exists()) {
          const settings = librarySettingsDoc.data();
          return settings.schoolName || 'School Library System';
        }
      }
      
      return 'School Library System';
    } catch (error) {
      console.error('Erro ao carregar nome da escola:', error);
      return 'School Library System';
    }
  },
}; 