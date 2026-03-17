import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  isTaskDetailOpen: boolean
  setIsTaskDetailOpen: (open: boolean) => void
  createProjectDialogOpen: boolean
  setCreateProjectDialogOpen: (open: boolean) => void
  createTaskDialogOpen: boolean
  setCreateTaskDialogOpen: (open: boolean) => void
  aiBreakdownDialogOpen: boolean
  setAIBreakdownDialogOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  activeProjectId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  isTaskDetailOpen: false,
  setIsTaskDetailOpen: (open) => set({ isTaskDetailOpen: open }),
  createProjectDialogOpen: false,
  setCreateProjectDialogOpen: (open) => set({ createProjectDialogOpen: open }),
  createTaskDialogOpen: false,
  setCreateTaskDialogOpen: (open) => set({ createTaskDialogOpen: open }),
  aiBreakdownDialogOpen: false,
  setAIBreakdownDialogOpen: (open) => set({ aiBreakdownDialogOpen: open }),
}))
