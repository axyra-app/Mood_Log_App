import { ReactNode, createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const getInitialTheme = (): boolean => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (isDark: boolean): void => {
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  useLayoutEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const setDarkMode = useCallback((isDark: boolean) => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!isDarkMode);
  }, [isDarkMode, setDarkMode]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== 'theme') return;

      if (event.newValue === 'dark' || event.newValue === 'light') {
        setIsDarkMode(event.newValue === 'dark');
      } else {
        setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    };

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === null) {
        setIsDarkMode(event.matches);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    media.addEventListener('change', handleSystemThemeChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      media.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
