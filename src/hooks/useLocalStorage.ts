import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Buscar do localStorage se existir
      const item = window.localStorage.getItem(key);
      // Parse do JSON guardado ou retorna valor inicial
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se erro, retorna valor inicial
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Função para definir o valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite valor ser uma função como useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Salva no estado
      setStoredValue(valueToStore);
      // Salva no localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar no localStorage key "${key}":`, error);
    }
  };

  // Remove do localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover do localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
} 