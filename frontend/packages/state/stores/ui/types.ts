export interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  commandMenuOpen: boolean;
  globalLoading: boolean;
  aiPanelOpen: boolean;
}

export interface UIActions {
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (isOpen: boolean) => void;
  setCommandMenuOpen: (isOpen: boolean) => void;
  setGlobalLoading: (isLoading: boolean) => void;
  setAiPanelOpen: (isOpen: boolean) => void;
  toggleAiPanel: () => void;
}

export type UIStore = UIState & UIActions;

export type UIStoreInitialState = Partial<UIState>;
