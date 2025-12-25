// reducers/userReducer.js
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCurrentUser,
  updateProfile,
  updateProfileImage,
  updatePersonalInfo,
  updateAddress,
} from '../actions/userAction';

const initialState = {
  currentUser: null,
  loading: false,
  updateLoading: false,
  error: null,
  updateError: null,
  updateSuccess: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUpdateStatus(state) {
      state.updateSuccess = false;
      state.updateError = null;
    },
    setCurrentUser(state, action) {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update profile (full)
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.currentUser = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Update profile image
      .addCase(updateProfileImage.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.currentUser = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Update personal info
      .addCase(updatePersonalInfo.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updatePersonalInfo.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.currentUser = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updatePersonalInfo.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.currentUser = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      });
  },
});

export const { clearUpdateStatus, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
