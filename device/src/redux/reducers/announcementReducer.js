// device/src/redux/reducers/announcementReducer.js
import {
  FETCH_UNREAD_ANNOUNCEMENTS_REQUEST,
  FETCH_UNREAD_ANNOUNCEMENTS_SUCCESS,
  FETCH_UNREAD_ANNOUNCEMENTS_FAILURE,
  FETCH_INBOX_REQUEST,
  FETCH_INBOX_SUCCESS,
  FETCH_INBOX_FAILURE,
  MARK_ANNOUNCEMENT_READ,
  MARK_ALL_READ,
  FETCH_UNREAD_COUNT,
} from '../actions/announcementAction';

const initialState = {
  unreadAnnouncements: [],
  inbox: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const announcementReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_UNREAD_ANNOUNCEMENTS_REQUEST:
    case FETCH_INBOX_REQUEST:
      return { ...state, loading: true, error: null };
    
    case FETCH_UNREAD_ANNOUNCEMENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        unreadAnnouncements: action.payload,
      };
    
    case FETCH_INBOX_SUCCESS:
      return {
        ...state,
        loading: false,
        inbox: action.payload.announcements,
        unreadCount: action.payload.unreadCount,
      };
    
    case FETCH_UNREAD_ANNOUNCEMENTS_FAILURE:
    case FETCH_INBOX_FAILURE:
      return { ...state, loading: false, error: action.payload };
    
    case MARK_ANNOUNCEMENT_READ:
      return {
        ...state,
        inbox: state.inbox.map(announcement =>
          announcement._id === action.payload
            ? { ...announcement, isRead: true }
            : announcement
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    
    case MARK_ALL_READ:
      return {
        ...state,
        inbox: state.inbox.map(announcement => ({
          ...announcement,
          isRead: true,
        })),
        unreadCount: 0,
      };
    
    case FETCH_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload,
      };
    
    default:
      return state;
  }
};

export default announcementReducer;