import { Colors } from '@/constants/Colors';
import { useThemePreference } from '@/hooks/useThemePreference';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Keyboard, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface Suggestion {
  id: string;
  text: string;
  coords: LocationCoords;
}

interface Route {
  id: string;
  name: string;
  eta: string;
  risk: 'low' | 'medium';
  coordinates: LocationCoords[];
}

const dummySuggestions: Suggestion[] = [
    { id: 's1', text: 'New York, NY', coords: { latitude: 40.7128, longitude: -74.0060 } },
    { id: 's2', text: 'Los Angeles, CA', coords: { latitude: 34.0522, longitude: -118.2437 } },
    { id: 's3', text: 'San Francisco, CA', coords: { latitude: 37.7749, longitude: -122.4194 } },
    { id: 's4', text: 'Chicago, IL', coords: { latitude: 41.8781, longitude: -87.6298 } },
];

const dummyRoutes: Route[] = [
    {
        id: 'r1',
        name: 'Recommended Route',
        eta: '15 min',
        risk: 'low',
        coordinates: [
            { latitude: 40.7128, longitude: -74.0060 },
            { latitude: 40.7138, longitude: -74.0070 },
            { latitude: 40.7148, longitude: -74.0080 }
        ]
    },
    {
        id: 'r2',
        name: 'Alternative Route',
        eta: '17 min',
        risk: 'medium',
        coordinates: [
            { latitude: 40.7128, longitude: -74.0060 },
            { latitude: 40.7118, longitude: -74.0050 },
            { latitude: 40.7108, longitude: -74.0040 }
        ]
    },
    {
        id: 'r3',
        name: 'Scenic Route',
        eta: '20 min',
        risk: 'low',
        coordinates: [
            { latitude: 40.7128, longitude: -74.0060 },
            { latitude: 40.7135, longitude: -74.0080 },
            { latitude: 40.7140, longitude: -74.0085 },
            { latitude: 40.7145, longitude: -74.0075 },
            { latitude: 40.7148, longitude: -74.0080 }
        ]
    }
];

type ColorPalette = typeof Colors['light'] & typeof Colors['dark'] & {
  warning: string;
  border: string;
};

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746855' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#242f3e' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];
const LocationMarkerComponent = React.memo(function LocationMarker({ coordinate }: { coordinate: LocationCoords }) {
  return (
    <Marker
      coordinate={coordinate}
      title="Current Location"
      accessibilityLabel="Current Location"
    >
      <View style={styles.userLocationMarker}>
        <View style={styles.userLocationDot} />
      </View>
    </Marker>
  );
});

