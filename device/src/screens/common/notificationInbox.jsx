// device/src/screens/common/notificationInbox.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchInbox,
  markAnnouncementAsRead,
  markAllAsRead,
} from '../../redux/actions/announcementAction';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { colors, spacing, fonts } from '../../components/common/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationInbox = ({ navigation }) => {
  const dispatch = useDispatch();
  const db = useAsyncSQLiteContext();
  const { inbox, unreadCount, loading } = useSelector(
    (state) => state.announcements
  );

  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (db) loadInbox();
  }, [filter, db]);

  const loadInbox = async () => {
    if (!db) return;
    await dispatch(fetchInbox(db, filter));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInbox();
    setRefreshing(false);
  };

  const handleToggleExpand = (id, isRead) => {
    setExpandedId(expandedId === id ? null : id);
    if (!isRead) dispatch(markAnnouncementAsRead(db, id));
  };

  const getIconAndColor = (type) => {
    switch (type) {
      case 'urgent':
        return { icon: 'alert-circle', color: colors.error };
      case 'warning':
        return { icon: 'warning', color: colors.orangeShade2 };
      case 'maintenance':
        return { icon: 'build', color: colors.orangeShade4 };
      default:
        return { icon: 'information-circle', color: colors.primary };
    }
  };

  const renderItem = ({ item }) => {
    const { icon, color } = getIconAndColor(item.type);
    const isExpanded = expandedId === item._id;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.isRead && styles.unreadCard,
        ]}
        onPress={() => handleToggleExpand(item._id, item.isRead)}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <Ionicons name={icon} size={24} color={color} />

          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={isExpanded ? 0 : 1}>
              {item.title}
            </Text>
            <Text style={styles.date}>
              {new Date(item.scheduledDate).toLocaleString()}
            </Text>
          </View>

          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        {isExpanded && (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{item.message}</Text>
            {item.createdBy && (
              <Text style={styles.author}>
                From: {item.createdBy.firstname} {item.createdBy.lastname}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => dispatch(markAllAsRead(db))}>
            <Text style={styles.markAllRead}>Mark all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {['all', 'unread', 'read'].map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterTab,
              filter === key && styles.activeTab,
            ]}
            onPress={() => setFilter(key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === key && styles.activeText,
              ]}
            >
              {key.toUpperCase()}
              {key === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: spacing.large }}
        />
      ) : (
        <FlatList
          data={inbox}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: spacing.medium }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={64}
                color={colors.placeholder}
              />
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          }
        />
      )}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory3,
  },

  headerTitle: {
    flex: 1,
    marginLeft: spacing.medium,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },

  markAllRead: {
    color: colors.secondary,
    fontWeight: '600',
  },

  filterContainer: {
    flexDirection: 'row',
    padding: spacing.small,
    backgroundColor: colors.surface,
  },

  filterTab: {
    flex: 1,
    paddingVertical: spacing.small,
    borderRadius: 8,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: colors.orangeShade4,
  },

  filterText: {
    color: colors.placeholder,
    fontSize: 13,
  },

  activeText: {
    color: colors.ivory1,
    fontWeight: '600',
  },

  notificationCard: {
    backgroundColor: colors.ivory6,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.small,
    elevation: 2,
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: colors.ivory4,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  headerContent: {
    flex: 1,
    marginLeft: spacing.small,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },

  date: {
    fontSize: 12,
    color: colors.placeholder,
    marginTop: 2,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.small,
  },

  messageContainer: {
    marginTop: spacing.small,
    paddingTop: spacing.small,
    borderTopWidth: 1,
    borderTopColor: colors.ivory3,
  },

  message: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },

  author: {
    marginTop: spacing.small,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.orangeShade8,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.large,
  },

  emptyText: {
    marginTop: spacing.small,
    color: colors.placeholder,
  },
});

export default NotificationInbox;
