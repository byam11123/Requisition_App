import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: number;
    email: string;
    fullName: string;
    role: string;
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setUser: (state, action: PayloadAction<any>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.user = action.payload.user;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
});

export const { setLoading, setUser, logout, setError, clearError } = authSlice.actions;
export default authSlice.reducer;
