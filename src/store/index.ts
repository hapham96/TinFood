import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "./searchSlice";

export const store = configureStore({
  reducer: {
    search: searchReducer,
  },
});

// 🔹 Xuất type hỗ trợ cho useSelector & useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
