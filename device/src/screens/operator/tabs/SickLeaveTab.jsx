import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../../components/common/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../operatorStyles';
import EmptyState from '../../../components/common/EmptyState';
import ErrorDisplay from '../../../components/common/ErrorDisplay';

export default function SickLeaveTab({ 
  sickLeaves, 
  loadingSickLeaves, 
  errorSickLeaves, 
  onRefresh,
  onApprove,
  onReject,
  statistics,
}) {
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#27ae60';
      case 'rejected': return '#e74c3c';
      case 'cancelled': return '#95a5a6';
      default: return '#f39c12';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'cancelled': return 'ban';
      default: return 'time';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  };

  const handleApprove = (id) => {
    Alert.alert(
      'Approve Sick Leave',
      'Are you sure you want to approve this sick leave request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => onApprove?.(id) }
      ]
    );
  };

  const handleRejectClick = (id) => {
    setRejectingId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }
    onReject?.(rejectingId, rejectionReason);
    setShowRejectModal(false);
    setRejectingId(null);
    setRejectionReason('');
  };

  // Filter sick leaves
  const filteredLeaves = statusFilter === 'all' 
    ? sickLeaves 
    : sickLeaves.filter(s => s.status === statusFilter);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[sickLeaveStyles.card, { borderLeftColor: getStatusColor(item.status) }]}
      onPress={() => { setSelectedLeave(item); setShowDetailModal(true); }}
      activeOpacity={0.7}
    >
      {/* Header with driver info */}
      <View style={sickLeaveStyles.header}>
        <View style={sickLeaveStyles.avatarContainer}>
          {item.driver?.image?.url ? (
            <Image source={{ uri: item.driver.image.url }} style={sickLeaveStyles.avatar} />
          ) : (
            <View style={sickLeaveStyles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color="#999" />
            </View>
          )}
        </View>
        <View style={sickLeaveStyles.driverInfo}>
          <Text style={sickLeaveStyles.name}>
            {item.driver?.firstname} {item.driver?.lastname}
          </Text>
          <Text style={sickLeaveStyles.submittedTime}>
            {getRelativeTime(item.createdAt)}
          </Text>
        </View>
        <View style={[sickLeaveStyles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
          <Text style={[sickLeaveStyles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Date range */}
      <View style={sickLeaveStyles.dateRow}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={sickLeaveStyles.dates}>
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </Text>
        <View style={sickLeaveStyles.daysBadge}>
          <Text style={sickLeaveStyles.daysText}>
            {calculateDays(item.startDate, item.endDate)} day(s)
          </Text>
        </View>
      </View>

      {/* Reason preview */}
      <Text style={sickLeaveStyles.reason} numberOfLines={2}>
        "{item.reason}"
      </Text>

      {/* Indicators */}
      <View style={sickLeaveStyles.indicators}>
        {item.medicalCertificate?.url && (
          <View style={sickLeaveStyles.indicatorBadge}>
            <MaterialCommunityIcons name="file-document" size={12} color="#3498db" />
            <Text style={sickLeaveStyles.indicatorText}>Medical Cert</Text>
          </View>
        )}
        {item.emergencyContact?.name && (
          <View style={sickLeaveStyles.indicatorBadge}>
            <Ionicons name="call" size={12} color="#9b59b6" />
            <Text style={sickLeaveStyles.indicatorText}>Emergency Contact</Text>
          </View>
        )}
      </View>

      {/* Action buttons for pending */}
      {item.status === 'pending' && (
        <View style={sickLeaveStyles.actionRow}>
          <TouchableOpacity 
            style={[sickLeaveStyles.actionBtn, sickLeaveStyles.rejectBtn]}
            onPress={() => handleRejectClick(item._id)}
          >
            <Ionicons name="close" size={16} color="#e74c3c" />
            <Text style={[sickLeaveStyles.actionBtnText, { color: '#e74c3c' }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[sickLeaveStyles.actionBtn, sickLeaveStyles.approveBtn]}
            onPress={() => handleApprove(item._id)}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={[sickLeaveStyles.actionBtnText, { color: '#fff' }]}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  // Detail Modal
  const renderDetailModal = () => (
    <Modal
      visible={showDetailModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowDetailModal(false)}
    >
      <View style={sickLeaveStyles.modalOverlay}>
        <View style={sickLeaveStyles.modalContent}>
          <View style={sickLeaveStyles.modalHeader}>
            <Text style={sickLeaveStyles.modalTitle}>Sick Leave Details</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {selectedLeave && (
            <ScrollView style={sickLeaveStyles.modalBody}>
              {/* Driver Info Card */}
              <View style={sickLeaveStyles.driverCard}>
                {selectedLeave.driver?.image?.url ? (
                  <Image source={{ uri: selectedLeave.driver.image.url }} style={sickLeaveStyles.driverAvatar} />
                ) : (
                  <View style={sickLeaveStyles.driverAvatarPlaceholder}>
                    <Ionicons name="person" size={32} color="#999" />
                  </View>
                )}
                <View style={sickLeaveStyles.driverDetails}>
                  <Text style={sickLeaveStyles.driverName}>
                    {selectedLeave.driver?.firstname} {selectedLeave.driver?.lastname}
                  </Text>
                  <Text style={sickLeaveStyles.driverUsername}>@{selectedLeave.driver?.username}</Text>
                  {selectedLeave.driver?.phone && (
                    <Text style={sickLeaveStyles.driverPhone}>
                      <Ionicons name="call-outline" size={12} /> {selectedLeave.driver.phone}
                    </Text>
                  )}
                </View>
              </View>

              {/* Status */}
              <View style={[sickLeaveStyles.statusBadgeLarge, { backgroundColor: getStatusColor(selectedLeave.status) + '20' }]}>
                <Ionicons name={getStatusIcon(selectedLeave.status)} size={24} color={getStatusColor(selectedLeave.status)} />
                <Text style={[sickLeaveStyles.statusTextLarge, { color: getStatusColor(selectedLeave.status) }]}>
                  {selectedLeave.status.toUpperCase()}
                </Text>
              </View>

              {/* Details */}
              <View style={sickLeaveStyles.detailRow}>
                <Ionicons name="calendar" size={20} color="#666" />
                <View style={sickLeaveStyles.detailTextContainer}>
                  <Text style={sickLeaveStyles.detailLabel}>Duration</Text>
                  <Text style={sickLeaveStyles.detailValue}>
                    {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                  </Text>
                  <Text style={sickLeaveStyles.detailSubValue}>
                    {calculateDays(selectedLeave.startDate, selectedLeave.endDate)} day(s)
                  </Text>
                </View>
              </View>

              <View style={sickLeaveStyles.detailRow}>
                <Ionicons name="document-text" size={20} color="#666" />
                <View style={sickLeaveStyles.detailTextContainer}>
                  <Text style={sickLeaveStyles.detailLabel}>Reason</Text>
                  <Text style={sickLeaveStyles.detailValue}>{selectedLeave.reason}</Text>
                </View>
              </View>

              {/* Medical Certificate */}
              {selectedLeave.medicalCertificate?.url && (
                <View style={sickLeaveStyles.detailRow}>
                  <MaterialCommunityIcons name="file-document" size={20} color="#666" />
                  <View style={sickLeaveStyles.detailTextContainer}>
                    <Text style={sickLeaveStyles.detailLabel}>Medical Certificate</Text>
                    <Image 
                      source={{ uri: selectedLeave.medicalCertificate.url }} 
                      style={sickLeaveStyles.certificateImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              )}

              {/* Emergency Contact */}
              {selectedLeave.emergencyContact?.name && (
                <View style={sickLeaveStyles.detailRow}>
                  <Ionicons name="call" size={20} color="#666" />
                  <View style={sickLeaveStyles.detailTextContainer}>
                    <Text style={sickLeaveStyles.detailLabel}>Emergency Contact</Text>
                    <Text style={sickLeaveStyles.detailValue}>{selectedLeave.emergencyContact.name}</Text>
                    <Text style={sickLeaveStyles.detailSubValue}>
                      {selectedLeave.emergencyContact.phone} ({selectedLeave.emergencyContact.relationship})
                    </Text>
                  </View>
                </View>
              )}

              {/* Rejection Reason */}
              {selectedLeave.status === 'rejected' && selectedLeave.rejectionReason && (
                <View style={[sickLeaveStyles.detailRow, { backgroundColor: '#fee' }]}>
                  <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                  <View style={sickLeaveStyles.detailTextContainer}>
                    <Text style={[sickLeaveStyles.detailLabel, { color: '#e74c3c' }]}>Rejection Reason</Text>
                    <Text style={sickLeaveStyles.detailValue}>{selectedLeave.rejectionReason}</Text>
                  </View>
                </View>
              )}

              {/* Reviewed By */}
              {selectedLeave.reviewedBy && (
                <View style={sickLeaveStyles.detailRow}>
                  <Ionicons name="person-circle" size={20} color="#666" />
                  <View style={sickLeaveStyles.detailTextContainer}>
                    <Text style={sickLeaveStyles.detailLabel}>Reviewed By</Text>
                    <Text style={sickLeaveStyles.detailValue}>
                      {selectedLeave.reviewedBy.firstname} {selectedLeave.reviewedBy.lastname}
                    </Text>
                    {selectedLeave.reviewedAt && (
                      <Text style={sickLeaveStyles.detailSubValue}>
                        on {formatDate(selectedLeave.reviewedAt)}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Action buttons in modal for pending */}
              {selectedLeave.status === 'pending' && (
                <View style={sickLeaveStyles.modalActions}>
                  <TouchableOpacity 
                    style={[sickLeaveStyles.modalActionBtn, { backgroundColor: '#fee', borderColor: '#e74c3c' }]}
                    onPress={() => { setShowDetailModal(false); handleRejectClick(selectedLeave._id); }}
                  >
                    <Ionicons name="close" size={18} color="#e74c3c" />
                    <Text style={[sickLeaveStyles.modalActionBtnText, { color: '#e74c3c' }]}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[sickLeaveStyles.modalActionBtn, { backgroundColor: '#27ae60' }]}
                    onPress={() => { setShowDetailModal(false); handleApprove(selectedLeave._id); }}
                  >
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={[sickLeaveStyles.modalActionBtnText, { color: '#fff' }]}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  // Reject Modal
  const renderRejectModal = () => (
    <Modal
      visible={showRejectModal}
      animationType="fade"
      transparent
      onRequestClose={() => setShowRejectModal(false)}
    >
      <View style={sickLeaveStyles.modalOverlay}>
        <View style={[sickLeaveStyles.modalContent, { maxHeight: '50%' }]}>
          <View style={sickLeaveStyles.modalHeader}>
            <Text style={sickLeaveStyles.modalTitle}>Reject Sick Leave</Text>
            <TouchableOpacity onPress={() => setShowRejectModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={sickLeaveStyles.rejectModalBody}>
            <Text style={sickLeaveStyles.rejectLabel}>
              Please provide a reason for rejecting this request:
            </Text>
            <TextInput
              style={sickLeaveStyles.rejectInput}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
            />
            <View style={sickLeaveStyles.rejectActions}>
              <TouchableOpacity 
                style={sickLeaveStyles.rejectCancelBtn}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={sickLeaveStyles.rejectCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={sickLeaveStyles.rejectSubmitBtn}
                onPress={handleRejectSubmit}
              >
                <Text style={sickLeaveStyles.rejectSubmitText}>Reject Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={sickLeaveStyles.tabHeader}>
        <Text style={styles.title}>Sick Leave Requests</Text>
        <TouchableOpacity onPress={onRefresh} style={sickLeaveStyles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Statistics Cards */}
      {statistics && (
        <View style={sickLeaveStyles.statsRow}>
          <View style={[sickLeaveStyles.statCard, { backgroundColor: '#fff3e0' }]}>
            <Text style={[sickLeaveStyles.statNumber, { color: '#f57c00' }]}>{statistics.pending}</Text>
            <Text style={sickLeaveStyles.statLabel}>Pending</Text>
          </View>
          <View style={[sickLeaveStyles.statCard, { backgroundColor: '#e8f5e9' }]}>
            <Text style={[sickLeaveStyles.statNumber, { color: '#388e3c' }]}>{statistics.approved}</Text>
            <Text style={sickLeaveStyles.statLabel}>Approved</Text>
          </View>
          <View style={[sickLeaveStyles.statCard, { backgroundColor: '#ffebee' }]}>
            <Text style={[sickLeaveStyles.statNumber, { color: '#d32f2f' }]}>{statistics.rejected}</Text>
            <Text style={sickLeaveStyles.statLabel}>Rejected</Text>
          </View>
          <View style={[sickLeaveStyles.statCard, { backgroundColor: '#f5f5f5' }]}>
            <Text style={[sickLeaveStyles.statNumber, { color: '#666' }]}>{statistics.total}</Text>
            <Text style={sickLeaveStyles.statLabel}>Total</Text>
          </View>
        </View>
      )}

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={sickLeaveStyles.filterScroll}
        contentContainerStyle={sickLeaveStyles.filterContent}
      >
        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              sickLeaveStyles.filterChip,
              statusFilter === status && sickLeaveStyles.filterChipActive
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[
              sickLeaveStyles.filterChipText,
              statusFilter === status && sickLeaveStyles.filterChipTextActive
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && statistics && (
                <Text> ({statistics[status] || 0})</Text>
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {errorSickLeaves && (
        <ErrorDisplay error={errorSickLeaves} onRetry={onRefresh} />
      )}
      
      {loadingSickLeaves ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredLeaves}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: spacing.medium, paddingBottom: 100 }}
          ListEmptyComponent={
            <EmptyState
              icon="medical-outline"
              title="No sick leave requests"
              subtitle={statusFilter !== 'all' ? `No ${statusFilter} requests found` : 'Your drivers haven\'t submitted any sick leave yet'}
            />
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderDetailModal()}
      {renderRejectModal()}
    </SafeAreaView>
  );
}

const sickLeaveStyles = {
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  refreshBtn: {
    padding: 8,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.medium,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },

  // Filter
  filterScroll: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterContent: {
    paddingHorizontal: spacing.medium,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
    fontSize: 14,
    color: '#333',
  },
  submittedTime: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  dates: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  daysBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  daysText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  reason: {
    color: '#555',
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 18,
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  indicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  indicatorText: {
    fontSize: 10,
    color: '#666',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rejectBtn: {
    backgroundColor: '#fee',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  approveBtn: {
    backgroundColor: '#27ae60',
  },
  actionBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  driverAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  driverUsername: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  driverPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  statusTextLarge: {
    fontSize: 15,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
    gap: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailSubValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  certificateImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 30,
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalActionBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },

  // Reject Modal
  rejectModalBody: {
    padding: 16,
  },
  rejectLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  rejectInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rejectActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  rejectCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  rejectCancelText: {
    fontWeight: '600',
    color: '#666',
  },
  rejectSubmitBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  rejectSubmitText: {
    fontWeight: '700',
    color: '#fff',
  },
};