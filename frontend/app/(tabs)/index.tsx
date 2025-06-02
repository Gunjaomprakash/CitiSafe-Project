import { Colors } from '@/constants/Colors';
import { useThemePreference } from '@/hooks/useThemePreference';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle
} from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: number; // Now required
}

type ColorPalette = typeof Colors['light'] & typeof Colors['dark'] & {
    onPrimary: string;
    chatBubbleMe: string;
    chatBubbleOther: string;
    chatInputBackground: string;
    chatInputBorder: string;
    chatInputText: string;
    chatSendButton: string;
    error: string; // Added error from dark theme
    onSurface: string; // Added onSurface from dark theme
    primary: string; // Ensure primary is included
    accent: string; // Ensure accent is included
    surface: string; // Ensure surface is included
    textPrimary: string; // Ensure textPrimary is included
    textSecondary: string; // Ensure textSecondary is included
    tint: string; // Ensure tint is included
    icon: string; // Ensure icon is included
    tabIconDefault: string; // Ensure tabIconDefault is included
    tabIconSelected: string; // Ensure tabIconSelected is included
    backgroundDark?: string; // Optional property specific to dark theme
    _colorScheme?: 'light' | 'dark'; // Add a way to track the active scheme
};

// Define dynamic styles as functions outside StyleSheet.create with type annotations
const myMessageStyle = (colors: ColorPalette): ViewStyle => ({
    alignSelf: 'flex-end',
    backgroundColor: colors.chatBubbleMe || '#4CD964', // Green fallback for user messages
    marginRight: 0, // Remove right margin from bubble when wrapper is aligned right
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '100%', // Allow bubble to take full width of wrapper
});

const otherMessageStyle = (colors: ColorPalette): ViewStyle => ({
    alignSelf: 'flex-start',
    backgroundColor: colors.chatBubbleOther || '#FFFFFF', // White fallback for system responses
    marginLeft: 0, // Remove left margin from bubble when wrapper is aligned left
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '100%', // Allow bubble to take full width of wrapper
});

const myMessageTextStyle = (colors: ColorPalette): TextStyle => ({
    color: '#FFFFFF', // White text for green bubbles
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue' : 'sans-serif-medium',
    fontWeight: 'bold',
});

const otherMessageTextStyle = (colors: ColorPalette): TextStyle => ({
    color: '#000000', // Black text for white bubbles
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue' : 'sans-serif',
    fontWeight: 'normal',
});

const inputContainerStyle = (colors: ColorPalette): ViewStyle => ({
  flexDirection: 'row',
  paddingHorizontal: 14,
  paddingVertical: 7,
  backgroundColor: colors.chatInputBackground || (colors._colorScheme === 'dark' ? 'rgba(20, 20, 20, 0.9)' : '#F5F5F5'), 
  borderRadius: 22,
  marginHorizontal: 16,
  marginBottom: 75, // Reduced margin to pull up the dock
  alignItems: 'center',
  shadowColor: colors._colorScheme === 'dark' ? '#000' : '#00000040',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 3,
  elevation: 3,
  borderWidth: 0.5,
  borderColor: colors.chatInputBorder || (colors._colorScheme === 'dark' ? '#FFFFFF55' : '#E0E0E0'),
});

const inputStyle = (colors: ColorPalette): TextStyle => ({
    flex: 1,
    backgroundColor: 'transparent', // No additional background - cleaner
    color: colors._colorScheme === 'light' ? '#000000' : '#FFFFFF', // Text color based on theme
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue' : 'sans-serif',
    maxHeight: 100, // Slightly reduced max height
});

const sendButtonStyle = (colors: ColorPalette): ViewStyle => ({
    backgroundColor: colors._colorScheme === 'light' ? '#FFFFFF' : '#FFFFFF', // Always white button for now
    borderRadius: 18, // Less rounded for cleaner look
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors._colorScheme === 'light' ? '#00000040' : '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2, // Minimal elevation
});

// Define types for scrolling text
interface Word {
  id: string;
  text: string;
}

interface TextRow {
  id: string;
  direction: 'rtl' | 'ltr';
  speed: number;
  words: Word[];
  color: string;
}

