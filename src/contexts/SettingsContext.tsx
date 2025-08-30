import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, getFirestore } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export type ThemeColor = 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'brown';

export interface LibrarySettings {
  schoolName: string;
  loanDuration: number;
  maxBooksPerStudent: number;
  enableNotifications: boolean;
  showOverdueWarnings: boolean;
  allowDashboard: boolean;
  themeColor: ThemeColor;
  useDistinctCodes: boolean;
  useGuardianContact: boolean;
}

interface SettingsContextType {
  settings: LibrarySettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<LibrarySettings>) => Promise<void>;
  saveSettings: () => Promise<void>;
}

const defaultSettings: LibrarySettings = {
  schoolName: 'School Library System',
  loanDuration: 14,
  maxBooksPerStudent: 3,
  enableNotifications: true,
  showOverdueWarnings: true,
  allowDashboard: true,
  themeColor: 'blue',
  useDistinctCodes: false,
  useGuardianContact: false
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<LibrarySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const db = getFirestore();
        const settingsRef = doc(db, `users/${currentUser.uid}/settings/library`);
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as LibrarySettings;
          setSettings({
            ...defaultSettings,
            ...data
          });
        } else {
          // cria documento de configurações padrão se não existir
          await setDoc(settingsRef, {
            ...defaultSettings,
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentUser]);

  const updateSettings = async (newSettings: Partial<LibrarySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const saveSettings = async () => {
    if (!currentUser) return;

    try {
      const db = getFirestore();
      const settingsRef = doc(db, `users/${currentUser.uid}/settings/library`);
      
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: new Date()
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      return Promise.reject(error);
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
    saveSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext; 