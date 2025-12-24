// Add this component wherever you want the notification bell (header, drawer, etc.)
// device/src/components/common/notificationBell.jsx
import React, { useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchUnreadCount } from '../../redux/actions/announcementAction';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';

const NotificationBell = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const db = useAsyncSQLiteContext();
  const { unreadCount } = useSelector((state) => state.announcements);

  useEffect(() => {
    if (!db) return;
    
    // Fetch unread count on mount
    dispatch(fetchUnreadCount(db));

    // Optionally poll for updates every minute
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount(db));
    }, 60000);

    return () => clearInterval(interval);
  }, [db, dispatch]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('NotificationInbox')}
    >
      <Ionicons name="notifications-outline" size={24} color="#000" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationBell;