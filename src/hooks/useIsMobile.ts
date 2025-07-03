import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants';

export const useIsMobile = (breakpoint: string = BREAKPOINTS.MOBILE) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= parseInt(breakpoint));
    };

    // verifica no carregamento inicial
    checkIsMobile();

    // adiciona listener para mudanças de tamanho
    window.addEventListener('resize', checkIsMobile);

    // cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
}; 