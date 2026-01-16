import { create } from "zustand";

interface OpenFile {
  path: string;
  content: string;
  isDirty: boolean;
  originalContent: string;
}

interface WorkspaceState {
  // File State
  openFiles: OpenFile[];
  activeFilePath: string | null;

  // Actions
  setOpenFiles: (files: OpenFile[]) => void;
  setActiveFilePath: (path: string | null) => void;

  // Helper Actions
  openFile: (path: string, content: string) => void;
  closeFile: (path: string) => void;
  closeFilesUnderPath: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  markFileSaved: (path: string) => void;

  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Workspace Info
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  openFiles: [],
  activeFilePath: null,
  isSidebarOpen: true,
  workspaceId: null,

  setOpenFiles: (files) => set({ openFiles: files }),
  setActiveFilePath: (path) => set({ activeFilePath: path }),

  openFile: (path, content) =>
    set((state) => {
      const isAlreadyOpen = state.openFiles.some((f) => f.path === path);
      if (isAlreadyOpen) {
        return { activeFilePath: path };
      }
      return {
        openFiles: [
          ...state.openFiles,
          { path, content, originalContent: content, isDirty: false },
        ],
        activeFilePath: path,
      };
    }),

  closeFile: (path) =>
    set((state) => {
      const newOpenFiles = state.openFiles.filter((f) => f.path !== path);
      let newActiveFilePath = state.activeFilePath;

      if (state.activeFilePath === path) {
        newActiveFilePath =
          newOpenFiles.length > 0
            ? newOpenFiles[newOpenFiles.length - 1].path
            : null;
      }

      return {
        openFiles: newOpenFiles,
        activeFilePath: newActiveFilePath,
      };
    }),

  closeFilesUnderPath: (path) =>
    set((state) => {
      const newOpenFiles = state.openFiles.filter(
        (f) => !f.path.startsWith(path)
      );
      let newActiveFilePath = state.activeFilePath;

      if (state.activeFilePath && state.activeFilePath.startsWith(path)) {
        newActiveFilePath =
          newOpenFiles.length > 0
            ? newOpenFiles[newOpenFiles.length - 1].path
            : null;
      }

      return {
        openFiles: newOpenFiles,
        activeFilePath: newActiveFilePath,
      };
    }),

  updateFileContent: (path, content) =>
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.path === path
          ? { ...f, content, isDirty: content !== f.originalContent }
          : f
      ),
    })),

  markFileSaved: (path) =>
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.path === path
          ? { ...f, originalContent: f.content, isDirty: false }
          : f
      ),
    })),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setWorkspaceId: (id) => set({ workspaceId: id }),
}));
