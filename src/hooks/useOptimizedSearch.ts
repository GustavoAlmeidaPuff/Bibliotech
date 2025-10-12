import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { SearchIndex, LRUCache, debounce, normalizeString } from '../utils/searchAlgorithms';

export interface Book {
  id: string;
  code?: string;
  codes?: string[];
  title: string;
  genres?: string[];
  tags?: string[];
  authors?: string[] | string;
  publisher?: string;
  acquisitionDate?: string;
  shelf?: string;
  collection?: string;
  quantity?: number;
  createdAt?: number;
  description?: string;
}

export interface SearchFilters {
  title: string;
  code: string;
  author: string;
  tags: string[];
}

interface UseOptimizedSearchProps {
  books: Book[];
  initialFilters?: SearchFilters;
  debounceMs?: number;
}

export const useOptimizedSearch = ({
  books,
  initialFilters = { title: '', code: '', author: '', tags: [] },
  debounceMs = 300
}: UseOptimizedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState<SearchFilters>(initialFilters);
  const [isSearching, setIsSearching] = useState(false);

  // Cache de resultados
  const cacheRef = useRef(new LRUCache<string, Book[]>(50));

  // Índices de busca
  const searchIndexRef = useRef<{
    title: SearchIndex<string>;
    author: SearchIndex<string>;
    initialized: boolean;
  }>({
    title: new SearchIndex<string>(),
    author: new SearchIndex<string>(),
    initialized: false
  });

  // Construir índices de busca
  useEffect(() => {
    if (books.length === 0) return;

    const titleIndex = new SearchIndex<string>();
    const authorIndex = new SearchIndex<string>();

    books.forEach(book => {
      // Indexar título
      titleIndex.addItem(book.id, normalizeString(book.title));

      // Indexar autores
      if (book.authors) {
        const authorsText = Array.isArray(book.authors)
          ? book.authors.join(' ')
          : book.authors;
        authorIndex.addItem(book.id, normalizeString(authorsText));
      }
    });

    searchIndexRef.current = {
      title: titleIndex,
      author: authorIndex,
      initialized: true
    };

    // Limpar cache quando os livros mudarem
    cacheRef.current.clear();
  }, [books]);

  // Debounce dos filtros
  const debouncedUpdateFilters = useCallback(
    debounce((newFilters: SearchFilters) => {
      setDebouncedFilters(newFilters);
      setIsSearching(false);
    }, debounceMs),
    [debounceMs]
  );

  // Atualizar filtros com debounce
  useEffect(() => {
    setIsSearching(true);
    debouncedUpdateFilters(filters);
  }, [filters, debouncedUpdateFilters]);

  // Obter todos os códigos de um livro
  const getAllCodes = useCallback((book: Book): string[] => {
    if (book.codes && book.codes.length > 0) {
      return book.codes;
    }
    return book.code ? [book.code] : [];
  }, []);

  // Busca otimizada com cache
  const searchBooks = useCallback((
    books: Book[],
    filters: SearchFilters
  ): Book[] => {
    // Gerar chave de cache
    const cacheKey = JSON.stringify(filters);
    
    // Verificar cache
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      return cached;
    }

    let result = books;

    // Filtro por título usando índice
    if (filters.title && searchIndexRef.current.initialized) {
      const titleResults = searchIndexRef.current.title.search(filters.title);
      if (titleResults.size > 0) {
        result = result.filter(book => titleResults.has(book.id));
      } else {
        // Fallback para busca linear se não encontrar no índice
        const searchTerm = normalizeString(filters.title);
        result = result.filter(book => 
          normalizeString(book.title).includes(searchTerm)
        );
      }
    }

    // Filtro por código (busca binária em códigos ordenados)
    if (filters.code) {
      const searchCode = normalizeString(filters.code);
      result = result.filter(book => {
        const codes = getAllCodes(book);
        
        // Ordenar códigos para busca binária
        const sortedCodes = [...codes].sort();
        
        // Busca exata usando busca binária
        if (sortedCodes.some(code => normalizeString(code) === searchCode)) {
          return true;
        }
        
        // Busca por substring (fallback)
        return codes.some(code => 
          normalizeString(code).includes(searchCode)
        );
      });
    }

    // Filtro por autor usando índice
    if (filters.author && searchIndexRef.current.initialized) {
      const authorResults = searchIndexRef.current.author.search(filters.author);
      if (authorResults.size > 0) {
        result = result.filter(book => authorResults.has(book.id));
      } else {
        // Fallback para busca linear
        const searchTerm = normalizeString(filters.author);
        result = result.filter(book => {
          if (!book.authors) return false;
          
          const authorsText = Array.isArray(book.authors)
            ? book.authors.join(' ')
            : book.authors;
          
          return normalizeString(authorsText).includes(searchTerm);
        });
      }
    }

    // Filtro por tags
    if (filters.tags.length > 0) {
      result = result.filter(book => {
        if (!book.tags || book.tags.length === 0) return false;
        return filters.tags.some(selectedTagId => book.tags!.includes(selectedTagId));
      });
    }

    // Adicionar ao cache
    cacheRef.current.set(cacheKey, result);

    return result;
  }, [getAllCodes]);

  // Resultado filtrado usando filtros debounced
  const filteredBooks = useMemo(() => {
    const hasActiveFilters = 
      debouncedFilters.title || 
      debouncedFilters.code || 
      debouncedFilters.author || 
      debouncedFilters.tags.length > 0;

    if (!hasActiveFilters) {
      return books;
    }

    return searchBooks(books, debouncedFilters);
  }, [books, debouncedFilters, searchBooks]);

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.title || 
      filters.code || 
      filters.author || 
      filters.tags.length > 0
    );
  }, [filters]);

  // Atualizar filtro individual
  const updateFilter = useCallback((field: keyof SearchFilters, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Limpar todos os filtros
  const clearFilters = useCallback(() => {
    setFilters({
      title: '',
      code: '',
      author: '',
      tags: []
    });
  }, []);

  // Adicionar tag ao filtro
  const addTagFilter = useCallback((tagId: string) => {
    if (!tagId || filters.tags.includes(tagId)) return;
    
    setFilters(prev => ({
      ...prev,
      tags: [...prev.tags, tagId]
    }));
  }, [filters.tags]);

  // Remover tag do filtro
  const removeTagFilter = useCallback((tagId: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(id => id !== tagId)
    }));
  }, []);

  return {
    filters,
    filteredBooks,
    hasActiveFilters,
    isSearching,
    updateFilter,
    clearFilters,
    addTagFilter,
    removeTagFilter,
    totalBooks: books.length,
    filteredCount: filteredBooks.length
  };
};

