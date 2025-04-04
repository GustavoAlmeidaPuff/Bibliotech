import React, { useEffect } from 'react';
import { useSettings, ThemeColor } from '../../contexts/SettingsContext';

// Definindo as cores para cada tema
const themeColorValues: Record<ThemeColor, { primary: string; hover: string; light: string }> = {
  blue: {
    primary: '#4285f4',
    hover: '#3367d6',
    light: '#e8f0fe'
  },
  red: {
    primary: '#db4437',
    hover: '#c31f10',
    light: '#fce8e6'
  },
  green: {
    primary: '#0f9d58',
    hover: '#0b8043',
    light: '#e6f4ea'
  },
  purple: {
    primary: '#673ab7',
    hover: '#512da8',
    light: '#ede7f6'
  },
  orange: {
    primary: '#ff5722',
    hover: '#e64a19',
    light: '#fbe9e7'
  },
  brown: {
    primary: '#795548',
    hover: '#5d4037',
    light: '#efebe9'
  }
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings } = useSettings();

  useEffect(() => {
    // Aplicar a cor do tema como variáveis CSS
    const themeColors = themeColorValues[settings.themeColor];
    
    document.documentElement.style.setProperty('--primary-color', themeColors.primary);
    document.documentElement.style.setProperty('--primary-color-hover', themeColors.hover);
    document.documentElement.style.setProperty('--primary-color-light', themeColors.light);
    
    // Atualizar a cor da barra de navegação em dispositivos móveis
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColors.primary);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = themeColors.primary;
      document.head.appendChild(meta);
    }
  }, [settings.themeColor]);

  return <>{children}</>;
};

export default ThemeProvider; 