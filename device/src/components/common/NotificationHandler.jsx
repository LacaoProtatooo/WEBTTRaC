import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { registerForPushNotificationsAsync } from '../../utils/notification';
import { uploadNotifToken } from '../../redux/actions/userAction';
import { getUserCredentials } from '../../utils/userStorage';
import { navigationRef } from '../../navigation/navigator'; // Import navigationRef

export default function NotificationHandler() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);

  // Fetch user credentials once when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserCredentials();
        console.log('Retrieved user from AsyncStorage:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  // Register for push notifications when the user is available
  useEffect(() => {
    if (user) {
      console.log('User available for push notification registration:', user);

      registerForPushNotificationsAsync().then(token => {
        if (token) {
          setExpoPushToken(token);
          console.log('Expo Push Token generated:', token);

          // Dispatch action to save token to backend
          dispatch(uploadNotifToken({ token, id: user._id || user.id }))
            .then(response => {
              console.log('Token upload response:', response);
            })
            .catch(error => {
              console.error('Error uploading token to backend:', error);
            });
        } else {
          console.error('Failed to generate Expo Push Token.');
        }
      });
    } else {
      console.warn('No user found. Skipping push notification registration.');
    }
  }, [user]);

  // Notification listeners
  useEffect(() => {
    // Create and log notification channels on Android
    if (Platform.OS === 'android') {
      // Messages channel
      Notifications.setNotificationChannelAsync('default', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        showBadge: true,
      }).then(channel => {
        console.log('Messages Notification Channel created:', channel);
      }).catch(error => {
        console.error('Error creating messages notification channel:', error);
      });

      // Announcements channel
      Notifications.setNotificationChannelAsync('announcements', {
        name: 'Announcements',
        description: 'Important announcements from TricycleMOD',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#3B82F6',
        showBadge: true,
      }).then(channel => {
        console.log('Announcements Notification Channel created:', channel);
      }).catch(error => {
        console.error('Error creating announcements notification channel:', error);
      });
    }

    // Foreground notification listener (when app is open)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Foreground Notification Received:', JSON.stringify(notification, null, 2));
      
      const { type, senderName, text, announcementType } = notification.request.content.data || {};
      
      if (type === 'message') {
        console.log(`💬 New message from ${senderName}: ${text}`);
        // Optional: Show custom in-app notification UI
      } else if (type === 'announcement') {
        console.log(`📢 New announcement (${announcementType}): ${notification.request.content.title}`);
        // The notification will show automatically, user can tap to see more
      }
    });

    // Response listener when user taps notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📲 Notification Tapped (Response):', JSON.stringify(response, null, 2));
      
      const data = response.notification.request.content.data;
      const content = response.notification.request.content;
      
      // Navigate based on notification type
      if (navigationRef.isReady()) {
        if (data?.type === 'message' && data?.senderId) {
          console.log('🚀 Navigating to chat with user:', data.senderName);
          navigationRef.navigate('Chat', {
            userId: data.senderId,
            userName: data.senderName,
            userImage: data.senderImage,
          });
        } else if (data?.type === 'announcement' && data?.announcementId) {
          console.log('🚀 Navigating to notification detail:', data.announcementId);
          // Navigate to detail screen with notification data from push
          navigationRef.navigate('NotificationDetail', {
            notification: {
              _id: data.announcementId,
              title: content.title,
              message: content.body,
              type: data.announcementType || 'info',
              targetAudience: data.targetAudience || 'all',
              scheduledDate: new Date().toISOString(),
              isRead: false,
              // Note: image and createdBy won't be available from push notification
              // The detail screen will show what's available
            },
          });
        } else if (data?.type === 'announcement') {
          // Fallback to inbox if no announcementId
          console.log('🚀 Navigating to notifications inbox');
          navigationRef.navigate('NotificationInbox');
        }
      } else {
        console.warn('Navigation not ready yet');
      }
    });

    // Cleanup listeners
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []); // Remove navigation from dependencies

  return null; // No UI
}
