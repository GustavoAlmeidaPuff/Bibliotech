import React, { createContext, useContext, useState } from 'react';

// Lista inicial de gêneros/classes sugeridos
const INITIAL_GENRES = [
  'Romance',
  'Ficção Científica',
  'Fantasia',
  'Terror',
  'Suspense',
  'Drama',
  'Aventura',
  'História',
  'Biografia',
  'Autoajuda',
  'Educacional',
  'Infantil',
  'Juvenil',
  'Técnico',
  'Científico',
  'Literatura Brasileira',
  'Literatura Estrangeira',
  'Poesia',
  'Quadrinhos',
  'Mangá',
  'Religião',
  'Filosofia',
  'Psicologia',
  'Sociologia',
  'Política',
  'Economia',
  'Direito',
  'Medicina',
  'Engenharia',
  'Informática'
].sort();

interface TagsContextType {
  genres: string[];
  addGenre: (genre: string) => void;
  removeGenre: (genre: string) => void;
  capitalizeTag: (tag: string) => string;
}

const TagsContext = createContext<TagsContextType | null>(null);

export const useTags = () => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
};

export const TagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [genres, setGenres] = useState<string[]>(INITIAL_GENRES);

  const capitalizeTag = (tag: string): string => {
    return tag
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const addGenre = (genre: string) => {
    const capitalizedGenre = capitalizeTag(genre);
    if (!genres.includes(capitalizedGenre)) {
      setGenres(prev => [...prev, capitalizedGenre].sort());
    }
  };

  const removeGenre = (genre: string) => {
    setGenres(prev => prev.filter(g => g !== genre));
  };

  const value = {
    genres,
    addGenre,
    removeGenre,
    capitalizeTag
  };

  return (
    <TagsContext.Provider value={value}>
      {children}
    </TagsContext.Provider>
  );
}; 