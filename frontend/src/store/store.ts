import { configureStore } from '@reduxjs/toolkit';

import { authReducer, orderReducer } from './slices';
import { managerReducer } from './slices/managerSlice';
import { notificationReducer } from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    managers: managerReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
