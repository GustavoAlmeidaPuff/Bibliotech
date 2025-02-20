import React, { createContext, useContext, useState } from 'react';

interface AuthorsContextType {
  authors: string[];
  addAuthor: (author: string) => void;
  removeAuthor: (author: string) => void;
  capitalizeAuthor: (author: string) => string;
}

const AuthorsContext = createContext<AuthorsContextType | null>(null);

export const useAuthors = () => {
  const context = useContext(AuthorsContext);
  if (!context) {
    throw new Error('useAuthors must be used within an AuthorsProvider');
  }
  return context;
};

export const AuthorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authors, setAuthors] = useState<string[]>([]);

  const capitalizeAuthor = (author: string): string => {
    return author
      .split(' ')
      .map(word => {
        // Não capitaliza palavras como "de", "da", "do", "dos", "das"
        const lowerCaseWords = ['de', 'da', 'do', 'dos', 'das', 'e'];
        return lowerCaseWords.includes(word.toLowerCase()) 
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const addAuthor = (author: string) => {
    const capitalizedAuthor = capitalizeAuthor(author);
    if (!authors.includes(capitalizedAuthor)) {
      setAuthors(prev => [...prev, capitalizedAuthor].sort());
    }
  };

  const removeAuthor = (author: string) => {
    setAuthors(prev => prev.filter(a => a !== author));
  };

  const value = {
    authors,
    addAuthor,
    removeAuthor,
    capitalizeAuthor
  };

  return (
    <AuthorsContext.Provider value={value}>
      {children}
    </AuthorsContext.Provider>
  );
}; 