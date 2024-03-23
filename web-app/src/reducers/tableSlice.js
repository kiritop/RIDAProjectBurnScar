// ใน tableSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import CONFIG from '../config';

// สร้าง async action ด้วย createAsyncThunk
export const fetchGetFile = createAsyncThunk('table/fetchGetFile', async () => {
  const response = await axios.get(CONFIG.API_URL+'/files');
  return response.data;
});

const tableSlice = createSlice({
  name: 'table',
  initialState: { data: [], zipFile: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGetFile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGetFile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // ใส่ข้อมูลที่ได้จาก API ลงใน state
        state.data = action.payload;
      })
      .addCase(fetchGetFile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default tableSlice.reducer;