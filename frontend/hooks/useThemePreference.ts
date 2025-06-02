import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from 'eventemitter3';
import { useEffect, useState } from 'react';
import { useColorScheme as _useColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark' | null;
const THEME_PREFERENCE_KEY = 'themePreference';

// Create a global event emitter for theme changes
const themeEmitter = new EventEmitter();
const THEME_CHANGE_EVENT = 'themeChange';

export function useThemePreference() {
  const systemColorScheme = _useColorScheme();
  const [userThemePreference, setUserThemePreference] = useState<ColorScheme | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the saved theme preference on component mount
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const savedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (savedPreference === 'light' || savedPreference === 'dark') {
          setUserThemePreference(savedPreference);
        } else {
          // If no preference is saved, use the system preference
          setUserThemePreference(null);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      } finally {
        setLoading(false);
      }
    }

    loadThemePreference();

    // Listen for theme changes from other components
    const handleThemeChange = (newTheme: ColorScheme) => {
      setUserThemePreference(newTheme);
    };

    themeEmitter.on(THEME_CHANGE_EVENT, handleThemeChange);
    return () => {
      themeEmitter.off(THEME_CHANGE_EVENT, handleThemeChange);
    };
  }, []);

  // Save the theme preference when it changes
  const setThemePreference = async (preference: ColorScheme) => {
    try {
      if (preference === null) {
        await AsyncStorage.removeItem(THEME_PREFERENCE_KEY);
      } else {
        await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
      }
      setUserThemePreference(preference);
      // Emit theme change event
      themeEmitter.emit(THEME_CHANGE_EVENT, preference);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  // If user has a preference, use it, otherwise fall back to system preference
  const colorScheme = userThemePreference || systemColorScheme || 'dark';
  
  // Create a function specifically to toggle dark mode
  const toggleDarkMode = (isDarkMode: boolean) => {
    setThemePreference(isDarkMode ? 'dark' : 'light');
  };

  return {
    colorScheme,
    isDarkMode: colorScheme === 'dark',
    setThemePreference,
    toggleDarkMode,
    loading,
  };
}
