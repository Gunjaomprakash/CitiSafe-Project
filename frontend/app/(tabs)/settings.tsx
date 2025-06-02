import { Colors } from '@/constants/Colors';
import { useThemePreference } from '@/hooks/useThemePreference';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { colorScheme, isDarkMode, toggleDarkMode } = useThemePreference();
  const colors = Colors[colorScheme as keyof typeof Colors] || Colors.dark; // Explicitly type the index
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.accent + '40' }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Notifications</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Crime Alerts</Text>
            <Switch 
              trackColor={{ false: "#767577", true: colors.accent }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          <View style={[styles.settingRow, { borderBottomColor: colors.accent + '40' }]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Safety Updates</Text>
            <Switch 
              trackColor={{ false: "#767577", true: colors.accent }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          <View style={[styles.settingRow, { borderBottomColor: colors.accent + '40' }]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Emergency Alerts</Text>
            <Switch 
              trackColor={{ false: "#767577", true: colors.accent }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#3e3e3e"
              value={true}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Account</Text>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.accent + '40' }]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Profile Information</Text>
            <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.accent + '40' }]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Privacy Settings</Text>
            <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.accent + '40' }]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>App Settings</Text>
          <View style={[styles.settingRow, { borderBottomColor: colors.accent + '40' }]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
            <Switch 
              trackColor={{ false: "#767577", true: colors.accent }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#3e3e3e"
              value={isDarkMode}
              onValueChange={toggleDarkMode}
            />
          </View>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.accent + '40' }]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Language</Text>
            <View style={styles.valueContainer}>
              <Text style={[styles.valueText, { color: colors.textSecondary }]}>English</Text>
              <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.accent + '40' }]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Data Usage</Text>
            <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 120, // Increased padding to account for raised tab bar
  },
  section: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    marginRight: 4,
  },
});
