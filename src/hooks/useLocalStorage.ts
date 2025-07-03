import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // aqui eu guardo o valor atual
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // vou tentar pegar do localStorage
      const item = window.localStorage.getItem(key);
      // se existir, converto de JSON, senão uso o valor inicial
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // se deu erro, melhor usar o valor inicial mesmo
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // função pra atualizar o valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // suporte a função igual no useState normal
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // atualiza o estado
      setStoredValue(valueToStore);
      // e salva no localStorage também
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar no localStorage key "${key}":`, error);
    }
  };

  // remove tudo do localStorage
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