import { configureStore } from '@reduxjs/toolkit';
import { useDispatch as useDispatchBase, useSelector as useSelectorBase } from 'react-redux';
import socketReducer from './slices/socketSlice';
import peerReducer from './slices/peerSlice';
import gameReducer from './slices/gameSlice';
import userReducer from './slices/userSlice';
import balanceReducer from './slices/balanceSlice';

/**
 * Creates a store and includes all the slices as reducers.
 */
export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['socket/setSocketInstance', 'peer/setPeerInstance'],
        // Ignore these paths in the state
        ignoredPaths: ['socket.socket', 'peer.peer'],
      },
    }),
  reducer: {
    socket: socketReducer,
    peer: peerReducer,
    game: gameReducer,
    user: userReducer,
    balance: balanceReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch = () => useDispatchBase<AppDispatch>();
export const useSelector = <TSelected = unknown>(
  selector: (state: RootState) => TSelected
): TSelected => useSelectorBase<RootState, TSelected>(selector);