import { createStore } from "@tangerie/global-store";
import { createUseStore } from "./hooks.ts";

interface UIState {
    loading: boolean;
    error: string | null;
}

export const uiStore = createStore({
    state: {
        loading: false,
        error: null
    } as UIState,
    actions: {
        setLoading(state, loading: boolean) {
            state.loading = loading;
        },
        setError(state, error: string | null) {
            state.error = error;
        },
        clearError(state) {
            state.error = null;
        }
    }
});

export const useUIStore = createUseStore(uiStore);

export const { 
    setLoading,
    setError,
    clearError
} = uiStore.actions;

export const { get: getUIState } = uiStore;