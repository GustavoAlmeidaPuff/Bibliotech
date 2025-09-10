import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface BookRecommendation {
  id: string;
  title: string;
  authors?: string[];
  genres?: string[];
  borrowCount: number;
  description?: string;
}

export interface RecommendationSection {
  title: string;
  books: BookRecommendation[];
  reason: string;
}

interface Book {
  id: string;
  title: string;
  authors?: string[] | string;
  genres?: string[];  // Array de gêneros como usado no sistema
  description?: string;
  codes?: string[];
  code?: string;
  category?: string;  // Campo category individual (legado)
  tags?: string[];    // Array de IDs de tags
  docId?: string;     // ID do documento Firebase (usado para buscar empréstimos)
}

interface Loan {
  id: string;
  bookId: string;
  studentId: string;
  status: string;
  createdAt: Date;
  returnDate?: Date;
}

interface GenreStats {
  [genre: string]: number;
}

class RecommendationService {
  private readonly CACHE_DURATION = 0; // DESABILITADO para debug
  private genreStatsCache: { data: GenreStats; timestamp: number } | null = null;
  private topBooksCache: { data: BookRecommendation[]; timestamp: number } | null = null;

  /**
   * Obtém recomendações personalizadas para um estudante
   */
  async getRecommendationsForStudent(
    userId: string, 
    studentId: string
  ): Promise<RecommendationSection[]> {
    try {
      console.log(`🚀 Gerando recomendações para studentId: ${studentId}`);
      
      // Buscar histórico do estudante
      const studentGenres = await this.getStudentFavoriteGenres(userId, studentId);
      
      if (studentGenres.length === 0) {
        console.log('👶 Usuário sem gêneros identificados - usando recomendações padrão (livros mais populares)');
        // Sem gêneros favoritos identificados - retorna livros mais populares
        return await this.getDefaultRecommendations(userId);
      }

      console.log('👤 Usuário com histórico - gerando recomendações personalizadas');
      // Usuário com histórico - recomendações baseadas em gêneros favoritos
      return await this.getGenreBasedRecommendations(userId, studentGenres);
    } catch (error) {
      console.error('❌ Erro ao gerar recomendações:', error);
      // Fallback para recomendações padrão
      return await this.getDefaultRecommendations(userId);
    }
  }

