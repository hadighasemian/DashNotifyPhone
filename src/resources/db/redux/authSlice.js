import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        auth: {
            login: {
                login: false,
                token: '',
            },
            clientRole: {

            },
            user: {

            }
        }
    },
    reducers: {
        setAuthState: (state, action) => {
            state.auth = action.payload
        },
        setClientRole: (state, action) => {
            // console.log('action.payload',action)
            state.clientRole = action.payload
            // state.auth.clientRole = action.payload
        },
        setAuthUser: (state, action) => {
            // console.log('action.payload',action.payload)
            state.auth.user = action.payload
        },

    },
});

export const { setAuthState,setClientRole,setAuthUser } = authSlice.actions;
export default authSlice.reducer;
