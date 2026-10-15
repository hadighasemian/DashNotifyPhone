import { createSlice } from '@reduxjs/toolkit';

const aiChatSlice = createSlice({
    name: 'chats',
    initialState: {
        aiChat: [],
        imageChat: [],
        messBotChat: [],
    },
    reducers: {
        addAiChatItem: (state, action) => {
            state.aiChat.push(action.payload);
        },
        clearAiChatItems: (state) => {
            state.aiChat = [];
        },
        addImageChatItem: (state, action) => {
            state.imageChat.push(action.payload);
        },
        clearImageChatItems: (state) => {
            state.imageChat = [];
        },
        addMessBotItem: (state, action) => {
            state.messBotChat.push(...action.payload);
        },
        clearMessBotItems: (state) => {
            state.messBotChat = [];
        },
    },
});
export const selectLastAiChatItem = (state) => {
    const aiChat = state.chats.aiChat; // Adjust 'chats' if your slice is nested
    return aiChat.length > 0 ? aiChat[aiChat.length - 1].messages : null;
};
export const selectLastImageChatItem = (state) => {
    const imageChat = state.chats.imageChat; // Adjust 'chats' if your slice is nested
    return imageChat.length > 0 ? imageChat[imageChat.length - 1].prompt : null;
};
export const selectLastMessBotChatItem = (state) => {
    const messBotChat = state.chats.messBotChat; // Adjust 'chats' if your slice is nested
    return messBotChat.length > 1 ? [messBotChat[messBotChat.length - 2].content,messBotChat[messBotChat.length - 1].content] : null;
};


export const {
    addAiChatItem, clearAiChatItems,
    addImageChatItem, clearImageChatItems ,
    addMessBotItem,clearMessBotItems
} = aiChatSlice.actions;
export default aiChatSlice.reducer;
