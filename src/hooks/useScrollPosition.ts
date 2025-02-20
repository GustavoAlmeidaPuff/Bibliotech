import { useState, useEffect, useRef } from 'react';

export const useScrollPosition = () => {
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const navPositionRef = useRef<number | null>(null);

  useEffect(() => {
    const nav = document.querySelector('.nav') as HTMLElement;
    if (nav) {
      navRef.current = nav;
      // Guarda a posição original do nav
      navPositionRef.current = nav.offsetTop;
    }

    const handleScroll = () => {
      if (navPositionRef.current !== null) {
        const shouldBeSticky = window.scrollY >= navPositionRef.current;
        setIsSticky(shouldBeSticky);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Chama uma vez para definir o estado inicial
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isSticky };
}; 