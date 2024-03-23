import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchGetFile = createAsyncThunk("getFile/fetchGetFile", async () => {
  const response = await fetch(`http://localhost:3000/files`);
  const data = await response.json();

  return data;
});

const getfileSlice = createSlice({
  name: "getFile",
  initialState: { data: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGetFile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGetFile.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  },
});

export default getfileSlice.reducer;
