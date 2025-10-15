import { 
  collection, 
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { Student } from '../types/common';

// Cache de escola do aluno em localStorage
const SCHOOL_CACHE_KEY = 'bibliotech_student_school_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

interface SchoolCacheEntry {
  schoolId: string;
  cachedAt: number;
}

const getCachedSchoolId = (studentId: string): string | null => {
  try {
    const cacheStr = localStorage.getItem(SCHOOL_CACHE_KEY);
    if (!cacheStr) return null;
    
    const cache: { [key: string]: SchoolCacheEntry } = JSON.parse(cacheStr);
    const entry = cache[studentId];
    
    if (!entry) return null;
    
    // Verificar se o cache ainda é válido
    const now = Date.now();
    if (now - entry.cachedAt > CACHE_DURATION) {
      console.log(`⏰ Cache expirado para aluno ${studentId}`);
      return null;
    }
    
    console.log(`✅ Usando escola em cache: ${entry.schoolId} para aluno ${studentId}`);
    return entry.schoolId;
  } catch {
    return null;
  }
};

const setCachedSchoolId = (studentId: string, schoolId: string): void => {
  try {
    const cacheStr = localStorage.getItem(SCHOOL_CACHE_KEY);
    const cache: { [key: string]: SchoolCacheEntry } = cacheStr ? JSON.parse(cacheStr) : {};
    
    cache[studentId] = {
      schoolId,
      cachedAt: Date.now()
    };
    
    localStorage.setItem(SCHOOL_CACHE_KEY, JSON.stringify(cache));
    console.log(`💾 Escola ${schoolId} salva em cache para aluno ${studentId}`);
  } catch (error) {
    console.warn('Erro ao salvar cache:', error);
  }
};

// Interfaces para o dashboard do aluno
export interface StudentLoan {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'active' | 'returned';
  genres?: string[];
  createdAt: Date;
  completed: boolean;
  readPercentage?: number;
}

export interface StudentBook {
  id: string;
  title: string;
  genres?: string[];
  authors?: string[];
  description?: string;
}

export interface StudentDashboardData {
  student: Student;
  loans: StudentLoan[];
  books: StudentBook[];
}

export const studentService = {
  /**
   * Busca um aluno por ID em todas as bibliotecas
   * @param studentId ID do aluno
   * @returns Promise<Student | null>
   */
  findStudentById: async (studentId: string): Promise<Student | null> => {
    try {
      // Verificar cache primeiro
      const cachedSchoolId = getCachedSchoolId(studentId);
      
      if (cachedSchoolId) {
        console.log(`🚀 Tentando buscar aluno ${studentId} na escola em cache: ${cachedSchoolId}`);
        try {
          const studentRef = doc(db, `users/${cachedSchoolId}/students/${studentId}`);
          const studentDoc = await getDoc(studentRef);
          
          if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            console.log(`✅ Aluno encontrado na escola em cache ${cachedSchoolId}!`);
            return {
              id: studentDoc.id,
              name: studentData.name,
              className: studentData.classroom || studentData.className || studentData.class || studentData.turma,
              educationalLevelId: studentData.educationalLevelId,
              userId: cachedSchoolId,
              username: studentData.username,
              hasCredentials: studentData.hasCredentials,
              tempPassword: studentData.tempPassword,
              createdAt: studentData.createdAt,
              updatedAt: studentData.updatedAt,
            };
          } else {
            console.log(`⚠️ Aluno não encontrado na escola em cache, buscando em todas...`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao buscar na escola em cache, buscando em todas...`);
        }
      }
      
      // Se não tem cache ou não encontrou, buscar em todas as escolas
      const knownSchoolIds = [
        '9PKyLnC37EP5cV6n7cdbLqcF2vI3',
        'rkCZozqfmoPspakPwswFA4qWqAo1',
        'gPGYmNxF4HfZK0GaL1L73ANJRyC2',
        'Ncuxq4WEowb1enPGP3YUEqyCZJk1',
        'VK7DnqLgJHiuLN0Uj4rZ'
      ];
      
      console.log(`🔍 Buscando aluno ${studentId} em ${knownSchoolIds.length} escolas conhecidas...`);
      
      // Buscar nas escolas conhecidas diretamente
      for (const schoolId of knownSchoolIds) {
        try {
          console.log(`🏫 Verificando escola: ${schoolId}`);
          const studentRef = doc(db, `users/${schoolId}/students/${studentId}`);
          const studentDoc = await getDoc(studentRef);
          
          if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            console.log(`✅ Aluno encontrado na escola ${schoolId}!`);
            console.log(`📋 Dados completos do aluno:`, studentData);
            
            // Salvar escola no cache para próximas buscas
            setCachedSchoolId(studentId, schoolId);
            
            return {
              id: studentDoc.id,
              name: studentData.name,
              className: studentData.classroom || studentData.className || studentData.class || studentData.turma,
              educationalLevelId: studentData.educationalLevelId,
              userId: schoolId,
              username: studentData.username,
              hasCredentials: studentData.hasCredentials,
              tempPassword: studentData.tempPassword,
              createdAt: studentData.createdAt,
              updatedAt: studentData.updatedAt,
            };
          } else {
            console.log(`❌ Aluno ${studentId} não encontrado na escola ${schoolId}`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao acessar escola ${schoolId}:`, error);
          continue;
        }
      }
      
      // Se não encontrou nas escolas conhecidas, tenta buscar via collection users
      console.log('🔄 Tentando busca via collection users...');
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        for (const userDoc of usersSnapshot.docs) {
          if (knownSchoolIds.includes(userDoc.id)) {
            continue; // Já testamos essas escolas
          }
          
          try {
            const studentRef = doc(db, `users/${userDoc.id}/students/${studentId}`);
            const studentDoc = await getDoc(studentRef);
            
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              console.log(`✅ Aluno encontrado na escola ${userDoc.id} via busca geral!`);
              console.log(`📋 Dados completos do aluno (busca geral):`, studentData);
              
              // Salvar escola no cache para próximas buscas
              setCachedSchoolId(studentId, userDoc.id);
              
              return {
                id: studentDoc.id,
                name: studentData.name,
                className: studentData.classroom || studentData.className || studentData.class || studentData.turma,
                educationalLevelId: studentData.educationalLevelId,
                userId: userDoc.id,
                username: studentData.username,
                hasCredentials: studentData.hasCredentials,
                tempPassword: studentData.tempPassword,
                createdAt: studentData.createdAt,
                updatedAt: studentData.updatedAt,
              };
            }
          } catch (error) {
            console.log(`Não foi possível acessar alunos da biblioteca ${userDoc.id}`);
            continue;
          }
        }
      } catch (error) {
        console.log('❌ Erro na busca via collection users:', error);
      }
      
      // Aluno não encontrado em nenhuma biblioteca
      console.log(`❌ Aluno ${studentId} não encontrado em nenhuma escola!`);
      return null;
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      
      // Verificar se é erro de permissão do Firebase
      if (error instanceof Error && error.message.includes('permissions')) {
        throw new Error('Erro de permissão: As regras do Firebase precisam ser atualizadas para permitir acesso público aos dados dos alunos.');
      }
      
      throw new Error('Erro ao buscar dados do aluno. Verifique sua conexão e tente novamente.');
    }
  },

  /**
   * Valida se um ID de aluno existe
   * @param studentId ID do aluno
   * @returns Promise<boolean>
   */
  validateStudentId: async (studentId: string): Promise<boolean> => {
    const student = await studentService.findStudentById(studentId);
    return student !== null;
  },

  /**
   * Busca todos os dados do dashboard de um aluno
   * @param studentId ID do aluno
   * @returns Promise<StudentDashboardData | null>
   */
  getStudentDashboardData: async (studentId: string): Promise<StudentDashboardData | null> => {
    try {
      console.log(`📊 Buscando dados completos do dashboard para aluno ${studentId}...`);
      
      // Primeiro, buscar o aluno para saber em qual escola está
      const student = await studentService.findStudentById(studentId);
      if (!student) {
        console.log(`❌ Aluno ${studentId} não encontrado`);
        return null;
      }

      console.log(`✅ Aluno encontrado:`, student);
      console.log(`🏫 Turma do aluno:`, student.className);

      const schoolId = student.userId;
      console.log(`🏫 Aluno encontrado na escola: ${schoolId}`);

      // Buscar empréstimos do aluno
      const loans = await studentService.getStudentLoans(schoolId, studentId);
      console.log(`📚 Encontrados ${loans.length} empréstimos`);

      // Buscar dados dos livros emprestados
      const bookIds = Array.from(new Set(loans.map(loan => loan.bookId)));
      const books = await studentService.getBooks(schoolId, bookIds);
      console.log(`📖 Encontrados ${books.length} livros`);

      return {
        student,
        loans,
        books
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw new Error('Erro ao carregar dados do dashboard. Verifique sua conexão.');
    }
  },

  /**
   * Busca empréstimos de um aluno específico
   * @param schoolId ID da escola
   * @param studentId ID do aluno
   * @returns Promise<StudentLoan[]>
   */
  getStudentLoans: async (schoolId: string, studentId: string): Promise<StudentLoan[]> => {
    try {
      console.log(`📚 Buscando empréstimos do aluno ${studentId} na escola ${schoolId}...`);
      
      const loansRef = collection(db, `users/${schoolId}/loans`);
      const q = query(
        loansRef,
        where('studentId', '==', studentId)
      );

      const loansSnapshot = await getDocs(q);
      
      if (loansSnapshot.empty) {
        console.log(`📭 Nenhum empréstimo encontrado para o aluno ${studentId}`);
        return [];
      }

      const loans = loansSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Converter timestamps para Dates
        const borrowDate = data.borrowDate?.toDate ? data.borrowDate.toDate() : new Date();
        const dueDate = data.dueDate?.toDate ? data.dueDate.toDate() : new Date();
        const returnDate = data.returnDate?.toDate ? data.returnDate.toDate() : undefined;
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        
        return {
          id: doc.id,
          studentId: data.studentId,
          studentName: data.studentName,
          bookId: data.bookId,
          bookTitle: data.bookTitle,
          borrowDate,
          dueDate,
          returnDate,
          status: data.status,
          genres: data.genres,
          createdAt,
          completed: data.completed || false,
          readPercentage: data.readPercentage
        };
      }) as StudentLoan[];

      console.log(`✅ ${loans.length} empréstimos carregados com sucesso`);
      return loans;
    } catch (error) {
      console.error(`Erro ao buscar empréstimos do aluno ${studentId}:`, error);
      if (error instanceof Error && error.message.includes('permissions')) {
        throw new Error('Erro de permissão: As regras do Firebase precisam ser atualizadas para permitir acesso aos empréstimos.');
      }
      throw new Error('Erro ao buscar empréstimos do aluno.');
    }
  },

  /**
   * Busca um livro específico por ID
   * @param bookId ID do livro
   * @param schoolId ID da escola
   * @returns Promise<Book | null>
   */
  getBookById: async (bookId: string, schoolId: string) => {
    try {
      console.log(`📖 Buscando livro ${bookId} na escola ${schoolId}...`);
      
      const bookRef = doc(db, `users/${schoolId}/books/${bookId}`);
      const bookSnapshot = await getDoc(bookRef);
      
        if (bookSnapshot.exists()) {
          const bookData = bookSnapshot.data();
          
          // Calcular cópias disponíveis corretamente
          const totalCopies = bookData.totalCopies || bookData.quantity || 1;
          const availableCopies = bookData.availableCopies !== undefined ? bookData.availableCopies : totalCopies;
          
          // Um livro está disponível se tem cópias disponíveis > 0
          const isAvailable = availableCopies > 0;
          
          const book = {
            id: bookSnapshot.id,
            title: bookData.title,
            author: bookData.authors || bookData.author,
            isbn: bookData.isbn,
            category: bookData.category,
            tags: bookData.tags || [],
            genres: bookData.genres || [],
            available: isAvailable,
            totalCopies: totalCopies,
            availableCopies: availableCopies,
            userId: bookData.userId,
            description: bookData.description,
            synopsis: bookData.synopsis,
            coverUrl: bookData.coverUrl,
            createdAt: bookData.createdAt,
            updatedAt: bookData.updatedAt
          };
        
        console.log(`✅ Livro ${book.title} carregado com sucesso`);
        return book;
      }
      
      console.log(`❌ Livro ${bookId} não encontrado`);
      return null;
    } catch (error) {
      console.error('Erro ao buscar livro:', error);
      if (error instanceof Error && error.message.includes('permissions')) {
        throw new Error('Erro de permissão: As regras do Firebase precisam ser atualizadas para permitir acesso aos livros.');
      }
      throw new Error('Erro ao buscar dados do livro.');
    }
  },

  /**
   * Busca dados dos livros por IDs
   * @param schoolId ID da escola
   * @param bookIds Array de IDs dos livros
   * @returns Promise<StudentBook[]>
   */
  getBooks: async (schoolId: string, bookIds: string[]): Promise<StudentBook[]> => {
    try {
      if (bookIds.length === 0) {
        return [];
      }

      console.log(`📖 Buscando dados de ${bookIds.length} livros na escola ${schoolId}...`);
      
      const books: StudentBook[] = [];
      
      // Buscar cada livro individualmente
      for (const bookId of bookIds) {
        try {
          const bookRef = doc(db, `users/${schoolId}/books/${bookId}`);
          const bookSnapshot = await getDoc(bookRef);
          
          if (bookSnapshot.exists()) {
            const bookData = bookSnapshot.data();
            books.push({
              id: bookSnapshot.id,
              title: bookData.title,
              genres: bookData.genres,
              authors: bookData.authors,
              description: bookData.description
            });
          }
        } catch (error) {
          console.log(`⚠️ Erro ao buscar livro ${bookId}:`, error);
          continue;
        }
      }

      console.log(`✅ ${books.length} livros carregados com sucesso`);
      return books;
    } catch (error) {
      console.error('Erro ao buscar dados dos livros:', error);
      if (error instanceof Error && error.message.includes('permissions')) {
        throw new Error('Erro de permissão: As regras do Firebase precisam ser atualizadas para permitir acesso aos livros.');
      }
      throw new Error('Erro ao buscar dados dos livros.');
    }
  },

  /**
   * Limpa o cache de escola para um aluno específico ou todos
   * @param studentId ID do aluno (opcional - se não fornecido, limpa tudo)
   */
  clearSchoolCache: (studentId?: string): void => {
    try {
      if (studentId) {
        const cacheStr = localStorage.getItem(SCHOOL_CACHE_KEY);
        if (cacheStr) {
          const cache: { [key: string]: SchoolCacheEntry } = JSON.parse(cacheStr);
          delete cache[studentId];
          localStorage.setItem(SCHOOL_CACHE_KEY, JSON.stringify(cache));
          console.log(`🗑️ Cache removido para aluno ${studentId}`);
        }
      } else {
        localStorage.removeItem(SCHOOL_CACHE_KEY);
        console.log(`🗑️ Todo cache de escolas removido`);
      }
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
  }
};
