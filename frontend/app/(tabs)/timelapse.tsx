import { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Platform, Dimensions, View, Alert, Modal, TextInput, FlatList, Animated } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, Heatmap } from 'react-native-maps';
import * as Location from 'expo-location';

// Add types for heatmap data
interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  severity: number;
  type: string;
  description: string;
  risk_level: string;
  date: string;
}

const { width, height } = Dimensions.get('window');

// Add API configuration
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.0.191:5001'  // Your local IP address
  : 'https://your-production-url.com';

// Color gradient for heatmap
const HEATMAP_GRADIENT = {
  colors: ['rgba(0, 255, 255, 0.4)', 'rgba(0, 255, 0, 0.6)', 'rgba(255, 255, 0, 0.7)', 'rgba(255, 0, 0, 0.8)'],
  startPoints: [0.01, 0.25, 0.50, 0.75],
  colorMapSize: 1000
};

export default function TimelapseScreen() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const mapRef = useRef<MapView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [radius, setRadius] = useState(10);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.839672,
    longitude: -87.634289,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentHeatmapPoints, setCurrentHeatmapPoints] = useState<HeatmapPoint[]>([]);

  // Function to fetch timelapse data
  const fetchTimelapseData = async () => {
    setIsLoading(true);
    console.log('Starting timelapse data fetch with params:', {
      lat: mapRegion.latitude,
      lon: mapRegion.longitude,
      year,
      radius,
      mapBounds: {
        latDelta: mapRegion.latitudeDelta,
        lngDelta: mapRegion.longitudeDelta
      }
    });

    try {
      const url = `${API_BASE_URL}/timelapse?lat=${mapRegion.latitude}&lon=${mapRegion.longitude}&year=${year}&radius_km=${radius}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.error || 'Failed to fetch timelapse data');
      }

      const data = await response.json();
      console.log('Timelapse data received:', {
        place: data.place,
        year: data.year,
        dataPoints: data.data?.length || 0,
        samplePoint: data.data?.[0]
      });
      
      if (data.data && data.data.length > 0) {
        setHeatmapData(data.data);
        setCurrentHeatmapPoints(data.data);
      } else {
        setHeatmapData([]);
        setCurrentHeatmapPoints([]);
      }
    } catch (error: any) {
      console.error('Error fetching timelapse data:', {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      });
      Alert.alert('Error', error.message || 'Failed to fetch timelapse data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle month changes with animation
  const handleMonthChange = (newMonth: number) => {
    // Fade out current heatmap
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMonth(newMonth);
      // Fade in new heatmap
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  // Convert heatmap data to points with weights
  const getHeatmapPoints = () => {
    if (!currentHeatmapPoints.length) {
      console.log('No heatmap points to display');
      return [];
    }
    
    console.log(`Processing ${currentHeatmapPoints.length} heatmap points`);
    
    try {
      // Find max intensity for better normalization
      // Add a small constant to avoid division by zero
      const maxIntensity = Math.max(...currentHeatmapPoints.map(p => p.intensity || 1));
      const maxSeverity = Math.max(...currentHeatmapPoints.map(p => p.severity || 1));
      
      // Use both intensity and severity for weighting
      // Emphasize severity more for visual impact
      const points = currentHeatmapPoints.map(point => ({
        latitude: point.lat,
        longitude: point.lng,
        // Combine intensity and severity for weight calculation
        // Higher severity crimes should appear more prominently
        weight: Math.min(1, Math.max(0.2, 
          (0.4 * (point.intensity / maxIntensity)) + 
          (0.6 * (point.severity / maxSeverity))
        )),
      }));
      
      // Add console logs to help debug
      if (points.length > 0) {
        console.log('First few heatmap points:', points.slice(0, 3));
        console.log('Point count by weight ranges:',
          points.filter(p => p.weight >= 0.8).length + ' high points (≥0.8)',
          points.filter(p => p.weight >= 0.5 && p.weight < 0.8).length + ' medium points (0.5-0.8)',
          points.filter(p => p.weight < 0.5).length + ' low points (<0.5)'
        );
      }
      
      return points;
    } catch (error) {
      console.error('Error processing heatmap points:', error);
      // Fall back to simple intensity-only processing if error occurs
      return currentHeatmapPoints.map(point => ({
        latitude: point.lat,
        longitude: point.lng,
        weight: 0.5, // Default weight
      }));
    }
  };

  // Generate years array from 2010 to current year
  const years = Array.from(
    { length: new Date().getFullYear() - 2009 },
    (_, i) => new Date().getFullYear() - i
  );

  // Handle map region changes - only track without updating state
  const handleRegionChange = (region: any) => {
    // Don't update state during changes to avoid continuous map movement
  };

  // Handle map region change complete - only update when user finishes interaction
  const handleRegionChangeComplete = (region: any) => {
    // Only update after user finishes interacting
    console.log("Map region changed by user");
  };

  // Update map zoom ONLY when radius changes
  useEffect(() => {
    const delta = radius * 0.01;
    // Store current values to prevent dependency loop
    const currentLat = mapRegion.latitude;
    const currentLng = mapRegion.longitude;
    
    // Use timeout to ensure we don't animate too frequently
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLat,
          longitude: currentLng,
          latitudeDelta: delta,
          longitudeDelta: delta,
        }, 300);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius]); // Only depend on radius, not on map coordinates

  const handleLocationSearch = () => {
    // Here you would typically call a geocoding service
    // For now, we'll just update the location with the input text
    setMapRegion({
      ...mapRegion,
      latitude: mapRegion.latitude,
      longitude: mapRegion.longitude,
    });
    setShowLocationPicker(false);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter heatmap data by month
  useEffect(() => {
    if (heatmapData.length === 0) return;
    
    console.log(`Filtering data for month ${month + 1}`);
    
    try {
      // Filter data points for the selected month
      const filteredPoints = heatmapData.filter(point => {
        const pointDate = new Date(point.date);
        return pointDate.getMonth() === month;
      });
      
      console.log(`Found ${filteredPoints.length} points for month ${month + 1} out of ${heatmapData.length} total points`);
      setCurrentHeatmapPoints(filteredPoints.length > 0 ? filteredPoints : heatmapData);
    } catch (error) {
      console.error('Error filtering heatmap data by month:', error);
      // If error occurs, show all data points
      setCurrentHeatmapPoints(heatmapData);
    }
  }, [month, heatmapData]);

  // Debug log when currentHeatmapPoints changes
  useEffect(() => {
    console.log(`Current heatmap points count: ${currentHeatmapPoints.length}`);
    if (currentHeatmapPoints.length > 0) {
      console.log('Sample point:', currentHeatmapPoints[0]);
    }
  }, [currentHeatmapPoints]);

  // Auto-load data on first render
  useEffect(() => {
    // Only run once when component mounts
    const timer = setTimeout(() => {
      if (currentHeatmapPoints.length === 0) {
        console.log('Auto-loading initial data');
        fetchTimelapseData();
      }
    }, 1000); // Give a delay to let the map initialize
    
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this only runs once

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={mapRegion}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        customMapStyle={theme === 'dark' ? darkMapStyle : []}
        zoomEnabled={true}
        rotateEnabled={false}
        scrollEnabled={true}
        pitchEnabled={false}
        moveOnMarkerPress={false}
      >
        {currentHeatmapPoints.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Heatmap
              points={getHeatmapPoints()}
              radius={40}
              opacity={0.9}
              gradient={HEATMAP_GRADIENT}
            />
          </Animated.View>
        )}
      </MapView>

      {/* Top Controls */}
      <ThemedView style={[styles.topControls, { backgroundColor: colors.surface }]}>
        {/* First Row: Year */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.yearPicker, { backgroundColor: colors.surface }]}
            onPress={() => setShowYearPicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color={colors.accent} />
            <ThemedText style={styles.yearText}>{year}</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Second Row: Radius and Generate Button */}
        <View style={styles.row}>
          <ThemedView style={[styles.radiusContainer, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="search" size={20} color={colors.accent} />
            <Slider
              style={styles.radiusSlider}
              minimumValue={1}
              maximumValue={20}
              step={1}
              value={radius}
              onValueChange={setRadius}
              minimumTrackTintColor={colors.accent}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.accent}
            />
            <ThemedText style={styles.radiusText}>{radius} km</ThemedText>
          </ThemedView>

          <TouchableOpacity 
            style={[
              styles.generateButton, 
              { backgroundColor: colors.accent },
              isLoading && { opacity: 0.7 }
            ]}
            onPress={fetchTimelapseData}
            disabled={isLoading}
          >
            <MaterialIcons 
              name={isLoading ? "hourglass-empty" : "play-arrow"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Bottom Month Slider */}
      <ThemedView style={[styles.bottomSlider, { backgroundColor: colors.surface }]}>
        <ThemedText style={styles.monthText}>{months[month]}</ThemedText>
        <Slider
          style={styles.monthSlider}
          minimumValue={0}
          maximumValue={11}
          step={1}
          value={month}
          onValueChange={handleMonthChange}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
        />
      </ThemedView>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <ThemedView style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ThemedText style={styles.modalTitle}>Select Year</ThemedText>
            <FlatList
              data={years}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.yearItem,
                    item === year && { backgroundColor: colors.accent + '20' }
                  ]}
                  onPress={() => {
                    setYear(item);
                    setShowYearPicker(false);
                  }}
                >
                  <ThemedText style={[
                    styles.yearItemText,
                    item === year && { color: colors.accent }
                  ]}>
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocationPicker(false)}
        >
          <ThemedView style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ThemedText style={styles.modalTitle}>Enter Location</ThemedText>
            <View style={styles.locationInputContainer}>
              <TextInput
                style={[styles.locationInput, { color: colors.text }]}
                placeholder="Enter city, state, or address"
                placeholderTextColor={colors.textSecondary}
                value={locationInput}
                onChangeText={setLocationInput}
                autoFocus
              />
              <TouchableOpacity 
                style={[styles.searchButton, { backgroundColor: colors.accent }]}
                onPress={handleLocationSearch}
              >
                <MaterialIcons name="search" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  yearPicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  yearText: {
    marginLeft: 8,
    fontSize: 14,
  },
  radiusContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  radiusSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  radiusText: {
    fontSize: 14,
    minWidth: 45,
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
  },
  bottomSlider: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 80,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthText: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  monthSlider: {
    width: '100%',
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    maxHeight: height * 0.7,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  yearItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  yearItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Dark map style
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];