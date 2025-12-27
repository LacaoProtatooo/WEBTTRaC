import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../components/common/theme';

export default function DriverListItem({ driver, onMessage, onViewProfile, isAvailable = true }) {
  const fullName = `${driver.firstname || ''} ${driver.lastname || ''}`.trim();
  
  return (
    <TouchableOpacity 
      style={localStyles.container}
      onPress={onViewProfile}
      activeOpacity={0.7}
    >
      {/* Status indicator */}
      <View style={[
        localStyles.statusStrip,
        { backgroundColor: isAvailable ? '#22C55E' : '#F59E0B' }
      ]} />
      
      {/* Avatar */}
      <View style={localStyles.avatarContainer}>
        {driver.image?.url ? (
          <Image source={{ uri: driver.image.url }} style={localStyles.avatar} />
        ) : (
          <View style={localStyles.avatarFallback}>
            <Text style={localStyles.avatarText}>
              {driver.firstname?.[0]}{driver.lastname?.[0]}
            </Text>
          </View>
        )}
        {/* Online indicator */}
        <View style={[
          localStyles.onlineIndicator,
          { backgroundColor: isAvailable ? '#22C55E' : '#F59E0B' }
        ]} />
      </View>

      {/* Info */}
      <View style={localStyles.info}>
        <View style={localStyles.nameRow}>
          <Text style={localStyles.name} numberOfLines={1}>{fullName}</Text>
          {isAvailable && (
            <View style={localStyles.availableBadge}>
              <Text style={localStyles.availableBadgeText}>Available</Text>
            </View>
          )}
        </View>
        <Text style={localStyles.username}>@{driver.username}</Text>
        
        {/* Rating & Contact */}
        <View style={localStyles.metaRow}>
          {driver.rating > 0 && (
            <View style={localStyles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={localStyles.ratingText}>
                {driver.rating.toFixed(1)} ({driver.numReviews || 0})
              </Text>
            </View>
          )}
          {driver.phone && (
            <View style={localStyles.phoneBadge}>
              <Ionicons name="call-outline" size={12} color={colors.orangeShade5} />
              <Text style={localStyles.phoneText}>{driver.phone}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={localStyles.actions}>
        <TouchableOpacity 
          style={localStyles.messageBtn}
          onPress={(e) => {
            e.stopPropagation();
            onMessage?.();
          }}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={localStyles.profileBtn}
          onPress={onViewProfile}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.orangeShade5} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ivory1,
    marginHorizontal: spacing.medium,
    marginBottom: spacing.small,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.ivory3,
    overflow: 'hidden',
  },
  statusStrip: {
    width: 4,
    alignSelf: 'stretch',
  },
  avatarContainer: {
    position: 'relative',
    marginLeft: spacing.medium,
    marginRight: spacing.small,
    marginVertical: spacing.medium,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.ivory1,
  },
  info: {
    flex: 1,
    paddingVertical: spacing.medium,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.orangeShade7,
    flexShrink: 1,
  },
  availableBadge: {
    backgroundColor: '#22C55E20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  availableBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#22C55E',
  },
  username: {
    fontSize: 13,
    color: colors.orangeShade5,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.orangeShade6,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 12,
    color: colors.orangeShade5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.small,
    gap: 8,
  },
  messageBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});