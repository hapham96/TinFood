import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TagOption {
  value: number;
  label: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number | string;
  distance?: number | null;
}

export interface SearchState {
  selectedTags: TagOption[];
  tags: TagOption[];
  suggestions: Restaurant[];
  page: number;
  hasMore: boolean;
  loading: boolean;
}

const initialState: SearchState = {
  selectedTags: [],
  tags: [],
  suggestions: [],
  page: 1,
  hasMore: false,
  loading: false,
};

// 🧱 Slice Redux
const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setTags: (state, action: PayloadAction<TagOption[]>) => {
      state.tags = action.payload;
    },
    setSelectedTags: (state, action: PayloadAction<TagOption[]>) => {
      state.selectedTags = action.payload;
    },
    setSuggestions: (state, action: PayloadAction<Restaurant[]>) => {
      state.suggestions = action.payload;
    },
    appendSuggestions: (state, action: PayloadAction<Restaurant[]>) => {
      state.suggestions = [...state.suggestions, ...action.payload];
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetSearch: () => initialState,
  },
});

export const {
  setTags,
  setSelectedTags,
  setSuggestions,
  appendSuggestions,
  setPage,
  setHasMore,
  setLoading,
  resetSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
