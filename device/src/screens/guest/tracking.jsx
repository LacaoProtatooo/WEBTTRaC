/**
 * tracking.jsx - Guest GPS Tracking Screen
 *
 * Shows current location, speed, and basic tracking info for guests
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../../components/common/theme';

// Taguig City coordinates
const TAGUIG_CENTER = { latitude: 14.5176, longitude: 121.0509 };

const GuestTracking = () => {
  const mapRef = useRef(null);
  const watchRef = useRef(null);
  
  const [region, setRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [speedKph, setSpeedKph] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [heading, setHeading] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestPermissionAndStart();

    return () => {
      stopTracking();
    };
  }, []);

  const requestPermissionAndStart = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required for GPS tracking'
        );
        return;
      }

      setHasPermission(true);

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(initialRegion);
      setCurrentLocation({ latitude, longitude });
      updateLocationData(location);

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your location');
    }
  };

  const updateLocationData = (location) => {
    const { speed, altitude, accuracy, heading } = location.coords;
    
    // Convert speed from m/s to km/h
    const kph = (typeof speed === 'number' && !isNaN(speed)) ? speed * 3.6 : 0;
    setSpeedKph(Math.round(kph * 10) / 10);
    
    setAltitude(altitude ? Math.round(altitude * 10) / 10 : 0);
    setAccuracy(accuracy ? Math.round(accuracy * 10) / 10 : 0);
    setHeading(heading ? Math.round(heading) : 0);
  };

  const startTracking = async () => {
    if (!hasPermission) {
      await requestPermissionAndStart();
      return;
    }

    if (isTracking) {
      Alert.alert('Tracking', 'GPS tracking is already active');
      return;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Update every meter
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          
          setCurrentLocation({ latitude, longitude });
          updateLocationData(location);

          // Center map on current location
          if (mapRef.current) {
            mapRef.current.animateCamera(
              {
                center: { latitude, longitude },
              },
              { duration: 300 }
            );
          }
        }
      );

      watchRef.current = subscription;
      setIsTracking(true);
      Alert.alert('GPS Tracking', 'Tracking started successfully');
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Error', 'Failed to start GPS tracking');
    }
  };

  const stopTracking = () => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
      setIsTracking(false);
    }
  };

  const centerOnLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: currentLocation,
          zoom: 17,
        },
        { duration: 500 }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="navigate-circle-outline" size={24} color={colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>GPS Tracking</Text>
            <Text style={styles.headerSubtitle}>
              {isTracking ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isTracking ? '#28a745' : '#6c757d' }
          ]} />
        </View>
      </View>

      {/* Map */}
      {region ? (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={isTracking}
        >
          {currentLocation && (
            <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.locationMarker}>
                <Ionicons name="navigate" size={20} color="#fff" />
              </View>
            </Marker>
          )}

          {/* Accuracy circle */}
          {currentLocation && accuracy > 0 && (
            <Circle
              center={currentLocation}
              radius={accuracy}
              strokeColor="rgba(66,133,244,0.3)"
              fillColor="rgba(66,133,244,0.1)"
            />
          )}
        </MapView>
      ) : (
        <View style={styles.loading}>
          <Ionicons name="location-outline" size={48} color={colors.orangeShade4} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      {/* GPS Info Panel */}
      <View style={styles.infoPanel}>
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Speed</Text>
            <Text style={styles.infoValue}>{speedKph} km/h</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="compass-outline" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Heading</Text>
            <Text style={styles.infoValue}>{heading}°</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="arrow-up-outline" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Altitude</Text>
            <Text style={styles.infoValue}>{altitude} m</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="radio-outline" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Accuracy</Text>
            <Text style={styles.infoValue}>±{accuracy} m</Text>
          </View>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlBtn,
            isTracking && styles.controlBtnActive
          ]}
          onPress={isTracking ? stopTracking : startTracking}
        >
          <Ionicons
            name={isTracking ? 'stop-circle-outline' : 'play-circle-outline'}
            size={24}
            color="#fff"
          />
          <Text style={styles.controlBtnText}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.centerBtn}
          onPress={centerOnLocation}
        >
          <Ionicons name="locate-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.ivory1,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: spacing.small,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.orangeShade5,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.ivory2,
  },
  loadingText: {
    marginTop: spacing.medium,
    fontSize: 16,
    color: colors.orangeShade5,
  },
  locationMarker: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  infoPanel: {
    backgroundColor: colors.ivory1,
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.ivory3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.ivory4,
    padding: spacing.small,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ivory3,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: colors.orangeShade5,
    marginTop: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.orangeShade7,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.medium,
    backgroundColor: colors.ivory1,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.small,
    borderRadius: 10,
    marginRight: spacing.small,
  },
  controlBtnActive: {
    backgroundColor: '#dc3545',
  },
  controlBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: spacing.small,
  },
  centerBtn: {
    backgroundColor: colors.ivory4,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ivory3,
  },
});

export default GuestTracking;