import { create } from 'zustand';
import { Category } from '@/lib/definitions';

type CategorySheetState = {
  isOpen: boolean;
  onOpen: (category?: Category) => void;
  onClose: () => void;
  category?: Category;
};

export const useCategorySheet = create<CategorySheetState>((set) => ({
  isOpen: false,
  onOpen: (category) => set({ isOpen: true, category }),
  onClose: () => set({ isOpen: false, category: undefined }),
}));
