import { configureStore } from '@reduxjs/toolkit';
import { authReducer, managerReducer, notificationReducer, orderReducer } from './slices';


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
