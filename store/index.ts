import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { platformMiddleware } from "./platformMiddleware";
import { apiSlice } from "./api/apiSlice";
import filterReducer from "./slices/filterSlice";
import listingsReducer from "./slices/listingsSlice";
import favoritesReducer from "./slices/favoritesSlice";
import bookingReducer from "./slices/bookingSlice";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import messagesReducer from "./slices/messagesSlice";
import languageReducer from "./slices/languageSlice";
import roomTypesReducer from "./slices/roomTypesSlice";
import reviewsReducer from "./slices/reviewsSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    filter: filterReducer,
    listings: listingsReducer,
    favorites: favoritesReducer,
    booking: bookingReducer,
    ui: uiReducer,
    messages: messagesReducer,
    language: languageReducer,
    roomTypes: roomTypesReducer,
    reviews: reviewsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(platformMiddleware, apiSlice.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
