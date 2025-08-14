import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from './interfaces/notification';

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
      const payloadMessage = typeof action.payload.message === 'string' ? action.payload.message : String(action.payload.message);
      state.notifications = state.notifications.filter(n => {
        const existingMessage = String(n.message);
        return !(existingMessage === payloadMessage && n.type === action.payload.type);
      });
      if (state.notifications.length >= 1) {
        state.notifications.shift();
      }
      const id = crypto.randomUUID();
      state.notifications.push({
        ...action.payload,
        id,
        duration: action.payload.duration ?? 3000,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: state => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;