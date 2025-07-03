import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollPositionOptions {
  selector?: string;
  threshold?: number;
  enabled?: boolean;
}

export const useScrollPosition = (options: UseScrollPositionOptions = {}) => {
  const {
    selector,
    threshold = 0,
    enabled = true
  } = options;

  const [isSticky, setIsSticky] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const elementRef = useRef<HTMLElement | null>(null);
  const thresholdRef = useRef<number>(threshold);

  const handleScroll = useCallback(() => {
    if (!enabled) return;

    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);

    let shouldBeSticky = false;

    if (selector) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && !elementRef.current) {
        elementRef.current = element;
        thresholdRef.current = element.offsetTop + threshold;
      }
      shouldBeSticky = currentScrollY >= thresholdRef.current;
    } else {
      shouldBeSticky = currentScrollY >= thresholdRef.current;
    }

    setIsSticky(shouldBeSticky);
  }, [enabled, selector, threshold]);

  useEffect(() => {
    if (!enabled) return;

    // configura o threshold inicial se usar seletor
    if (selector) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        elementRef.current = element;
        thresholdRef.current = element.offsetTop + threshold;
      }
    } else {
      thresholdRef.current = threshold;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    // chama uma vez pra definir o estado inicial
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, selector, threshold, enabled]);

  const scrollTo = useCallback((position: number, behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({ top: position, behavior });
  }, []);

  const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
    scrollTo(0, behavior);
  }, [scrollTo]);

  return {
    isSticky,
    scrollY,
    scrollTo,
    scrollToTop,
  };
}; 