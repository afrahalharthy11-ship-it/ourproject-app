import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

/* =========================
   FETCH ALL USERS (MANAGER)
========================= */

export const fetchAllUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/manager/users");
      return res.data.users;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load users"
      );
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;