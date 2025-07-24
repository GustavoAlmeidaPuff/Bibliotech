import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
  items: T[];
  itemsPerPage?: number;
  threshold?: number;
  enabled?: boolean;
}

export const useInfiniteScroll = <T>({
  items,
  itemsPerPage = 30,
  threshold = 100,
  enabled = true
}: UseInfiniteScrollOptions<T>) => {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination when items change
  useEffect(() => {
    setCurrentPage(1);
    setDisplayedItems(items.slice(0, itemsPerPage));
    setHasMore(items.length > itemsPerPage);
    setIsLoading(false);
  }, [items, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * itemsPerPage;
      const newItems = items.slice(startIndex, endIndex);
      
      setDisplayedItems(newItems);
      setCurrentPage(nextPage);
      setHasMore(endIndex < items.length);
      setIsLoading(false);
    }, 100);
  }, [currentPage, hasMore, isLoading, items, itemsPerPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!enabled || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, isLoading, loadMore, threshold]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setDisplayedItems(items.slice(0, itemsPerPage));
    setHasMore(items.length > itemsPerPage);
    setIsLoading(false);
  }, [items, itemsPerPage]);

  return {
    displayedItems,
    hasMore,
    isLoading,
    loadingRef,
    resetPagination,
    currentPage,
    totalItems: items.length
  };
}; 