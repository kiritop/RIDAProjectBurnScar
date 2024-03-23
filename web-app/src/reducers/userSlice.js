import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import CONFIG from '../config';

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const user = JSON.parse(localStorage.getItem("myData"));
  const response = await fetch(`${CONFIG.API_URL}/get-users?email=${user}`);
  const data = await response.json();

  return data;
});

export const generateApiKey = createAsyncThunk(
  'users/generateApiKey',
  async (email, thunkAPI) => {
    try {
      const response = await axios.post(`${CONFIG.API_URL}/generate`, { email });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: { data: [], loading: false, status: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(generateApiKey.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(generateApiKey.fulfilled, (state, action) => {
        state.status = 'success';
      })
      .addCase(generateApiKey.rejected, (state, action) => {
        state.status = 'failed';
      });
      
  },
});

export default userSlice.reducer;
