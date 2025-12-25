// reducers/announcementReducer.js
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
} from '../actions/announcementAction';

const initialState = {
  announcements: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  deleteLoading: false,
  deleteError: null,
  deleteSuccess: false,
};

const announcementSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    clearCreateStatus(state) {
      state.createSuccess = false;
      state.createError = null;
    },
    clearUpdateStatus(state) {
      state.updateSuccess = false;
      state.updateError = null;
    },
    clearDeleteStatus(state) {
      state.deleteSuccess = false;
      state.deleteError = null;
    },
    clearAllStatus(state) {
      state.createSuccess = false;
      state.createError = null;
      state.updateSuccess = false;
      state.updateError = null;
      state.deleteSuccess = false;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all announcements
      .addCase(fetchAllAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAllAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create announcement
      .addCase(createAnnouncement.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.announcements.unshift(action.payload);
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
        state.createSuccess = false;
      })

      // Update announcement
      .addCase(updateAnnouncement.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        const index = state.announcements.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) {
          state.announcements[index] = action.payload;
        }
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Delete announcement
      .addCase(deleteAnnouncement.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
        state.announcements = state.announcements.filter(
          (a) => a._id !== action.payload
        );
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
        state.deleteSuccess = false;
      })

      // Toggle announcement status
      .addCase(toggleAnnouncementStatus.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(toggleAnnouncementStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.announcements.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) {
          state.announcements[index] = action.payload;
        }
      })
      .addCase(toggleAnnouncementStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const {
  clearCreateStatus,
  clearUpdateStatus,
  clearDeleteStatus,
  clearAllStatus,
} = announcementSlice.actions;

export default announcementSlice.reducer;
