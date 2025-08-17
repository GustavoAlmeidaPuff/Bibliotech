import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CacheInvalidationOptions {
  onInvalidate: () => void;
  watchRoutes?: string[];
  invalidateOnNavigation?: boolean;
}

/**
 * Hook para gerenciar invalidação inteligente de cache
 * Invalida o cache quando detecta mudanças importantes nos dados
 */
export function useCacheInvalidation(options: CacheInvalidationOptions) {
  const { currentUser } = useAuth();
  const { onInvalidate, watchRoutes = [], invalidateOnNavigation = true } = options;

  // Listener para storage events (quando outros tabs invalidam cache)
  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (e.key === `cache_invalidation_${currentUser?.uid}`) {
      const invalidationData = e.newValue ? JSON.parse(e.newValue) : null;
      
      if (invalidationData?.timestamp > Date.now() - 5000) { // Últimos 5 segundos
        console.log('Cache invalidation triggered by storage event:', invalidationData.reason);
        onInvalidate();
      }
    }
  }, [currentUser?.uid, onInvalidate]);

  // Listener para mudanças na página (page visibility)
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      // Quando a página fica visível novamente, verifica se o cache deve ser invalidado
      const lastInvalidation = localStorage.getItem(`cache_invalidation_${currentUser?.uid}`);
      
      if (lastInvalidation) {
        const data = JSON.parse(lastInvalidation);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        
        if (data.timestamp > fiveMinutesAgo) {
          console.log('Cache invalidation on page focus:', data.reason);
          onInvalidate();
        }
      }
    }
  }, [currentUser?.uid, onInvalidate]);

  // Registra listeners
  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleStorageChange, handleVisibilityChange]);

  // Função para invalidar cache programaticamente
  const invalidateCache = useCallback((reason: string) => {
    const invalidationData = {
      timestamp: Date.now(),
      reason,
      userId: currentUser?.uid
    };

    // Salva no localStorage para outros tabs/instâncias
    localStorage.setItem(
      `cache_invalidation_${currentUser?.uid}`, 
      JSON.stringify(invalidationData)
    );

    // Dispara evento de storage para notificar outras instâncias
    window.dispatchEvent(new StorageEvent('storage', {
      key: `cache_invalidation_${currentUser?.uid}`,
      newValue: JSON.stringify(invalidationData),
      oldValue: null
    }));

    console.log('Cache invalidated:', reason);
    onInvalidate();
  }, [currentUser?.uid, onInvalidate]);

  return {
    invalidateCache
  };
}

/**
 * Hook específico para invalidação do cache do dashboard
 * Deve ser usado em componentes que fazem alterações que afetam o dashboard
 */
export function useDashboardCacheInvalidation() {
  const { currentUser } = useAuth();

  const invalidateDashboardCache = useCallback((reason: string) => {
    const invalidationData = {
      timestamp: Date.now(),
      reason: `Dashboard: ${reason}`,
      userId: currentUser?.uid,
      target: 'dashboard'
    };

    localStorage.setItem(
      `cache_invalidation_${currentUser?.uid}`, 
      JSON.stringify(invalidationData)
    );

    // Dispara evento de storage
    window.dispatchEvent(new StorageEvent('storage', {
      key: `cache_invalidation_${currentUser?.uid}`,
      newValue: JSON.stringify(invalidationData),
      oldValue: null
    }));

    console.log('Dashboard cache invalidated:', reason);
  }, [currentUser?.uid]);

  // Funções específicas para cada ação que afeta o dashboard
  const onBookAdded = useCallback(() => {
    invalidateDashboardCache('Novo livro adicionado');
  }, [invalidateDashboardCache]);

  const onBookUpdated = useCallback(() => {
    invalidateDashboardCache('Livro atualizado');
  }, [invalidateDashboardCache]);

  const onBookDeleted = useCallback(() => {
    invalidateDashboardCache('Livro removido');
  }, [invalidateDashboardCache]);

  const onLoanCreated = useCallback(() => {
    invalidateDashboardCache('Novo empréstimo criado');
  }, [invalidateDashboardCache]);

  const onLoanReturned = useCallback(() => {
    invalidateDashboardCache('Livro devolvido');
  }, [invalidateDashboardCache]);

  const onStudentAdded = useCallback(() => {
    invalidateDashboardCache('Novo aluno adicionado');
  }, [invalidateDashboardCache]);

  const onStudentUpdated = useCallback(() => {
    invalidateDashboardCache('Dados do aluno atualizados');
  }, [invalidateDashboardCache]);

  const onStudentDeleted = useCallback(() => {
    invalidateDashboardCache('Aluno removido');
  }, [invalidateDashboardCache]);

  return {
    invalidateDashboardCache,
    onBookAdded,
    onBookUpdated,
    onBookDeleted,
    onLoanCreated,
    onLoanReturned,
    onStudentAdded,
    onStudentUpdated,
    onStudentDeleted
  };
}
