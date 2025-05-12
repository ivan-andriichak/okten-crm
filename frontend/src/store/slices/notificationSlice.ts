import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import React from 'react';

interface Notification {
  id: string;
  message: React.ReactNode;
  type: 'error' | 'success' | 'info';
  duration?: number;
}

export interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id'>>,
    ) => {
      const existingNotification = state.notifications.find(
        n =>
          n.message === action.payload.message &&
          n.type === action.payload.type,
      );
      if (existingNotification) {
        return;
      }
      const id = crypto.randomUUID();
      state.notifications.push({
        ...action.payload,
        id,
        duration: action.payload.duration ?? 5000,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload,
      );
    },
  },
});

export const { addNotification, removeNotification } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
