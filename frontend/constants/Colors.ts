/**
 * Colors used throughout the app in light and dark modes.
 */

const tintColorLight = '#0a7ea4';
const primaryDark = '#BB86FC'; // A modern purple for primary actions
const accentDark = '#4CD964'; // Green accent color for consistency
const backgroundDark = '#121212'; // Deep dark background
const surfaceDark = '#1E1E1E'; // Slightly lighter dark for cards, etc.
const textPrimaryDark = '#E0E0E0'; // Light grey for primary text
const textSecondaryDark = '#B0B0B0'; // Medium grey for secondary text

const warningColor = '#F59E0B'; // Amber warning color
const successColor = '#4CD964'; // Green success color
const errorLight = '#B00020'; // Error color for light theme
const errorDark = '#CF6679'; // Error color for dark theme

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Theme colors
    primary: '#0a7ea4',
    accent: successColor,
    surface: '#f5f5f5',
    textPrimary: '#11181C',
    textSecondary: '#687076',
    onPrimary: '#FFFFFF',
    onSurface: '#11181C',
    error: errorLight,
    warning: warningColor,
    success: successColor,
    border: 'rgba(0,0,0,0.1)',
    // Chat specific colors
    chatBubbleMe: successColor,
    chatBubbleOther: '#F1F1F1',
    chatInputBackground: '#F5F5F5',
    chatInputBorder: '#E0E0E0',
    chatInputText: '#000000',
    chatSendButton: successColor,
  },
  dark: {
    text: textPrimaryDark,
    background: backgroundDark,
    tint: primaryDark,
    icon: textSecondaryDark,
    tabIconDefault: textSecondaryDark,
    tabIconSelected: primaryDark,
    // Theme colors
    primary: primaryDark,
    accent: accentDark,
    backgroundDark: backgroundDark,
    surface: surfaceDark,
    textPrimary: textPrimaryDark,
    textSecondary: textSecondaryDark,
    error: errorDark,
    warning: warningColor,
    success: successColor,
    onPrimary: '#000000',
    onSurface: textPrimaryDark,
    border: 'rgba(255,255,255,0.1)',
    // Chat specific colors
    chatBubbleMe: successColor,
    chatBubbleOther: '#FFFFFF',
    chatInputBackground: surfaceDark,
    chatInputBorder: '#333',
    chatInputText: textPrimaryDark,
    chatSendButton: primaryDark,
  },
};
