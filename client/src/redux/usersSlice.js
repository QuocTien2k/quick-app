import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    allChats: [],
    allUsers: [],
    selectedChat: null,
    allUsersLoaded: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAllChats: (state, action) => {
      state.allChats = action.payload;
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
      state.allUsersLoaded = true;
    },
    resetAllUsersLoaded: (state) => {
      state.allUsersLoaded = false;
    },
    setAllUsersLoaded: (state, action) => {
      state.allUsersLoaded = action.payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
  },
});
export const {
  setUser,
  setAllChats,
  setAllUsers,
  resetAllUsersLoaded,
  setAllUsersLoaded,
  setSelectedChat,
} = usersSlice.actions;
export default usersSlice.reducer;
