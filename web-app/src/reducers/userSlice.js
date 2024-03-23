import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const user = JSON.parse(localStorage.getItem("myData"));
  const response = await fetch(`http://localhost:3000/get-users?email=${user}`);
  const data = await response.json();

  return data;
});

const userSlice = createSlice({
  name: "users",
  initialState: { data: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  },
});

export default userSlice.reducer;
