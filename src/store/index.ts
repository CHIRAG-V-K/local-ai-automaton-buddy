
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['chat/addUploadedFile'],
        ignoredPaths: ['chat.uploadedFiles'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
