import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
  name: "user",
  initialState: { user: null, allChats: [] },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAllChats: (state, action) => {
      state.allChats = action.payload;
    },
  },
});
export const { setUser, setAllChats } = usersSlice.actions;
export default usersSlice.reducer;
