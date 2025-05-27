import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { StudentAuthProvider } from '../contexts/StudentAuthContext';
import { TagsProvider } from '../contexts/TagsContext';
import { AuthorsProvider } from '../contexts/AuthorsContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { ThemeProvider } from '../styles/ThemeProvider';
import CustomThemeProvider from '../components/theme/ThemeProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

// Provedor unificado que combina todos os providers necessários
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <TagsProvider>
          <AuthorsProvider>
            <SettingsProvider>
              <ThemeProvider>
                <CustomThemeProvider>
                  {children}
                </CustomThemeProvider>
              </ThemeProvider>
            </SettingsProvider>
          </AuthorsProvider>
        </TagsProvider>
      </StudentAuthProvider>
    </AuthProvider>
  );
};

export default AppProviders; 