// device/src/components/common/AnnouncementModal.jsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AnnouncementModal = ({ visible, announcements, onClose }) => {
  const getIconAndColor = (type) => {
    switch (type) {
      case 'urgent':
        return { icon: 'alert-circle', color: '#EF4444' };
      case 'warning':
        return { icon: 'warning', color: '#F59E0B' };
      case 'maintenance':
        return { icon: 'build', color: '#3B82F6' };
      default:
        return { icon: 'information-circle', color: '#10B981' };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Announcements</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {announcements.map((announcement) => {
              const { icon, color } = getIconAndColor(announcement.type);
              return (
                <View key={announcement._id} style={styles.announcementCard}>
                  <View style={styles.announcementHeader}>
                    <Ionicons name={icon} size={24} color={color} />
                    <Text style={styles.announcementTitle}>
                      {announcement.title}
                    </Text>
                  </View>
                  <Text style={styles.announcementMessage}>
                    {announcement.message}
                  </Text>
                  <Text style={styles.announcementDate}>
                    {new Date(announcement.scheduledDate).toLocaleDateString()}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    maxHeight: 400,
  },
  announcementCard: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  announcementMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  closeButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AnnouncementModal;