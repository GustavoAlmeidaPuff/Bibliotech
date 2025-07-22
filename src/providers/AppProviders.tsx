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

// Core providers that affect authentication and theming
const CoreProviders: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => (
  <AuthProvider>
    <SettingsProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SettingsProvider>
  </AuthProvider>
));

// Data providers that can be lazy-loaded
const DataProviders: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => (
  <NotificationsProvider>
    <TagsProvider>
      <AuthorsProvider>
        <StudentAuthProvider>
          {children}
        </StudentAuthProvider>
      </AuthorsProvider>
    </TagsProvider>
  </NotificationsProvider>
));

// Provedor unificado que combina todos os providers necessários
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <CoreProviders>
      <DataProviders>
        {children}
      </DataProviders>
    </CoreProviders>
  );
};

export default AppProviders; 