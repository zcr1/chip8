import { create } from 'zustand';

interface AppState {
	bears: number;
	increase: () => void;
}

export const useAppStore = create<AppState>(set => ({
	bears: 0,
	increase: () => set(state => ({ bears: state.bears + 1 })),
}));
