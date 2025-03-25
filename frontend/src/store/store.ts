import { configureStore } from '@reduxjs/toolkit';

import { authReducer, orderReducer } from './slices';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
