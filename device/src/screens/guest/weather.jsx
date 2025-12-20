/**
 * weather.jsx - Guest Weather Screen
 *
 * Weather overview + automatic advisories for Taguig City
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import WeatherAdvisoryModal from '../../components/common/WeatherAdvisoryModal';
import WeatherWidget from '../../components/home/WeatherWidget';
import { colors, spacing } from '../../components/common/theme';

// Default location: Taguig City
const TAGUIG_COORDS = { lat: 14.5176, lon: 121.0509 };

const GuestWeather = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header / Hero */}
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons
              name="partly-sunny-outline"
              size={56}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>Weather Overview</Text>
          <Text style={styles.subtitle}>Taguig City, Philippines</Text>
        </View>

        {/* Weather Widget */}
        <WeatherWidget
          latitude={TAGUIG_COORDS.lat}
          longitude={TAGUIG_COORDS.lon}
          hours={6}
        />

        {/* Advisory Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.primary}
              style={{ marginRight: spacing.small }}
            />
            <Text style={styles.infoText}>
              Weather advisories will appear automatically when rain or extreme
              heat is expected.
            </Text>
          </View>

          <Text style={styles.noteText}>
            This helps you prepare before commuting or spending time outdoors.
          </Text>
        </View>
      </ScrollView>

      {/* Weather Advisory Modal */}
      <WeatherAdvisoryModal
        latitude={TAGUIG_COORDS.lat}
        longitude={TAGUIG_COORDS.lon}
        temperatureThreshold={31}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory1,
  },

  scrollContent: {
    paddingHorizontal: spacing.large,
    paddingBottom: spacing.xlarge,
  },

  hero: {
    marginTop: spacing.large,
    marginBottom: spacing.medium,
    alignItems: 'center',
  },

  iconWrap: {
    backgroundColor: colors.ivory4,
    padding: spacing.medium,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.ivory3,
    marginBottom: spacing.small,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.orangeShade5,
    textAlign: 'center',
  },

  infoCard: {
    marginTop: spacing.large,
    backgroundColor: colors.ivory4,
    padding: spacing.medium,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.ivory3,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.orangeShade7,
    lineHeight: 20,
  },

  noteText: {
    fontSize: 13,
    color: colors.orangeShade5,
    lineHeight: 18,
  },
});

export default GuestWeather;