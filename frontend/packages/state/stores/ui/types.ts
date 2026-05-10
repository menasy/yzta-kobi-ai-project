export interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  commandMenuOpen: boolean;
  globalLoading: boolean;
}

export interface UIActions {
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (isOpen: boolean) => void;
  setCommandMenuOpen: (isOpen: boolean) => void;
  setGlobalLoading: (isLoading: boolean) => void;
}

export type UIStore = UIState & UIActions;

export type UIStoreInitialState = Partial<UIState>;
