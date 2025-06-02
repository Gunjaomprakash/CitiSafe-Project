import { useThemePreference } from './useThemePreference';

// Create a hook that is compatible with the existing useColorScheme
export function useColorScheme() {
  const { colorScheme } = useThemePreference();
  return colorScheme;
}

// Export the full theme preference hook for more control
export { useThemePreference };
