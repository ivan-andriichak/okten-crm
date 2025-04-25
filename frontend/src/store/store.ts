import { configureStore } from '@reduxjs/toolkit';

import { authReducer, orderReducer } from './slices';
import { managerReducer } from './slices/managerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    managers: managerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
