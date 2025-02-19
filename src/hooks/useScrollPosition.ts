import { useState, useEffect } from 'react';

export const useScrollPosition = () => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [prevScroll, setPrevScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const isScrolled = currentScroll > 10;
      const isVisible = prevScroll > currentScroll || currentScroll < 10;

      setScrolled(isScrolled);
      setVisible(isVisible);
      setPrevScroll(currentScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScroll]);

  return { scrolled, visible };
}; 