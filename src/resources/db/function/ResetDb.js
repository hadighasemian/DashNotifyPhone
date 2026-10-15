import {clearAiChatItems, clearImageChatItems, clearMessBotItems} from "../redux/aiChatSlice";

export default function ResetAllData(dispatch){
    dispatch(clearImageChatItems())
    dispatch(clearMessBotItems())
    dispatch(clearAiChatItems())
}