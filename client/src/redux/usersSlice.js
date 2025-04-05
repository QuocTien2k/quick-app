import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
  name: "user",
  initialState: { user: null, allChats: [], selectedChat: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAllChats: (state, action) => {
      state.allChats = action.payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
  },
});
export const { setUser, setAllChats, setSelectedChat } = usersSlice.actions;
export default usersSlice.reducer;