// Scrolling text data for the home page - will be adjusted for theme
// Used in the HomeScreen component
export const getScrollingTextRows = (isDark: boolean): TextRow[] => [
  {
    id: 'row1',
    direction: 'rtl', // Right to left
    speed: 15,
    color: isDark ? '#FFFFFF' : '#000000', // Theme-aware color
    words: [
      { id: '1-1', text: 'Safe Routes' },
      { id: '1-2', text: 'Navigation' },
      { id: '1-3', text: 'Crime Data' },
      { id: '1-4', text: 'Street Safety' },
      { id: '1-5', text: 'Secure Areas' },
      { id: '1-6', text: 'Hotspot Map' },
      { id: '1-7', text: 'Route Planning' },
    ]
  },
  {
    id: 'row2',
    direction: 'rtl', // Right to left
    speed: 20,
    color: '#FFFFFF', // White color
    words: [
      { id: '2-1', text: 'Safety Tips' },
      { id: '2-2', text: 'Alerts' },
      { id: '2-3', text: 'Warnings' },
      { id: '2-4', text: 'Prevention' },
      { id: '2-5', text: 'Stay Alert' },
      { id: '2-6', text: 'Local Updates' },
      { id: '2-7', text: 'Be Aware' },
    ]
  },
  {
    id: 'row3',
    direction: 'rtl', // Right to left
    speed: 10,
    color: '#FFFFFF', // White color
    words: [
      { id: '3-1', text: 'Time Analysis' },
      { id: '3-2', text: 'Historical Data' },
      { id: '3-3', text: 'Crime Trends' },
      { id: '3-4', text: 'Statistics' },
      { id: '3-5', text: 'Monthly Reports' },
      { id: '3-6', text: 'Pattern Detection' },
      { id: '3-7', text: 'Risk Assessment' },
    ]
  },
  {
    id: 'row4',
    direction: 'rtl', // Right to left
    speed: 25,
    color: '#FFFFFF', // White color
    words: [
      { id: '4-1', text: 'Stay Protected' },
      { id: '4-2', text: 'Emergency Guide' },
      { id: '4-3', text: 'Quick Actions' },
      { id: '4-4', text: 'Resources' },
      { id: '4-5', text: 'Help Center' },
      { id: '4-6', text: 'Report Crime' },
      { id: '4-7', text: 'Contact Info' },
    ]
  },
  {
    id: 'row5',
    direction: 'rtl', // Right to left
    speed: 18,
    color: '#FFFFFF', // White color
    words: [
      { id: '5-1', text: 'Community Watch' },
      { id: '5-2', text: 'Safe Spots' },
      { id: '5-3', text: 'Neighborhood Updates' },
      { id: '5-4', text: 'Safety Zones' },
      { id: '5-5', text: 'Real-time Alerts' },
      { id: '5-6', text: 'Area Insights' },
      { id: '5-7', text: 'Emergency Response' },
    ]
  }
];

// Quick Text Options Component
const QUICK_TEXT_OPTIONS = [
  "Is this area safe?",
  "Show me the safest route to...",
  "Any crime hotspots nearby?",
  "Recent incidents in this neighborhood?",
  "What are the crime trends here?",
];

interface QuickTextOptionsProps {
  onSelect: (text: string) => void;
  colors: ColorPalette;
}

const QuickTextOptions: React.FC<QuickTextOptionsProps> = ({ onSelect, colors }) => {
  return (
    <View style={styles.quickTextCarouselContainer}>
      <FlatList
        horizontal
        data={QUICK_TEXT_OPTIONS}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.quickTextBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.quickTextLabel, { color: colors.text }]}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickTextListContent}
      />
    </View>
  );
};

