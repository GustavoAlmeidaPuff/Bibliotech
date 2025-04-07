import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
  
  // Autenticação de alunos
  studentUser: StudentUser | null;
  studentLogin: (username: string, password: string) => Promise<void>;
  studentLogout: () => void;
}

// Interface para aluno autenticado
export interface StudentUser {
  id: string;
  name: string;
  classroom: string;
  userId: string; // ID do bibliotecário
  username: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [studentUser, setStudentUser] = useState<StudentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    // Também faz logout do aluno quando o bibliotecário sai
    setStudentUser(null);
    localStorage.removeItem('studentUser');
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Login de alunos
  const studentLogin = async (username: string, password: string) => {
    // Busca o aluno com este username em todos os usuários bibliotecários
    const studentsQuery = query(
      collection(db, 'users'),
      where('hasCredentials', '==', true),
      where('username', '==', username)
    );

    // Vamos tentar uma abordagem diferente - procurar em cada coleção de usuários
    let studentData = null;
    let libraryUserId = '';
    
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
        studentData = doc.data();
        libraryUserId = libraryDoc.id;
        
        // Verificar a senha
        if (studentData.tempPassword === password) {
          const student: StudentUser = {
            id: doc.id,
            name: studentData.name,
            classroom: studentData.classroom,
            userId: libraryUserId,
            username: studentData.username
          };
          
          // Salva na sessão
          setStudentUser(student);
          localStorage.setItem('studentUser', JSON.stringify(student));
          return;
        }
      }
    }
    
    // Se chegou aqui, é porque a autenticação falhou
    throw new Error('Nome de usuário ou senha incorretos');
  };

  // Logout de aluno
  const studentLogout = () => {
    setStudentUser(null);
    localStorage.removeItem('studentUser');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Recuperar estudante logado do localStorage, se existir
    const storedStudent = localStorage.getItem('studentUser');
    if (storedStudent) {
      try {
        setStudentUser(JSON.parse(storedStudent));
      } catch (error) {
        console.error('Erro ao recuperar dados do aluno:', error);
        localStorage.removeItem('studentUser');
      }
    }

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    resetPassword,
    loading,
    
    // Adiciona funções de autenticação de alunos
    studentUser,
    studentLogin,
    studentLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 