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
      console.log('Adding notification:', action.payload);
      console.log('Message type:', typeof action.payload.message);
      const payloadMessage =
        typeof action.payload.message === 'string'
          ? action.payload.message
          : String(action.payload.message);

      state.notifications = state.notifications.filter(n => {
        const existingMessage =
          typeof n.message === 'string' ? n.message : String(n.message);
        return !(
          existingMessage === payloadMessage && n.type === action.payload.type
        );
      });

      const id = crypto.randomUUID();
      state.notifications.push({
        ...action.payload,
        id,
        duration: action.payload.duration ?? 3000,
      });
      console.log('Current notifications:', state.notifications);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload,
      );
    },
    clearNotifications: state => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;