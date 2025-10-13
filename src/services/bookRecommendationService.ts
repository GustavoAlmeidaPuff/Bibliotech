import { 
  collection, 
  getDocs,
  query,
  orderBy,
  limit,
  where
} from 'firebase/firestore';
import { db } from './firebase';

export interface BookWithStats {
  id: string;
  title: string;
  authors: string[];
  genres: string[];
  description?: string;
  loanCount: number;
  available: boolean;
  lastLoanDate?: Date;
  createdAt: Date;
  coverUrl?: string;
}

export interface RecommendationSection {
  title: string;
  books: BookWithStats[];
  emoji: string;
}

export const bookRecommendationService = {
  /**
   * Busca todos os livros da escola com estatísticas reais
   */
  getAllBooksWithStats: async (schoolId: string): Promise<BookWithStats[]> => {
    try {
      console.log(`📚 Buscando todos os livros da escola ${schoolId}...`);
      
      // Buscar todos os livros
      const booksRef = collection(db, `users/${schoolId}/books`);
      const booksSnapshot = await getDocs(booksRef);
      
      if (booksSnapshot.empty) {
        console.log('📭 Nenhum livro encontrado');
        return [];
      }

      // Buscar todos os empréstimos para calcular estatísticas
      const loansRef = collection(db, `users/${schoolId}/loans`);
      const loansSnapshot = await getDocs(loansRef);
      
      // Calcular estatísticas de empréstimo por livro
      const loanStats: { [bookId: string]: { count: number; lastDate?: Date } } = {};
      
      loansSnapshot.docs.forEach(doc => {
        const loanData = doc.data();
        const bookId = loanData.bookId;
        
        if (!loanStats[bookId]) {
          loanStats[bookId] = { count: 0 };
        }
        
        loanStats[bookId].count += 1;
        
        // Atualizar última data de empréstimo
        const borrowDate = loanData.borrowDate?.toDate ? loanData.borrowDate.toDate() : new Date();
        if (!loanStats[bookId].lastDate || borrowDate > loanStats[bookId].lastDate!) {
          loanStats[bookId].lastDate = borrowDate;
        }
      });

      // Processar livros com estatísticas
      const booksWithStats: BookWithStats[] = booksSnapshot.docs.map(doc => {
        const bookData = doc.data();
        const bookId = doc.id;
        const stats = loanStats[bookId] || { count: 0 };
        
        // Garantir que authors seja sempre um array
        let authors: string[] = [];
        if (bookData.authors) {
          if (Array.isArray(bookData.authors)) {
            authors = bookData.authors;
          } else if (typeof bookData.authors === 'string') {
            authors = [bookData.authors];
          }
        }
        
        // Garantir que genres seja sempre um array
        let genres: string[] = [];
        if (bookData.genres) {
          if (Array.isArray(bookData.genres)) {
            genres = bookData.genres;
          } else if (typeof bookData.genres === 'string') {
            genres = [bookData.genres];
          }
        }
        
        return {
          id: bookId,
          title: bookData.title || 'Título não informado',
          authors,
          genres,
          description: bookData.description,
          loanCount: stats.count,
          available: bookData.available !== false, // Default true se não especificado
          lastLoanDate: stats.lastDate,
          createdAt: bookData.createdAt?.toDate ? bookData.createdAt.toDate() : new Date(),
          coverUrl: bookData.coverUrl
        };
      });

      console.log(`✅ ${booksWithStats.length} livros carregados com estatísticas`);
      return booksWithStats;
    } catch (error) {
      console.error('Erro ao buscar livros com estatísticas:', error);
      throw new Error('Erro ao carregar livros da biblioteca.');
    }
  },

  /**
   * Gera seções de recomendação baseadas nos dados reais
   */
  generateRecommendations: (books: BookWithStats[]): RecommendationSection[] => {
    if (books.length === 0) return [];

    const sections: RecommendationSection[] = [];

    // 1. Mais Retirados (Top 10)
    const mostPopular = [...books]
      .sort((a, b) => b.loanCount - a.loanCount)
      .slice(0, 10);
    
    if (mostPopular.length > 0) {
      sections.push({
        title: 'Mais Retirados',
        books: mostPopular,
        emoji: '🔥'
      });
    }

    // 2. Novidades (últimos 10 adicionados)
    const newest = [...books]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
    
    if (newest.length > 0) {
      sections.push({
        title: 'Novidades',
        books: newest,
        emoji: '✨'
      });
    }

    // 3. Categorias populares
    const genreStats: { [genre: string]: { count: number; books: BookWithStats[] } } = {};
    
    books.forEach(book => {
      book.genres.forEach(genre => {
        if (!genreStats[genre]) {
          genreStats[genre] = { count: 0, books: [] };
        }
        genreStats[genre].count += book.loanCount;
        genreStats[genre].books.push(book);
      });
    });

    // Ordenar gêneros por popularidade e pegar os top 5
    const topGenres = Object.entries(genreStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    topGenres.forEach(([genre, data]) => {
      // Pegar os top 8 livros de cada gênero
      const topBooksInGenre = data.books
        .sort((a, b) => b.loanCount - a.loanCount)
        .slice(0, 8);
      
      if (topBooksInGenre.length > 0) {
        sections.push({
          title: `${genre}`,
          books: topBooksInGenre,
          emoji: getGenreEmoji(genre)
        });
      }
    });

    // 4. Disponíveis Agora (livros com mais empréstimos que estão disponíveis)
    const availablePopular = books
      .filter(book => book.available && book.loanCount > 0)
      .sort((a, b) => b.loanCount - a.loanCount)
      .slice(0, 8);
    
    if (availablePopular.length > 0) {
      sections.push({
        title: 'Disponíveis Agora',
        books: availablePopular,
        emoji: '📖'
      });
    }

    return sections;
  },

  /**
   * Busca livros por termo de pesquisa
   */
  searchBooks: (books: BookWithStats[], searchTerm: string): BookWithStats[] => {
    if (!searchTerm.trim()) return books;

    const term = searchTerm.toLowerCase().trim();
    
    return books.filter(book => {
      // Buscar no título
      if (book.title.toLowerCase().includes(term)) return true;
      
      // Buscar nos autores
      if (book.authors.some(author => author.toLowerCase().includes(term))) return true;
      
      // Buscar nos gêneros
      if (book.genres.some(genre => genre.toLowerCase().includes(term))) return true;
      
      // Buscar na descrição
      if (book.description && book.description.toLowerCase().includes(term)) return true;
      
      return false;
    });
  }
};

/**
 * Retorna emoji apropriado para cada gênero
 */
function getGenreEmoji(genre: string): string {
  const genreLower = genre.toLowerCase();
  
  if (genreLower.includes('romance') || genreLower.includes('amor')) return '💕';
  if (genreLower.includes('ficção') || genreLower.includes('fantasia')) return '✨';
  if (genreLower.includes('terror') || genreLower.includes('horror')) return '👻';
  if (genreLower.includes('mistério') || genreLower.includes('suspense')) return '🔍';
  if (genreLower.includes('ciência') || genreLower.includes('tecnologia')) return '🔬';
  if (genreLower.includes('história')) return '📜';
  if (genreLower.includes('biografia') || genreLower.includes('memórias')) return '👤';
  if (genreLower.includes('aventura') || genreLower.includes('ação')) return '⚔️';
  if (genreLower.includes('humor') || genreLower.includes('comédia')) return '😄';
  if (genreLower.includes('drama') || genreLower.includes('literatura')) return '🎭';
  if (genreLower.includes('infantil') || genreLower.includes('criança')) return '🧸';
  if (genreLower.includes('educativo') || genreLower.includes('didático')) return '📚';
  
  return '📖'; // Default
}
