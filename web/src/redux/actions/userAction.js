// actions/userAction.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getToken, getUserCredentials, storeUserCredentials } from './authAction';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch current user from local storage
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, thunkAPI) => {
    try {
      const userCredentials = getUserCredentials();
      if (!userCredentials) {
        return thunkAPI.rejectWithValue('No user credentials found');
      }
      return userCredentials;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update profile with Cloudinary image upload
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const token = getToken();
      const formData = new FormData();

      // Append user ID
      formData.append('userId', userData._id || userData.id);

      // Append basic fields
      if (userData.username) formData.append('username', userData.username);
      if (userData.firstname) formData.append('firstname', userData.firstname);
      if (userData.lastname) formData.append('lastname', userData.lastname);
      if (userData.email) formData.append('email', userData.email);
      if (userData.phone) formData.append('phone', userData.phone);

      // Append address as JSON string
      if (userData.address) {
        formData.append('address', JSON.stringify(userData.address));
      }

      // Append image file if available (for Cloudinary upload)
      if (userData.imageFile) {
        formData.append('image', userData.imageFile);
      }

      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // Update local storage with new user data
        storeUserCredentials(data.user);
        return data.user;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update profile image only
export const updateProfileImage = createAsyncThunk(
  'user/updateProfileImage',
  async ({ userId, imageFile }, thunkAPI) => {
    try {
      const token = getToken();
      const formData = new FormData();

      formData.append('userId', userId);
      formData.append('image', imageFile);

      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // Update local storage with new user data
        storeUserCredentials(data.user);
        return data.user;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update personal info only (without image)
export const updatePersonalInfo = createAsyncThunk(
  'user/updatePersonalInfo',
  async (userData, thunkAPI) => {
    try {
      const token = getToken();
      const formData = new FormData();

      formData.append('userId', userData.userId || userData._id || userData.id);
      if (userData.username) formData.append('username', userData.username);
      if (userData.firstname) formData.append('firstname', userData.firstname);
      if (userData.lastname) formData.append('lastname', userData.lastname);
      if (userData.phone) formData.append('phone', userData.phone);

      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        storeUserCredentials(data.user);
        return data.user;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update address only
export const updateAddress = createAsyncThunk(
  'user/updateAddress',
  async ({ userId, address }, thunkAPI) => {
    try {
      const token = getToken();
      const formData = new FormData();

      formData.append('userId', userId);
      formData.append('address', JSON.stringify(address));

      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        storeUserCredentials(data.user);
        return data.user;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
