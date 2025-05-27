import { useState, useCallback } from 'react';
import { AsyncState, LoadingState } from '../types/common';

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState(prev => ({ ...prev, status: 'loading', error: null }));

    try {
      const data = await asyncFunction();
      setState({ data, status: 'success', error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: errorMessage 
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      status: 'idle',
      error: null,
    });
  }, []);

  const setStatus = useCallback((status: LoadingState) => {
    setState(prev => ({ ...prev, status }));
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, status: 'error' }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setStatus,
    setData,
    setError,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    isIdle: state.status === 'idle',
  };
} 