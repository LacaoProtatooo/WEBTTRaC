// actions/announcementAction.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getToken } from './authAction';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch all announcements (admin)
export const fetchAllAnnouncements = createAsyncThunk(
  'announcement/fetchAll',
  async (_, thunkAPI) => {
    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/announcements/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        return data.announcements;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Create announcement
export const createAnnouncement = createAsyncThunk(
  'announcement/create',
  async (announcementData, thunkAPI) => {
    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(announcementData),
      });

      const data = await res.json();

      if (data.success) {
        return data.announcement;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update announcement
export const updateAnnouncement = createAsyncThunk(
  'announcement/update',
  async ({ id, ...updateData }, thunkAPI) => {
    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (data.success) {
        return data.announcement;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Delete announcement
export const deleteAnnouncement = createAsyncThunk(
  'announcement/delete',
  async (id, thunkAPI) => {
    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        return id;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Toggle announcement active status
export const toggleAnnouncementStatus = createAsyncThunk(
  'announcement/toggleStatus',
  async ({ id, isActive }, thunkAPI) => {
    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await res.json();

      if (data.success) {
        return data.announcement;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
