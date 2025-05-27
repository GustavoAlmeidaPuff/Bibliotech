import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants';

export const useIsMobile = (breakpoint: string = BREAKPOINTS.MOBILE) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= parseInt(breakpoint));
    };

    // Verificar no carregamento inicial
    checkIsMobile();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
}; 