const DestinationMarkerComponent = React.memo(function DestinationMarker({ coordinate }: { coordinate: LocationCoords }) {
  return (
    <Marker
      coordinate={coordinate}
      title="Selected Location"
      accessibilityLabel="Selected Location"
    >
      <View>
        <Ionicons name="location" size={32} color="#FF3B30" />
      </View>
    </Marker>
  );
});
export default function NavigationAssistScreen() {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const mapRef = React.useRef<MapView>(null);
  const { colorScheme } = useThemePreference();
  const { isConnected, error, sendMessage, subscribe, unsubscribe } = useWebSocket();
  const colors = {
    ...(Colors[colorScheme as keyof typeof Colors] || Colors.dark),
    warning: '#F59E0B',
    border: colorScheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    accent: '#4CD964', // Set consistent green accent color
  } as ColorPalette;
  
  const [destinationText, setDestinationText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoords | null>(null);

  // Subscribe to navigation updates
  useEffect(() => {
    const handleNavigationUpdate = (data: any) => {
      console.log('Navigation update:', data);
      // Handle navigation updates from the server
      if (data.type === 'location_update') {
        // Update user location on the map
        setUserLocation({
          coords: {
            latitude: data.latitude,
            longitude: data.longitude,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        });
      }
    };

    if (isConnected) {
      subscribe('navigation_update', handleNavigationUpdate);
    }

    return () => {
      unsubscribe('navigation_update', handleNavigationUpdate);
    };
  }, [isConnected, subscribe, unsubscribe]);

  // Show connection status
  useEffect(() => {
    if (error) {
      Alert.alert('Connection Error', error);
    }
  }, [error]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to show your current location on the map."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Center map on user location
      if (mapRef.current && location) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    })();
  }, []);

  const handleDestinationTextChange = (text: string) => {
    setDestinationText(text);
    setSelectedRoute(null); // Clear any selected route when text changes
    if (text.length > 0) {
      setSuggestions(dummySuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setDestinationText(suggestion.text);
    setSelectedLocation(suggestion.coords); // Set the selected location
    setSelectedRoute(null); // Clear any previously selected route
    setSuggestions([]);
  };

  const handleSearchRoutes = () => {
    if (destinationText) {
      setSelectedRoute(dummyRoutes[0]); // Select first route by default
    } else {
      Alert.alert('Error', 'Please enter a destination');
    }
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
  };

  const handleStartNavigation = () => {
    if (!isConnected) {
      Alert.alert('Error', 'Not connected to navigation server');
      return;
    }

    if (!userLocation || !selectedLocation) {
      Alert.alert('Error', 'Please select a destination first');
      return;
    }

    sendMessage('start_navigation', {
      start: {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude
      },
      destination: selectedLocation
    });

    setIsNavigating(true);
  };

  const handleStopNavigation = () => {
    if (isConnected) {
      sendMessage('stop_navigation', {});
    }
    setIsNavigating(false);
    setSelectedRoute(null);
    setDestinationText('');
  };

  const formatCoordinates = (coords: LocationCoords): string => 
    `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;

  // Handle map press to select location
  const handleMapPress = (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedLocation(coords);
    setDestinationText(formatCoordinates(coords));
    setSuggestions([]); // Clear suggestions when manually selecting
    setSelectedRoute(null); // Clear any previously selected route
  };

  // Dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: userLocation?.coords?.latitude || 40.7128,
            longitude: userLocation?.coords?.longitude || -74.0060,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          customMapStyle={colorScheme === 'dark' ? darkMapStyle : []}
          onPress={(e) => {
            dismissKeyboard();
            handleMapPress(e);
          }}
        >
          {userLocation && (
            <LocationMarkerComponent
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
            />
          )}
          
          {selectedLocation && (
            <DestinationMarkerComponent coordinate={selectedLocation} />
          )}

          {/* Display routes on map */}
          {selectedRoute && dummyRoutes.map(route => (
              <Polyline
                  key={route.id}
                  coordinates={route.coordinates}
                  strokeColor={selectedRoute?.id === route.id ? colors.accent : colors.primary}
                  strokeWidth={selectedRoute?.id === route.id ? 5 : 3}
                  lineDashPattern={route.risk === 'medium' ? [5, 2] : undefined}
                  onPress={() => handleRouteSelect(route)}
              />
          ))}

          {/* Display selected route when navigating */}
           {isNavigating && selectedRoute && (
               <Polyline
                   key={selectedRoute.id}
                   coordinates={selectedRoute.coordinates}
                   strokeColor={colors.accent}
                   strokeWidth={5}
               />
           )}
        </MapView>

        {/* UI for destination selection and route search */}
        {!isNavigating && (
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.destinationInput, { color: colors.text }]}
                placeholder="Enter Destination or Pick on Map"
                placeholderTextColor={colors.textSecondary}
                value={destinationText}
                onChangeText={handleDestinationTextChange}
                onSubmitEditing={dismissKeyboard}
                blurOnSubmit={true}
              />
            </View>
            {/* Display suggestions dropdown */}
            {suggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface }]}>
                    <FlatList
                          data={suggestions}
                          keyExtractor={(item) => item.id}
                          renderItem={({ item }) => (
                              <TouchableOpacity 
                                  onPress={() => handleSuggestionSelect(item)} 
                                  style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                              >
                                  <Ionicons name="location" size={18} color={colors.primary} style={styles.suggestionIcon} />
                                  <Text style={[styles.suggestionText, { color: colors.text }]}>{item.text}</Text>
                              </TouchableOpacity>
                          )}
                      />
                  </View>
              )}
            {/* Moved TouchableOpacity to be a direct child of searchContainer's View */}
            <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.accent }]} onPress={handleSearchRoutes}>
              <Ionicons name="navigate" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>Find Safe Routes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* UI for starting navigation */}
         {!isNavigating && selectedRoute && (
             <View style={[styles.startNavContainer, { backgroundColor: colors.surface }]}>
                 <>
                   <View style={[styles.routeInfoBox, { backgroundColor: colors.background }]}>
                      <Text style={[styles.routeInfoTitle, { color: colors.text }]}>{selectedRoute.name}</Text>
                      <View style={styles.routeInfoRow}>
                        <View style={styles.routeInfoItem}>
                          <Ionicons name="time-outline" size={16} color={colors.accent} />
                          <Text style={[styles.routeInfoText, { color: colors.text }]}>{selectedRoute.eta}</Text>
                        </View>
                        <View style={styles.routeInfoItem}>
                          <Ionicons
                            name="shield-checkmark-outline"
                            size={16}
                            color={selectedRoute.risk === 'low' ? colors.primary : colors.warning}
                          />
                          <Text
                            style={[
                              styles.routeInfoText,
                              { color: selectedRoute.risk === 'low' ? colors.primary : colors.warning }
                            ]}
                          >
                            {selectedRoute.risk === 'low' ? 'Low Risk' : 'Medium Risk'}
                          </Text>
                        </View>
                      </View>
                   </View>
                   <TouchableOpacity
                     style={[styles.startButton, { backgroundColor: colors.accent }]}
                     onPress={handleStartNavigation}
                   >
                     <Ionicons name="navigate-circle" size={20} color="#FFFFFF" />
                     <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>Start Safe Navigation</Text>
                   </TouchableOpacity>
                 </>
             </View>
         )}

         {/* Live Navigation UI */}
         {isNavigating && (
              <View style={styles.liveNavContainer}>
                   <View style={[styles.characterPlaceholder, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.characterText, { color: colors.accent }]}>Guide</Text>
                        <TouchableOpacity 
                          style={[styles.stopButton, { backgroundColor: 'rgba(255, 59, 48, 0.9)' }]} 
                          onPress={handleStopNavigation}
                        >
                          <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                   </View>
                   <View style={[styles.alertsPlaceholder, { backgroundColor: colors.error }]}>
                       <Text style={[styles.alertText, { color: colors.onSurface }]}>
                         Alert: Entering higher risk area
                       </Text>
                       <Text style={[styles.alertSubText, { color: colors.textSecondary }]}>
                         Stay vigilant and stick to main path
                       </Text>
                   </View>
               </View>
         )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  map: {
    width: width,
    height: height,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 16,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  destinationInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#FFFFFF',
  },
  suggestionsContainer: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 16,
  },
  searchButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  startNavContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
  },
  routeInfoBox: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  routeInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  routeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfoText: {
    marginLeft: 5,
    fontSize: 14,
  },
  startButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  liveNavContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    right: 20,
    bottom: 95,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  characterPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 10,
    marginTop: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  characterText: {
    fontWeight: '600',
    fontSize: 16,
  },
  alertsPlaceholder: {
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: 'flex-start',
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  alertText: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertSubText: {
    fontSize: 14,
    marginTop: 4,
  },
  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 217, 100, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CD964',
  },

  stopButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  hiddenLocationText: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    opacity: 0,
  },
});