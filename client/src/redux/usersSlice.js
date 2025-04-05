import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
  name: "user",
  initialState: { user: null, allChats: [], allUsers: [], selectedChat: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAllChats: (state, action) => {
      state.allChats = action.payload;
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
  },
});
export const { setUser, setAllChats, setAllUsers, setSelectedChat } =
  usersSlice.actions;
export default usersSlice.reducer;