  /**
   * Obtém os gêneros favoritos do estudante baseado no histórico
   */
  private async getStudentFavoriteGenres(
    userId: string, 
    studentId: string
  ): Promise<string[]> {
    try {
      console.log(`🔍 [NOVO] Buscando gêneros favoritos para studentId: ${studentId}, userId: ${userId}`);
      
      // Buscar TODOS os empréstimos do aluno (sem filtros)
      const loansRef = collection(db, `users/${userId}/loans`);
      const q = query(loansRef, where('studentId', '==', studentId));
      const loansSnapshot = await getDocs(q);
      
      console.log(`📊 Total de empréstimos encontrados: ${loansSnapshot.size}`);
      
      if (loansSnapshot.empty) {
        console.log('❌ Nenhum empréstimo encontrado - retornando array vazio');
        return [];
      }

      // Coletar todos os IDs de livros emprestados pelo aluno
      const loanData = loansSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`📄 Empréstimo:`, {
          id: doc.id,
          bookId: data.bookId,
          studentId: data.studentId,
          status: data.status,
          bookTitle: data.bookTitle
        });
        return data;
      });

      const bookIds = loanData.map(loan => loan.bookId);
      const uniqueBookIds = Array.from(new Set(bookIds));
      console.log(`📚 IDs únicos de livros emprestados (${uniqueBookIds.length}):`, uniqueBookIds);
      
      // Buscar todos os livros do acervo
      const booksRef = collection(db, `users/${userId}/books`);
      const booksSnapshot = await getDocs(booksRef);
      console.log(`📖 Total de livros no acervo: ${booksSnapshot.size}`);
      
      // Debug: mostrar alguns IDs do acervo
      const acervoIds = booksSnapshot.docs.slice(0, 5).map(doc => doc.id);
      console.log(`📝 Primeiros 5 IDs do acervo:`, acervoIds);
      console.log(`🎯 ID procurado:`, uniqueBookIds[0]);
      
      // Mapear livros por ID para facilitar busca
      const booksMap = new Map();
      booksSnapshot.docs.forEach(bookDoc => {
        const book = bookDoc.data() as Book;
        const bookId = bookDoc.id; // ID do documento Firebase
        booksMap.set(bookId, book); // Usar o ID do documento, não book.id
        
        // Debug: verificar se é o livro que estamos procurando
        if (uniqueBookIds.includes(bookId)) {
          console.log(`🔍 ENCONTROU livro procurado:`, {
            documentId: bookId,
            bookDataId: book.id,
            title: book.title,
            genres: book.genres,
            category: book.category
          });
        }
      });

      // Contar gêneros baseado nos livros emprestados
      const genreCounts: { [genre: string]: number } = {};
      let livrosEncontrados = 0;

      uniqueBookIds.forEach(bookId => {
        const book = booksMap.get(bookId);
        if (book) {
          livrosEncontrados++;
          console.log(`📖 Livro encontrado: "${book.title}"`, {
            id: book.id,
            genres: book.genres,
            category: book.category
          });

          // Verificar tanto 'genres' quanto 'category'
          const allGenres = [];
          
          if (book.genres && Array.isArray(book.genres)) {
            allGenres.push(...book.genres);
          }
          
          if (book.category && typeof book.category === 'string') {
            allGenres.push(book.category);
          }

          console.log(`🏷️ Gêneros/categorias do livro "${book.title}":`, allGenres);

          allGenres.forEach(genre => {
            if (genre && genre.trim()) {
              const cleanGenre = genre.trim();
              genreCounts[cleanGenre] = (genreCounts[cleanGenre] || 0) + 1;
            }
          });
        } else {
          console.log(`❓ Livro com ID ${bookId} não encontrado no acervo`);
        }
      });

      console.log(`✅ Livros encontrados no acervo: ${livrosEncontrados}/${uniqueBookIds.length}`);
      console.log('📊 Contagem final de gêneros:', genreCounts);

      // Ordenar por frequência e pegar os top 2
      const favoriteGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([genre]) => genre);
      
      console.log('🏆 TOP 2 gêneros favoritos:', favoriteGenres);
      return favoriteGenres;

    } catch (error) {
      console.error('❌ Erro ao buscar gêneros favoritos:', error);
      return [];
    }
  }

  /**
   * Gera recomendações baseadas nos gêneros favoritos
   */
  private async getGenreBasedRecommendations(
    userId: string, 
    favoriteGenres: string[]
  ): Promise<RecommendationSection[]> {
    const recommendations: RecommendationSection[] = [];

    for (const genre of favoriteGenres) {
      const books = await this.getTopBooksByGenre(userId, genre, 5);
      
      if (books.length > 0) {
        recommendations.push({
          title: `Com base em ${genre}`,
          books,
          reason: `Baseado no seu interesse em ${genre}`
        });
      }
    }

    return recommendations;
  }

  /**
   * Obtém os livros mais populares de um gênero específico
   */
  private async getTopBooksByGenre(
    userId: string, 
    genre: string, 
    maxBooks: number = 5
  ): Promise<BookRecommendation[]> {
    try {
      console.log(`🎯 [MELHORADO] Buscando livros do gênero: "${genre}"`);
      
      // Buscar todos os livros do acervo
      const booksRef = collection(db, `users/${userId}/books`);
      const booksSnapshot = await getDocs(booksRef);
      
      const genreBooks: Book[] = [];
      let totalBooks = 0;
      
      booksSnapshot.docs.forEach(bookDoc => {
        const book = bookDoc.data() as Book;
        totalBooks++;
        
        // Verificar se o livro tem o gênero procurado (em genres[] OU category)
        let hasGenre = false;
        
        // Verificar array de gêneros
        if (book.genres && Array.isArray(book.genres)) {
          hasGenre = book.genres.some(g => g && g.trim().toLowerCase() === genre.toLowerCase());
        }
        
        // Verificar categoria individual
        if (!hasGenre && book.category && typeof book.category === 'string') {
          hasGenre = book.category.trim().toLowerCase() === genre.toLowerCase();
        }
        
        if (hasGenre) {
          console.log(`✅ Livro "${book.title}" pertence ao gênero "${genre}"`);
          genreBooks.push({
            ...book,
            docId: bookDoc.id // Incluir o ID do documento
          });
        }
      });

      console.log(`📊 Resultado da busca por "${genre}": ${genreBooks.length}/${totalBooks} livros encontrados`);

      if (genreBooks.length === 0) {
        console.log(`❌ Nenhum livro encontrado para o gênero "${genre}"`);
        return [];
      }

      // Calcular popularidade de cada livro
      console.log(`🔢 Calculando popularidade de ${genreBooks.length} livros...`);
      const booksWithStats = await Promise.all(
        genreBooks.map(async (book) => {
          const borrowCount = await this.calculateBookBorrowCount(book.docId || book.id, userId); // Usar o ID correto
          console.log(`📊 "${book.title}": ${borrowCount} empréstimos total`);
          return {
            ...book,
            borrowCount
          };
        })
      );

      // Ordenar por popularidade (mais emprestados primeiro)
      const sortedBooks = booksWithStats
        .sort((a, b) => b.borrowCount - a.borrowCount)
        .slice(0, maxBooks);

      console.log(`🏆 TOP ${Math.min(maxBooks, sortedBooks.length)} livros do gênero "${genre}":`);
      sortedBooks.forEach((book, index) => {
        console.log(`  ${index + 1}. "${book.title}" - ${book.borrowCount} empréstimos`);
      });

      return sortedBooks.map(book => ({
        id: book.docId || book.id, // Usar docId se disponível
        title: book.title,
        authors: Array.isArray(book.authors) ? book.authors : (book.authors ? [book.authors] : undefined),
        genres: book.genres,
        borrowCount: book.borrowCount,
        description: book.description
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar livros por gênero:', error);
      return [];
    }
  }

  /**
   * Obtém recomendações padrão para novos usuários
   * Usa exatamente a mesma lógica do dashboard
   */
  private async getDefaultRecommendations(userId: string): Promise<RecommendationSection[]> {
    try {
      console.log('📊 [NOVO] Calculando livros mais populares igual ao dashboard...');
      
      // Buscar TODOS os empréstimos (igual ao dashboard)
      const loansRef = collection(db, `users/${userId}/loans`);
      const loansSnapshot = await getDocs(loansRef);
      
      console.log(`📚 Total de empréstimos no sistema: ${loansSnapshot.size}`);
      
      if (loansSnapshot.empty) {
        console.log('❌ Nenhum empréstimo encontrado no sistema');
        return [];
      }

      // Contar empréstimos por livro (exatamente como no dashboard)
      const bookBorrowCounts: Record<string, { id: string, title: string, count: number }> = {};
      
      loansSnapshot.docs.forEach(loanDoc => {
        const loan = loanDoc.data();
        if (!bookBorrowCounts[loan.bookId]) {
          bookBorrowCounts[loan.bookId] = {
            id: loan.bookId,
            title: loan.bookTitle || 'Título não disponível',
            count: 0
          };
        }
        bookBorrowCounts[loan.bookId].count++;
      });
      
      // Converter para array e ordenar (igual ao dashboard)
      const topBooksArray = Object.values(bookBorrowCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 livros

      console.log('🏆 TOP 5 livros mais emprestados do sistema:');
      topBooksArray.forEach((book, index) => {
        console.log(`  ${index + 1}. "${book.title}" - ${book.count} empréstimos`);
      });

      // Buscar dados completos dos livros para as recomendações
      const booksRef = collection(db, `users/${userId}/books`);
      const booksSnapshot = await getDocs(booksRef);
      
      const booksMap = new Map();
      booksSnapshot.docs.forEach(bookDoc => {
        const book = bookDoc.data() as Book;
        booksMap.set(bookDoc.id, book);
      });

      // Criar recomendações com dados completos
      const recommendations: BookRecommendation[] = topBooksArray.map(item => {
        const book = booksMap.get(item.id);
        return {
          id: item.id,
          title: item.title,
          authors: book ? (Array.isArray(book.authors) ? book.authors : (book.authors ? [book.authors] : undefined)) : undefined,
          genres: book?.genres,
          borrowCount: item.count,
          description: book?.description
        };
      });

      return [{
        title: 'Livros Mais Populares',
        books: recommendations,
        reason: 'Os livros mais emprestados por todos os estudantes'
      }];
      
    } catch (error) {
      console.error('❌ Erro ao gerar recomendações padrão:', error);
      return [];
    }
  }

  /**
   * Obtém os livros mais populares geral (com cache)
   */
  private async getTopBooks(userId: string, maxBooks: number = 5): Promise<BookRecommendation[]> {
    try {
      // Verificar cache
      if (this.topBooksCache && Date.now() - this.topBooksCache.timestamp < this.CACHE_DURATION) {
        return this.topBooksCache.data.slice(0, maxBooks);
      }

      const booksRef = collection(db, `users/${userId}/books`);
      const booksSnapshot = await getDocs(booksRef);
      
      const booksWithStats = await Promise.all(
        booksSnapshot.docs.map(async (bookDoc) => {
          const book = bookDoc.data() as Book;
          const borrowCount = await this.calculateBookBorrowCount(bookDoc.id, userId); // Usar bookDoc.id
          
        return {
          id: bookDoc.id, // Usar o ID do documento Firebase
          title: book.title,
          authors: Array.isArray(book.authors) ? book.authors : (book.authors ? [book.authors] : undefined),
          genres: book.genres,
          borrowCount,
          description: book.description
        };
        })
      );

      const topBooks = booksWithStats
        .sort((a, b) => b.borrowCount - a.borrowCount)
        .slice(0, 10); // Cache mais livros para futuras consultas

      // Atualizar cache
      this.topBooksCache = {
        data: topBooks,
        timestamp: Date.now()
      };

      return topBooks.slice(0, maxBooks);
    } catch (error) {
      console.error('Erro ao buscar livros mais populares:', error);
      return [];
    }
  }

  /**
   * Calcula quantas vezes um livro foi emprestado
   */
  private async calculateBookBorrowCount(bookId: string, userId: string): Promise<number> {
    try {
      if (!bookId || !userId) {
        console.log(`❌ ID inválido - bookId: ${bookId}, userId: ${userId}`);
        return 0;
      }

      const loansRef = collection(db, `users/${userId}/loans`);
      const q = query(loansRef, where('bookId', '==', bookId));
      const loansSnapshot = await getDocs(q);
      
      console.log(`📊 Livro ${bookId}: ${loansSnapshot.size} empréstimos`);
      return loansSnapshot.size;
    } catch (error) {
      console.error(`❌ Erro ao calcular empréstimos do livro ${bookId}:`, error);
      return 0;
    }
  }

  /**
   * Obtém estatísticas dos gêneros (com cache)
   */
  private async getGenreStatistics(userId: string): Promise<GenreStats> {
    // Verificar cache
    if (this.genreStatsCache && Date.now() - this.genreStatsCache.timestamp < this.CACHE_DURATION) {
      return this.genreStatsCache.data;
    }

    try {
      const loansRef = collection(db, `users/${userId}/loans`);
      const loansSnapshot = await getDocs(loansRef);
      
      const booksRef = collection(db, `users/${userId}/books`);
      const booksSnapshot = await getDocs(booksRef);
      
      // Mapear livros por ID
      const booksMap = new Map<string, Book>();
      booksSnapshot.docs.forEach(doc => {
        const book = doc.data() as Book;
        booksMap.set(book.id, book);
      });

      const genreStats: GenreStats = {};
      
      loansSnapshot.docs.forEach(loanDoc => {
        const loan = loanDoc.data() as Loan;
        const book = booksMap.get(loan.bookId);
        
        if (book && book.genres) {
          book.genres.forEach(genre => {
            genreStats[genre] = (genreStats[genre] || 0) + 1;
          });
        }
      });

      // Atualizar cache
      this.genreStatsCache = {
        data: genreStats,
        timestamp: Date.now()
      };

      return genreStats;
    } catch (error) {
      console.error('Erro ao calcular estatísticas de gêneros:', error);
      return {};
    }
  }

  /**
   * Limpa o cache (útil para testes ou atualizações forçadas)
   */
  clearCache(): void {
    console.log('🧹 Limpando cache de recomendações');
    this.genreStatsCache = null;
    this.topBooksCache = null;
  }

  /**
   * Método para debug - limpa cache e força recálculo
   */
  async debugRecommendations(userId: string, studentId: string): Promise<void> {
    console.log('🔧 Modo DEBUG ativado');
    this.clearCache();
    const result = await this.getRecommendationsForStudent(userId, studentId);
    console.log('🎯 Resultado final das recomendações:', result);
  }
}

// Singleton para garantir uma única instância
export const recommendationService = new RecommendationService();

// Exposer para debug no console do navegador
(window as any).debugRecommendations = (userId: string, studentId: string) => {
  return recommendationService.debugRecommendations(userId, studentId);
};

(window as any).clearRecommendationsCache = () => {
  recommendationService.clearCache();
};
