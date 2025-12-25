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
  Image,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchInbox,
  markAllAsRead,
} from '../../redux/actions/announcementAction';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { colors, spacing, fonts } from '../../components/common/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NotificationInbox = ({ navigation }) => {
  const dispatch = useDispatch();
  const db = useAsyncSQLiteContext();
  const { inbox, unreadCount, loading } = useSelector(
    (state) => state.announcements
  );

  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoading, setImageLoading] = useState({});

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

  const handleNotificationPress = (item) => {
    // Navigate to detail screen
    navigation.navigate('NotificationDetail', { notification: item });
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

  const getTypeLabel = (type) => {
    switch (type) {
      case 'urgent':
        return 'Urgent';
      case 'warning':
        return 'Warning';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Info';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderItem = ({ item }) => {
    const { icon, color } = getIconAndColor(item.type);
    const hasImage = item.image?.url;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.isRead && styles.unreadCard,
          hasImage && styles.articleCard,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.85}
      >
        {/* Featured Image (Article Style) */}
        {hasImage && (
          <View style={styles.imageContainer}>
            {imageLoading[item._id] && (
              <View style={styles.imagePlaceholder}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
            <Image
              source={{ uri: item.image.url }}
              style={styles.featuredImage}
              resizeMode="cover"
              onLoadStart={() => setImageLoading((prev) => ({ ...prev, [item._id]: true }))}
              onLoadEnd={() => setImageLoading((prev) => ({ ...prev, [item._id]: false }))}
            />
            {/* Type Badge on Image */}
            <View style={[styles.typeBadge, { backgroundColor: color }]}>
              <Ionicons name={icon} size={12} color="#fff" />
              <Text style={styles.typeBadgeText}>{getTypeLabel(item.type)}</Text>
            </View>
            {!item.isRead && (
              <View style={styles.unreadIndicator}>
                <View style={styles.unreadDotLarge} />
              </View>
            )}
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            {!hasImage && <Ionicons name={icon} size={24} color={color} />}

            <View style={[styles.headerContent, hasImage && styles.headerContentFull]}>
              <Text style={[styles.title, hasImage && styles.articleTitle]} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.date}>{formatDate(item.scheduledDate)}</Text>
                {!hasImage && (
                  <View style={[styles.typeIndicator, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.typeText, { color }]}>{getTypeLabel(item.type)}</Text>
                  </View>
                )}
              </View>
            </View>

            {!item.isRead && !hasImage && <View style={styles.unreadDot} />}
          </View>

          {/* Preview text */}
          <Text style={styles.previewText} numberOfLines={2}>
            {item.message}
          </Text>

          {/* Tap to view hint */}
          <View style={styles.viewHint}>
            <Text style={styles.viewHintText}>Tap to read more</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.placeholder} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
    marginBottom: spacing.medium,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },

  articleCard: {
    backgroundColor: colors.surface,
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: colors.ivory4,
  },

  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: colors.ivory3,
    position: 'relative',
  },

  featuredImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.ivory3,
  },

  typeBadge: {
    position: 'absolute',
    top: spacing.small,
    left: spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },

  typeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  cardContent: {
    padding: spacing.medium,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  headerContent: {
    flex: 1,
    marginLeft: spacing.small,
  },

  headerContentFull: {
    marginLeft: 0,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },

  articleTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 24,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: spacing.small,
  },

  date: {
    fontSize: 12,
    color: colors.placeholder,
  },

  typeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: spacing.small,
  },

  unreadIndicator: {
    position: 'absolute',
    top: spacing.small,
    right: spacing.small,
  },

  unreadDotLarge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },

  previewText: {
    marginTop: spacing.small,
    fontSize: 13,
    color: colors.placeholder,
    lineHeight: 18,
  },

  viewHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.small,
    gap: 4,
  },

  viewHintText: {
    fontSize: 12,
    color: colors.placeholder,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.large * 2,
  },

  emptyText: {
    marginTop: spacing.small,
    color: colors.placeholder,
    fontSize: 16,
  },
});

export default NotificationInbox;
