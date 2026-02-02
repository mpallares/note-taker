"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useNotesStore } from "@/store/useNotesStore"
import * as notesApi from "@/lib/api/notes"
import { toast } from "sonner"

export default function NotesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Zustand store - only shared state
  const notes = useNotesStore((state) => state.notes)
  const selectedNote = useNotesStore((state) => state.selectedNote)
  const setNotes = useNotesStore((state) => state.setNotes)
  const addNote = useNotesStore((state) => state.addNote)
  const updateNoteInList = useNotesStore((state) => state.updateNoteInList)
  const removeNote = useNotesStore((state) => state.removeNote)
  const selectNote = useNotesStore((state) => state.selectNote)

  // Local component state - only this component needs it
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      loadNotes()
    }
  }, [status, searchQuery])

  async function loadNotes() {
    try {
      const data = await notesApi.fetchNotes({
        search: searchQuery,
      })
      setNotes(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load notes")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateNote() {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required")
      return
    }

    try {
      const newNote = await notesApi.createNote(title, content)
      addNote(newNote)
      setTitle("")
      setContent("")
      setIsEditing(false)
      toast.success("Note created!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to create note")
    }
  }

  async function handleUpdateNote() {
    if (!selectedNote || !title.trim() || !content.trim()) {
      toast.error("Title and content are required")
      return
    }

    try {
      const updatedNote = await notesApi.updateNote(selectedNote.id, title, content)
      updateNoteInList(updatedNote)
      setTitle("")
      setContent("")
      setIsEditing(false)
      toast.success("Note updated!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to update note")
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      await notesApi.deleteNote(noteId)
      removeNote(noteId)
      setTitle("")
      setContent("")
      setIsEditing(false)
      toast.success("Note deleted!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete note")
    }
  }

  function handleSelectNote(note: notesApi.Note) {
    selectNote(note)
    setTitle(note.title)
    setContent(note.content)
    setIsEditing(false)
  }

  function handleNewNote() {
    selectNote(null)
    setTitle("")
    setContent("")
    setIsEditing(true)
  }

  function handleStartEditing() {
    setIsEditing(true)
  }

  function handleCancel() {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
    } else {
      setTitle("")
      setContent("")
    }
    setIsEditing(false)
  }

  function handleSave() {
    if (selectedNote) {
      handleUpdateNote()
    } else {
      handleCreateNote()
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg">
            <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-lg font-semibold text-gray-900">Loading your notes...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NoteTaker</h1>
                <p className="text-xs text-gray-600">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{session.user?.name || "User"}</p>
                  <p className="text-xs text-gray-600 leading-tight">{session.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50 space-y-4">
              <button
                onClick={handleNewNote}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Note
              </button>

              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="block w-full pl-10 pr-10 py-2.5 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="p-4 max-h-[calc(100vh-320px)] overflow-y-auto">
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {searchQuery ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        )}
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {searchQuery ? "No notes found" : "No notes yet"}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {searchQuery
                        ? "Try a different search term"
                        : "Create your first note to get started!"}
                    </p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleSelectNote(note)}
                      className={`group p-4 rounded-xl cursor-pointer transition-all ${
                        selectedNote?.id === note.id
                          ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 shadow-md"
                          : "bg-white/60 border-2 border-gray-100 hover:border-indigo-200 hover:shadow-sm hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-base mb-1">{note.title || "Untitled"}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{note.content}</p>
                        </div>
                        {selectedNote?.id === note.id && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 mt-2"></div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          {new Date(note.updatedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Note Editor */}
          <div className="lg:col-span-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden min-h-[calc(100vh-180px)]">
            {!selectedNote && !isEditing ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="w-24 h-24 mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to NoteTaker</h3>
                <p className="text-gray-600 mb-6 text-center max-w-md">Select a note from the sidebar or create a new one to start writing</p>
                <button
                  onClick={handleNewNote}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create a note
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-8 space-y-5 flex-1">
                  <div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Untitled Note"
                      disabled={!isEditing}
                      className="w-full text-4xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 disabled:bg-transparent placeholder:text-gray-300"
                    />
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <div className="flex-1">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Start writing..."
                      disabled={!isEditing}
                      className="w-full h-full min-h-[400px] text-lg text-gray-700 leading-relaxed bg-transparent border-none focus:outline-none focus:ring-0 resize-none placeholder:text-gray-300"
                    />
                  </div>
                </div>
                <div className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm px-8 py-5 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {selectedNote && (
                      <span>Last edited {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancel}
                          className="px-5 py-2.5 text-gray-700 font-medium bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                        >
                          {selectedNote ? "Save Changes" : "Create Note"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDeleteNote(selectedNote!.id)}
                          className="px-5 py-2.5 text-red-600 font-medium bg-white border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          onClick={handleStartEditing}
                          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