// Non-interactive Scrolling Text Row Component
const ScrollingTextRow: React.FC<{
  rowData: TextRow;
}> = ({ rowData }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const [contentWidth, setContentWidth] = useState(0);
  const { colorScheme } = useThemePreference();
  
  const bubbleColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      delay: 80 + Math.random() * 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true
    }).start();
    
    setTimeout(() => {
      const distance = screenWidth * 1.5;
      const duration = (distance / rowData.speed) * 1000;
      
      let initialValue = screenWidth;
      let toValue = -distance;
      
      scrollX.setValue(initialValue);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(scrollX, {
            toValue: toValue,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true
          }),
          Animated.timing(scrollX, {
            toValue: initialValue,
            duration: 0,
            useNativeDriver: true
          })
        ])
      ).start();
    }, 300);
    
    return () => {
      scrollX.stopAnimation();
      opacity.stopAnimation();
    };
  }, [contentWidth, rowData.direction, rowData.speed, screenWidth, scrollX, opacity]);

  return (
    <Animated.View style={[styles.scrollingRowContainer, { opacity }]}>
      <Animated.View 
        style={[
          styles.scrollingRow,
          { transform: [{ translateX: scrollX }] }
        ]}
        onLayout={(event) => {
          setContentWidth(event.nativeEvent.layout.width);
        }}
      >
        {/* First set of words */}
        {rowData.words.map((word) => (
          <View
            key={`${word.id}-1`}
            style={[
              styles.wordBubble,
              { 
                backgroundColor: bubbleColor,
                borderColor: `${textColor}20`,
                shadowColor: textColor,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2
              }
            ]}
          >
            <Text style={[styles.wordText, { color: textColor }]}>{word.text}</Text>
          </View>
        ))}
        {/* Second set of words to ensure no gaps */}
        {rowData.words.map((word) => (
          <View
            key={`${word.id}-2`}
            style={[
              styles.wordBubble,
              { 
                backgroundColor: bubbleColor,
                borderColor: `${textColor}20`,
                shadowColor: textColor,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2
              }
            ]}
          >
            <Text style={[styles.wordText, { color: textColor }]}>{word.text}</Text>
          </View>
        ))}
      </Animated.View>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [showScrollingText, setShowScrollingText] = useState(true);

  const { colorScheme } = useThemePreference();
  const isDarkMode = colorScheme === 'dark';
  
  // Create theme-aware scrolling text rows
  const scrollingTextRows = React.useMemo(() => {
    const textColor = isDarkMode ? '#FFFFFF' : '#000000';
    return [
      {
        id: 'row1',
        direction: 'rtl' as const,
        speed: 15,
        color: textColor,
        words: [
          { id: '1-1', text: 'Safe Routes' },
          { id: '1-2', text: 'Navigation' },
          { id: '1-3', text: 'Crime Data' },
          { id: '1-4', text: 'Street Safety' },
          { id: '1-5', text: 'Secure Areas' },
          { id: '1-6', text: 'Hotspot Map' },
          { id: '1-7', text: 'Route Planning' },
        ]
      },
      {
        id: 'row2',
        direction: 'rtl' as const,
        speed: 20,
        color: textColor,
        words: [
          { id: '2-1', text: 'Safety Tips' },
          { id: '2-2', text: 'Alerts' },
          { id: '2-3', text: 'Warnings' },
          { id: '2-4', text: 'Prevention' },
          { id: '2-5', text: 'Stay Alert' },
          { id: '2-6', text: 'Local Updates' },
          { id: '2-7', text: 'Be Aware' },
        ]
      },
      {
        id: 'row3',
        direction: 'rtl' as const,
        speed: 10,
        color: textColor,
        words: [
          { id: '3-1', text: 'Time Analysis' },
          { id: '3-2', text: 'Historical Data' },
          { id: '3-3', text: 'Crime Trends' },
          { id: '3-4', text: 'Statistics' },
          { id: '3-5', text: 'Monthly Reports' },
          { id: '3-6', text: 'Pattern Detection' },
          { id: '3-7', text: 'Risk Assessment' },
        ]
      },
      {
        id: 'row4',
        direction: 'rtl' as const,
        speed: 25,
        color: textColor,
        words: [
          { id: '4-1', text: 'Stay Protected' },
          { id: '4-2', text: 'Emergency Guide' },
          { id: '4-3', text: 'Quick Actions' },
          { id: '4-4', text: 'Resources' },
          { id: '4-5', text: 'Help Center' },
          { id: '4-6', text: 'Report Crime' },
          { id: '4-7', text: 'Contact Info' },
        ]
      },
      {
        id: 'row5',
        direction: 'rtl' as const,
        speed: 18,
        color: textColor,
        words: [
          { id: '5-1', text: 'Community Watch' },
          { id: '5-2', text: 'Safe Spots' },
          { id: '5-3', text: 'Neighborhood Updates' },
          { id: '5-4', text: 'Safety Zones' },
          { id: '5-5', text: 'Real-time Alerts' },
          { id: '5-6', text: 'Area Insights' },
          { id: '5-7', text: 'Emergency Response' },
        ]
      }
    ];
  }, [isDarkMode]);
  
  // Memoize colors to prevent unnecessary re-renders
  const colors = React.useMemo(() => ({
    ...Colors[colorScheme as keyof typeof Colors] as ColorPalette,
    _colorScheme: colorScheme as 'light' | 'dark'
  }), [colorScheme]);
  
  const flatListRef = useRef<FlatList>(null);
  const initialRenderRef = useRef(true);

  // Define sendMessage first as it's used by handleTextInputChange
  const sendMessage = useCallback((textToSend?: string) => {
    const currentMessage = textToSend || message;
    if (currentMessage.trim().length > 0) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: currentMessage.trim(),
        sender: 'me',
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessage(''); // Clear input after sending
      setIsChatting(true);
      setShowScrollingText(false);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [message]); // Dependencies: message

  // Reset state when the screen is focused (navigated to)
  useFocusEffect(
    useCallback(() => {
      if (!initialRenderRef.current) {
        // This check ensures we don't reset everything on the first render
        setIsChatting(false);
        setMessage('');
        setMessages([]);
        setShowScrollingText(true);  // Show scrolling text when screen is focused again
        
        // Dismiss keyboard if it's open
        Keyboard.dismiss();
      }
      initialRenderRef.current = false;
    }, [])
  );

  // Auto-generate a response when user sends a message (example only)
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'me') {
      // Simulate a delay before bot responds
      const timer = setTimeout(() => {
        const botResponses = [
          "I understand your concern. Let me help you find safe routes.",
          "Based on current data, this area has low crime incidents.",
          "Would you like me to alert you about safety updates in this area?",
          "The nearest safe zone is about 2 blocks away.",
          "I've analyzed the crime patterns and can suggest a safer route."
        ];
        
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        
        const botMessage: Message = {
          id: Date.now().toString(),
          text: randomResponse,
          sender: 'other',
          timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleTextInputChange = useCallback((text: string) => {
    setMessage(text);
    // If text is entered AND we are not currently in chat mode,
    // switch to chat mode.
    if (text.length > 0 && !isChatting) {
      setIsChatting(true);
      setShowScrollingText(false);
    }
    // If a quick text option was selected, also send the message immediately
    if (QUICK_TEXT_OPTIONS.includes(text) && text !== message) {
      // Ensure we don't get into a loop if the text is already set by this selection
      sendMessage(text); // Pass the selected text to sendMessage
    }
  }, [isChatting, sendMessage, message]); // Dependencies: isChatting, sendMessage, message

  const handleInputFocus = useCallback(() => {
    setShowScrollingText(false);
  }, []);

  const handleInputBlur = useCallback(() => {
    // Only show scrolling text again if we're not in chat mode and have no messages
    if (!isChatting && message.trim().length === 0 && messages.length === 0) {
      setShowScrollingText(true);
    }
  }, [isChatting, message, messages.length]);

  const renderMessage = useCallback(({ item }: ListRenderItemInfo<Message>) => {
    const formattedTime = new Date(item.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    
    return (
      <View style={[
        styles.messageWrapper,
        { alignSelf: item.sender === 'me' ? 'flex-end' : 'flex-start' }
      ]}>
        <Text style={[
          styles.senderName,
          {
            color: item.sender === 'me' ? colors.accent : colors.primary,
            // Adjust margin to align name tag with the message bubble edge
            marginLeft: item.sender === 'me' ? 0 : 5, 
            marginRight: item.sender === 'me' ? 5 : 0,
            textAlign: item.sender === 'me' ? 'right' : 'left',
          }
        ]}>
          {item.sender === 'me' ? 'You' : 'SafeBuddy'}
        </Text>
        <View
          style={[
            styles.messageContainer,
            item.sender === 'me' 
              ? [myMessageStyle(colors), {
                  shadowColor: '#2a9b41',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }] 
              : [otherMessageStyle(colors), {
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 1,
                  elevation: 1,
                }],
          ]}
        >
          <Text style={item.sender === 'me' ? myMessageTextStyle(colors) : otherMessageTextStyle(colors)}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            { color: item.sender === 'me' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)' }
          ]}>
            {formattedTime}
          </Text>
        </View>
      </View>
    );
  }, [colors]);

  // The dock height and margin - must match values in _layout.tsx
  const dockHeight = 45;
  const dockBottomMargin = 25;  // This should match bottom value in _layout.tsx
  const dockTotalHeight = dockHeight + dockBottomMargin; // 70

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
        <View style={styles.flex1}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? dockTotalHeight : dockTotalHeight}
          >
            {isChatting ? (
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.messageList}
                contentContainerStyle={styles.messageListContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                scrollEnabled={true}
                showsVerticalScrollIndicator={true}
                initialNumToRender={20}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={false}
              />
            ) : (
              <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={[styles.contentArea, { backgroundColor: colors.background }]}>
                  {/* App Title display at the top */}
                    <Text style={{ fontSize: 28, color: colors.textPrimary }}>
                    Citi<Text style={{ fontWeight: 'bold', color: 'red' }}>Safe</Text>
                    </Text>
                  
                  {/* Scrolling Text Display - only show if enabled */}
                  {showScrollingText && (
                    <View style={styles.scrollingTextContainer}>
                      {scrollingTextRows.map((row) => {
                        // Apply theme-aware colors to the bubbles and text
                        const textColor = colors._colorScheme === 'light' ? '#000000' : '#FFFFFF';
                        const updatedRow = {
                          ...row,
                          color: textColor // Update the color based on theme
                        };
                        return (
                          <ScrollingTextRow 
                            key={row.id}
                            rowData={updatedRow}
                          />
                        );
                      })}
                    </View>
                  )}
                  
                  {/* Brief instruction text at the bottom */}
                  <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                    Type a message to start
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            )}

            {/* Quick text message carousel - only show if not chatting */}
            {!isChatting && (
              <QuickTextOptions onSelect={handleTextInputChange} colors={colors} />
            )}

            {/* The input container is inside KeyboardAvoidingView and positioned by flex */}
            <View style={[inputContainerStyle(colors), styles.inputContainer]}>
              <TextInput
              style={inputStyle(colors)}
              value={message}
              onChangeText={handleTextInputChange}
              placeholder="Type a message..."
              placeholderTextColor={colors._colorScheme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
              multiline={true}
              selectionColor={colors._colorScheme === 'light' ? '#000000' : '#FFFFFF'}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              />
              <TouchableOpacity 
                style={[
                  sendButtonStyle(colors),
                  message.trim().length === 0 && { opacity: 0.5 }
                ]} 
                onPress={() => sendMessage()} // Call sendMessage without arguments
                disabled={message.trim().length === 0}
                activeOpacity={0.7} // Better touch feedback
              >
                <Ionicons 
                  name="paper-plane" 
                  size={18} 
                  color={colors._colorScheme === 'light' ? '#333333' : '#333333'} // Always dark gray icon for now
                  style={{ marginLeft: 2 }} // Slightly adjust position for visual balance
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

// Define static styles within StyleSheet.create
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  messageList: {
    flex: 1,
    width: '100%',
  },
  messageListContent: {
    paddingHorizontal: 20,
    paddingBottom: 65, // Reduced padding to account for pulled up dock
    paddingTop: 10,
    flexGrow: 1, // Important for proper scrolling behavior
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
    flexShrink: 1, // Allows message bubbles to shrink if needed
    minHeight: 36, // Minimum height to make touch target larger
  },
  inputContainer: {
    // Position is relative within KeyboardAvoidingView
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1.5,
    fontFamily: 'Helvetica Neue', // Changed to Helvetica Neue only
    color: '#333333',
  },
  instructionText: {
    fontSize: 15,
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.7, 
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue' : 'sans-serif'
  },
  scrollingTextContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 3, // Reduced padding for tighter layout
    marginVertical: -3, // Tighter spacing
  },
  scrollingRowContainer: {
    overflow: 'hidden',
    width: '100%',
    height: 35, // Slightly reduced height to fit new row
    marginVertical: 1, // Minimal spacing between rows
  },
  scrollingRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  wordBubble: {
    paddingVertical: 5, // Minimized vertical padding
    paddingHorizontal: 8, // Reduced horizontal padding
    borderRadius: 14, // Slightly smaller rounded corners for compact look
    marginHorizontal: 3, // Tighter spacing between bubbles
    borderWidth: 1, // Thinner border for sleeker appearance
    // borderColor will be set dynamically
  },
  wordText: {
    // text color will be set dynamically
    fontSize: 12, // Slightly smaller font size for more compact look
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue' : 'sans-serif', // Platform-specific font
    fontWeight: '500', // Slightly lighter weight for better legibility at small size
    letterSpacing: -0.2, // Slightly negative letter spacing for tighter text
  },
  quickTextCarouselContainer: {
    height: 50, // Adjust height as needed
    marginTop: 5, // Add some margin if needed
    marginBottom: 5, // Add some margin if needed
  },
  quickTextListContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  quickTextBubble: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTextLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica Neue',
    fontWeight: '500',
  },
  messageWrapper: {
    marginVertical: 4,
    maxWidth: '80%', // Keep maxWidth on wrapper
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    // marginHorizontal will be set dynamically in renderMessage
    // textAlign will be set dynamically in renderMessage
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
