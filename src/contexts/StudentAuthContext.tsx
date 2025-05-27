import React, { createContext, useContext, useState, useEffect } from 'react';
import { studentAuthService } from '../services/firebase';
import { Student, AsyncState } from '../types/common';

interface StudentAuthContextType {
  studentUser: Student | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  authState: AsyncState<Student>;
}

const StudentAuthContext = createContext<StudentAuthContextType | null>(null);

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};

export const StudentAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentUser, setStudentUser] = useState<Student | null>(null);
  const [authState, setAuthState] = useState<AsyncState<Student>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const login = async (username: string, password: string) => {
    setAuthState(prev => ({ ...prev, status: 'loading', error: null }));
    
    try {
      const student = await studentAuthService.authenticate(username, password);
      setStudentUser(student);
      setAuthState({ data: student, status: 'success', error: null });
      
      // Salva na sessão
      localStorage.setItem('studentUser', JSON.stringify(student));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      setAuthState(prev => ({ ...prev, status: 'error', error: errorMessage }));
      throw error;
    }
  };

  const logout = () => {
    setStudentUser(null);
    setAuthState({ data: null, status: 'idle', error: null });
    localStorage.removeItem('studentUser');
  };

  useEffect(() => {
    // Recuperar estudante logado do localStorage, se existir
    const storedStudent = localStorage.getItem('studentUser');
    if (storedStudent) {
      try {
        const student = JSON.parse(storedStudent) as Student;
        setStudentUser(student);
        setAuthState({ data: student, status: 'success', error: null });
      } catch (error) {
        console.error('Erro ao recuperar dados do aluno:', error);
        localStorage.removeItem('studentUser');
        setAuthState({ data: null, status: 'error', error: 'Erro ao recuperar dados do aluno' });
      }
    }
  }, []);

  const value = {
    studentUser,
    login,
    logout,
    authState,
  };

  return (
    <StudentAuthContext.Provider value={value}>
      {children}
    </StudentAuthContext.Provider>
  );
}; 