import { create } from 'zustand'
import type { Note } from '@/lib/api/notes'

interface NotesState {
  // Shared state that multiple components might need
  notes: Note[]
  selectedNote: Note | null

  // Actions
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNoteInList: (note: Note) => void
  removeNote: (noteId: string) => void
  selectNote: (note: Note | null) => void
  clearSelection: () => void
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  selectedNote: null,

  setNotes: (notes) => set({ notes }),

  addNote: (note) => set((state) => ({
    notes: [...state.notes, note]
  })),

  updateNoteInList: (updatedNote) => set((state) => ({
    notes: state.notes.map(note =>
      note.id === updatedNote.id ? updatedNote : note
    ),
    selectedNote: state.selectedNote?.id === updatedNote.id
      ? updatedNote
      : state.selectedNote
  })),

  removeNote: (noteId) => set((state) => ({
    notes: state.notes.filter(note => note.id !== noteId),
    selectedNote: state.selectedNote?.id === noteId ? null : state.selectedNote
  })),

  selectNote: (note) => set({ selectedNote: note }),

  clearSelection: () => set({ selectedNote: null }),
}))
