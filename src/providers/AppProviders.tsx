import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { StudentAuthProvider } from '../contexts/StudentAuthContext';
import { TagsProvider } from '../contexts/TagsContext';
import { AuthorsProvider } from '../contexts/AuthorsContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { ThemeProvider } from '../styles/ThemeProvider';
import { NotificationsProvider } from '../contexts/NotificationsContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

// Provedor unificado que combina todos os providers necessários
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationsProvider>
          <TagsProvider>
            <AuthorsProvider>
              <StudentAuthProvider>
                <ThemeProvider>
                  {children}
                </ThemeProvider>
              </StudentAuthProvider>
            </AuthorsProvider>
          </TagsProvider>
        </NotificationsProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default AppProviders; 