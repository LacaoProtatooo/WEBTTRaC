import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  RefreshControl, 
  TextInput, 
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  StyleSheet,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DriverListItem from '../DriverListItem';
import EmptyState from '../../../components/common/EmptyState';
import styles from '../operatorStyles';
import { colors, spacing } from '../../../components/common/theme';

export default function DriversTab({ availableDrivers, allDrivers, onRefresh, refreshing }) {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('available'); // 'available', 'all'
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Filter drivers based on search and filter mode
  const filteredDrivers = useMemo(() => {
    const driversList = filterMode === 'available' ? availableDrivers : (allDrivers || availableDrivers);
    
    if (!searchQuery.trim()) return driversList;
    
    const query = searchQuery.toLowerCase();
    return driversList.filter(driver => 
      `${driver.firstname} ${driver.lastname}`.toLowerCase().includes(query) ||
      driver.username?.toLowerCase().includes(query) ||
      driver.email?.toLowerCase().includes(query) ||
      driver.phone?.includes(query)
    );
  }, [availableDrivers, allDrivers, searchQuery, filterMode]);

  // Stats
  const stats = useMemo(() => ({
    available: availableDrivers?.length || 0,
    total: allDrivers?.length || availableDrivers?.length || 0,
  }), [availableDrivers, allDrivers]);

  const handleMessage = (driver) => {
    navigation.navigate('Chat', {
      userId: driver._id || driver.id,
      userName: `${driver.firstname} ${driver.lastname}`,
      userImage: driver.image?.url
    });
  };

  const handleViewProfile = (driver) => {
    setSelectedDriver(driver);
    setProfileModalVisible(true);
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const renderDriverProfile = () => {
    if (!selectedDriver) return null;

    const fullName = `${selectedDriver.firstname || ''} ${selectedDriver.lastname || ''}`.trim();
    const isAvailable = availableDrivers?.some(d => (d._id || d.id) === (selectedDriver._id || selectedDriver.id));

    return (
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.profileModal}>
            {/* Header */}
            <View style={localStyles.profileHeader}>
              <TouchableOpacity 
                style={localStyles.closeBtn}
                onPress={() => setProfileModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.orangeShade7} />
              </TouchableOpacity>
              <Text style={localStyles.profileTitle}>Driver Profile</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Avatar & Name */}
              <View style={localStyles.avatarSection}>
                {selectedDriver.image?.url ? (
                  <Image 
                    source={{ uri: selectedDriver.image.url }} 
                    style={localStyles.profileAvatar} 
                  />
                ) : (
                  <View style={localStyles.profileAvatarFallback}>
                    <Text style={localStyles.avatarInitials}>
                      {selectedDriver.firstname?.[0]}{selectedDriver.lastname?.[0]}
                    </Text>
                  </View>
                )}
                <Text style={localStyles.profileName}>{fullName}</Text>
                <Text style={localStyles.profileUsername}>@{selectedDriver.username}</Text>
                
                {/* Status Badge */}
                <View style={[
                  localStyles.statusBadge,
                  { backgroundColor: isAvailable ? '#22C55E20' : '#F59E0B20' }
                ]}>
                  <View style={[
                    localStyles.statusDot,
                    { backgroundColor: isAvailable ? '#22C55E' : '#F59E0B' }
                  ]} />
                  <Text style={[
                    localStyles.statusText,
                    { color: isAvailable ? '#22C55E' : '#F59E0B' }
                  ]}>
                    {isAvailable ? 'Available' : 'Assigned'}
                  </Text>
                </View>
              </View>

              {/* Rating */}
              {selectedDriver.rating > 0 && (
                <View style={localStyles.ratingSection}>
                  <View style={localStyles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(selectedDriver.rating) ? "star" : "star-outline"}
                        size={24}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                  <Text style={localStyles.ratingText}>
                    {selectedDriver.rating.toFixed(1)} ({selectedDriver.numReviews || 0} reviews)
                  </Text>
                </View>
              )}

              {/* Contact Info */}
              <View style={localStyles.infoSection}>
                <Text style={localStyles.sectionTitle}>Contact Information</Text>
                
                {selectedDriver.phone && (
                  <TouchableOpacity 
                    style={localStyles.infoRow}
                    onPress={() => handleCall(selectedDriver.phone)}
                  >
                    <View style={localStyles.infoIcon}>
                      <Ionicons name="call" size={20} color={colors.primary} />
                    </View>
                    <View style={localStyles.infoContent}>
                      <Text style={localStyles.infoLabel}>Phone</Text>
                      <Text style={localStyles.infoValue}>{selectedDriver.phone}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.orangeShade5} />
                  </TouchableOpacity>
                )}

                {selectedDriver.email && (
                  <TouchableOpacity 
                    style={localStyles.infoRow}
                    onPress={() => handleEmail(selectedDriver.email)}
                  >
                    <View style={localStyles.infoIcon}>
                      <Ionicons name="mail" size={20} color={colors.primary} />
                    </View>
                    <View style={localStyles.infoContent}>
                      <Text style={localStyles.infoLabel}>Email</Text>
                      <Text style={localStyles.infoValue}>{selectedDriver.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.orangeShade5} />
                  </TouchableOpacity>
                )}

                {selectedDriver.address && (
                  <View style={localStyles.infoRow}>
                    <View style={localStyles.infoIcon}>
                      <Ionicons name="location" size={20} color={colors.primary} />
                    </View>
                    <View style={localStyles.infoContent}>
                      <Text style={localStyles.infoLabel}>Address</Text>
                      <Text style={localStyles.infoValue}>
                        {[selectedDriver.address.street, selectedDriver.address.city, selectedDriver.address.province]
                          .filter(Boolean).join(', ') || 'Not provided'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={localStyles.actionButtons}>
                <TouchableOpacity 
                  style={[localStyles.actionBtn, localStyles.messageBtn]}
                  onPress={() => {
                    setProfileModalVisible(false);
                    handleMessage(selectedDriver);
                  }}
                >
                  <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                  <Text style={localStyles.actionBtnText}>Send Message</Text>
                </TouchableOpacity>

                {selectedDriver.phone && (
                  <TouchableOpacity 
                    style={[localStyles.actionBtn, localStyles.callBtn]}
                    onPress={() => handleCall(selectedDriver.phone)}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={localStyles.actionBtnText}>Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Drivers</Text>
        <Text style={styles.subtitle}>
          {stats.available} available • {stats.total} total
        </Text>
      </View>

      {/* Search Bar */}
      <View style={localStyles.searchContainer}>
        <View style={localStyles.searchBar}>
          <Ionicons name="search" size={20} color={colors.orangeShade5} />
          <TextInput
            style={localStyles.searchInput}
            placeholder="Search drivers..."
            placeholderTextColor={colors.orangeShade5}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.orangeShade5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={localStyles.filterTabs}>
        <TouchableOpacity
          style={[
            localStyles.filterTab,
            filterMode === 'available' && localStyles.filterTabActive
          ]}
          onPress={() => setFilterMode('available')}
        >
          <Text style={[
            localStyles.filterTabText,
            filterMode === 'available' && localStyles.filterTabTextActive
          ]}>
            Available ({stats.available})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            localStyles.filterTab,
            filterMode === 'all' && localStyles.filterTabActive
          ]}
          onPress={() => setFilterMode('all')}
        >
          <Text style={[
            localStyles.filterTabText,
            filterMode === 'all' && localStyles.filterTabTextActive
          ]}>
            All Drivers ({stats.total})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Driver List */}
      <FlatList
        data={filteredDrivers}
        keyExtractor={(item) => item._id || item.id}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />
          ) : undefined
        }
        renderItem={({ item }) => (
          <DriverListItem 
            driver={item} 
            onMessage={() => handleMessage(item)}
            onViewProfile={() => handleViewProfile(item)}
            isAvailable={availableDrivers?.some(d => (d._id || d.id) === (item._id || item.id))}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={searchQuery ? "No drivers found" : "No available drivers"}
            subtitle={searchQuery ? "Try a different search term" : "All drivers are currently assigned"}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Profile Modal */}
      {renderDriverProfile()}
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.small,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ivory1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.ivory3,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.orangeShade7,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.small,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.ivory2,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.orangeShade6,
  },
  filterTabTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  profileModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: spacing.large,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory3,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ivory2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.orangeShade7,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.large,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.medium,
  },
  profileAvatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.medium,
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.orangeShade7,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: colors.orangeShade5,
    marginBottom: spacing.small,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.ivory3,
    marginHorizontal: spacing.medium,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: colors.orangeShade6,
  },
  infoSection: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.orangeShade7,
    marginBottom: spacing.medium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ivory1,
    padding: spacing.medium,
    borderRadius: 12,
    marginBottom: spacing.small,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.medium,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.orangeShade5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.orangeShade7,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.medium,
    gap: 12,
    marginTop: spacing.medium,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  messageBtn: {
    backgroundColor: colors.primary,
  },
  callBtn: {
    backgroundColor: '#22C55E',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});