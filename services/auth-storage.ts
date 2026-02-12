import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthUser = {
    id: string;
    email: string;
    nicename?: string;
    displayName?: string;
    avatar?: {
        full: string;
        thumb: string;
    }
};

export type AuthState = {
    token: string;
    user: AuthUser;
};

const AUTH_KEY = 'auth_state_v1';

export const saveAuth = async (state: AuthState) => {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
};

export const getAuth = async (): Promise<AuthState | null> => {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthState;
    } catch {
        return null;
    }
};

export const clearAuth = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
};

export const logout = async (): Promise<void> => {
    await clearAuth();
};

export const isLoggedIn = async (): Promise<boolean> => {
    const auth = await getAuth();
    return Boolean(auth?.token);
};
