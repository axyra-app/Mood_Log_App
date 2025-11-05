import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cargar tema inicial desde localStorage o preferencia del sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    setIsDarkMode(initialDarkMode);

    // Aplicar tema inicial
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Escuchar cambios de preferencia del sistema si el usuario no ha fijado uno manual
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      const userSet = localStorage.getItem('theme');
      if (!userSet) {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  // Función para cambiar el modo oscuro
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Guardar en localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');

    // Aplicar clases CSS inmediatamente
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(
      new CustomEvent('themeChanged', {
        detail: { isDarkMode: newDarkMode },
      })
    );
  };

  // Función para establecer modo oscuro específico
  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);

    // Guardar en localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Aplicar clases CSS inmediatamente
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Disparar evento personalizado
    window.dispatchEvent(
      new CustomEvent('themeChanged', {
        detail: { isDarkMode: isDark },
      })
    );
  };

  // Escuchar cambios de tema desde otros tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const newDarkMode = e.newValue === 'dark';
        setIsDarkMode(newDarkMode);

        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    // Escuchar evento personalizado de cambio de tema
    const handleThemeChange = (e: CustomEvent) => {
      const { isDarkMode: newDarkMode } = e.detail;
      setIsDarkMode(newDarkMode);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChanged', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, []);

  const value: ThemeContextType = {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
