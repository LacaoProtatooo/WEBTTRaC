// device/src/screens/common/notificationDetail.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { markAnnouncementAsRead, fetchAnnouncementById } from '../../redux/actions/announcementAction';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { colors, spacing, fonts } from '../../components/common/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NotificationDetail = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const db = useAsyncSQLiteContext();
  const { notification: initialNotification } = route.params || {};
  
  const [notification, setNotification] = useState(initialNotification);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Fetch full announcement data if we only have partial data (from push notification)
  useEffect(() => {
    const loadFullAnnouncement = async () => {
      // Check if we have partial data (from push notification - no image or createdBy)
      if (initialNotification && db && !initialNotification.createdBy && !initialNotification.image) {
        setLoading(true);
        try {
          const fullAnnouncement = await fetchAnnouncementById(db, initialNotification._id);
          if (fullAnnouncement) {
            setNotification(fullAnnouncement);
          }
        } catch (error) {
          console.error('Error fetching full announcement:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFullAnnouncement();
  }, [initialNotification, db]);

  useEffect(() => {
    // Mark as read when viewing
    if (notification && !notification.isRead && db) {
      dispatch(markAnnouncementAsRead(db, notification._id));
    }
  }, [notification, db]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading notification...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Notification not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getTypeConfig = (type) => {
    switch (type) {
      case 'urgent':
        return { icon: 'alert-circle', color: colors.error, label: 'Urgent' };
      case 'warning':
        return { icon: 'warning', color: colors.orangeShade2, label: 'Warning' };
      case 'maintenance':
        return { icon: 'build', color: colors.orangeShade4, label: 'Maintenance' };
      default:
        return { icon: 'information-circle', color: colors.primary, label: 'Info' };
    }
  };

  const typeConfig = getTypeConfig(notification.type);
  const hasImage = notification.image?.url;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${notification.title}\n\n${notification.message}`,
        title: notification.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Notification
          </Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Image */}
        {hasImage && (
          <View style={styles.imageContainer}>
            {imageLoading && !imageError && (
              <View style={styles.imagePlaceholder}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            {!imageError ? (
              <Image
                source={{ uri: notification.image.url }}
                style={styles.featuredImage}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            ) : (
              <View style={styles.imageErrorContainer}>
                <Ionicons name="image-outline" size={48} color={colors.placeholder} />
                <Text style={styles.imageErrorText}>Failed to load image</Text>
              </View>
            )}
          </View>
        )}

        {/* Type Badge */}
        <View style={styles.badgeContainer}>
          <View style={[styles.typeBadge, { backgroundColor: typeConfig.color }]}>
            <Ionicons name={typeConfig.icon} size={16} color="#fff" />
            <Text style={styles.typeBadgeText}>{typeConfig.label}</Text>
          </View>
          {!notification.isRead && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>NEW</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>{notification.title}</Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.placeholder} />
            <Text style={styles.metaText}>{formatDate(notification.scheduledDate)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.placeholder} />
            <Text style={styles.metaText}>{formatTime(notification.scheduledDate)}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Message Content */}
        <Text style={styles.message}>{notification.message}</Text>

        {/* Author Info */}
        {notification.createdBy && (
          <View style={styles.authorContainer}>
            <View style={styles.authorIcon}>
              <Ionicons name="person-circle" size={40} color={colors.orangeShade6} />
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorLabel}>Posted by</Text>
              <Text style={styles.authorName}>
                {notification.createdBy.firstname} {notification.createdBy.lastname}
              </Text>
            </View>
          </View>
        )}

        {/* Expiry Info */}
        {notification.expiryDate && (
          <View style={styles.expiryContainer}>
            <Ionicons name="hourglass-outline" size={16} color={colors.orangeShade8} />
            <Text style={styles.expiryText}>
              Expires: {formatDate(notification.expiryDate)}
            </Text>
          </View>
        )}

        {/* Target Audience */}
        <View style={styles.audienceContainer}>
          <Ionicons name="people-outline" size={16} color={colors.placeholder} />
          <Text style={styles.audienceText}>
            For: {notification.targetAudience === 'all' ? 'Everyone' : notification.targetAudience}
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.medium,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory3,
  },
  
  headerButton: {
    padding: spacing.small,
  },
  
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: spacing.large * 2,
  },
  
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 220,
    backgroundColor: colors.ivory3,
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
    zIndex: 1,
  },
  
  imageErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.ivory3,
  },
  
  imageErrorText: {
    marginTop: spacing.small,
    color: colors.placeholder,
    fontSize: 14,
  },
  
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.medium,
    gap: spacing.small,
  },
  
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  unreadBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.medium,
    lineHeight: 32,
  },
  
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.small,
    gap: spacing.medium,
  },
  
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  metaText: {
    fontSize: 13,
    color: colors.placeholder,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.ivory3,
    marginHorizontal: spacing.medium,
    marginVertical: spacing.medium,
  },
  
  message: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    paddingHorizontal: spacing.medium,
    textAlign: 'justify',
  },
  
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    marginTop: spacing.large,
    marginHorizontal: spacing.medium,
    backgroundColor: colors.ivory5,
    borderRadius: 12,
  },
  
  authorIcon: {
    marginRight: spacing.small,
  },
  
  authorInfo: {
    flex: 1,
  },
  
  authorLabel: {
    fontSize: 12,
    color: colors.placeholder,
  },
  
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.medium,
    gap: 6,
  },
  
  expiryText: {
    fontSize: 13,
    color: colors.orangeShade8,
  },
  
  audienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.small,
    gap: 6,
  },
  
  audienceText: {
    fontSize: 13,
    color: colors.placeholder,
    textTransform: 'capitalize',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  
  loadingText: {
    marginTop: spacing.medium,
    fontSize: 16,
    color: colors.placeholder,
  },
  
  errorText: {
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.medium,
    marginBottom: spacing.large,
  },
  
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
  },
  
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default NotificationDetail;
