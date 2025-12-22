"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotes()
    }
  }, [status])

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes")
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = async () => {
    if (!title.trim() || !content.trim()) return

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })

      if (response.ok) {
        setTitle("")
        setContent("")
        setIsEditing(false)
        await fetchNotes()
      }
    } catch (error) {
      console.error("Error creating note:", error)
    }
  }

  const handleUpdateNote = async () => {
    if (!selectedNote || !title.trim() || !content.trim()) return

    try {
      const response = await fetch(`/api/notes/${selectedNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })

      if (response.ok) {
        setTitle("")
        setContent("")
        setSelectedNote(null)
        setIsEditing(false)
        await fetchNotes()
      }
    } catch (error) {
      console.error("Error updating note:", error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        if (selectedNote?.id === noteId) {
          setSelectedNote(null)
          setTitle("")
          setContent("")
          setIsEditing(false)
        }
        await fetchNotes()
      }
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
    setIsEditing(false)
  }

  const handleNewNote = () => {
    setSelectedNote(null)
    setTitle("")
    setContent("")
    setIsEditing(true)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
    } else {
      setTitle("")
      setContent("")
    }
    setIsEditing(false)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-900">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
            <p className="text-sm text-gray-600 mt-1">Organize your thoughts</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session.user?.name || "User"}</p>
              <p className="text-xs text-gray-600">{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">All Notes</h2>
                <button
                  onClick={handleNewNote}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-semibold transition shadow-sm"
                >
                  + New
                </button>
              </div>
            </div>
            <div className="p-4 max-h-[calc(100vh-240px)] overflow-y-auto">
              <div className="space-y-2">
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-sm">No notes yet.</p>
                    <p className="text-gray-500 text-xs mt-1">Create your first note!</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleSelectNote(note)}
                      className={`p-4 rounded-lg cursor-pointer border-2 transition ${
                        selectedNote?.id === note.id
                          ? "bg-blue-50 border-blue-400 shadow-md"
                          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{note.title}</h3>
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(note.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Note Editor */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            {!selectedNote && !isEditing ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-gray-500 p-8">
                <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-lg font-medium text-gray-700">Select a note or create a new one</p>
                <p className="text-sm text-gray-500 mt-1">Your notes will appear here</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-6 space-y-4 flex-1">
                  <div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Untitled Note"
                      disabled={!isEditing}
                      className="w-full text-3xl font-bold text-gray-900 border-none focus:outline-none focus:ring-0 disabled:bg-white placeholder:text-gray-400"
                    />
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex-1">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Start typing your note..."
                      disabled={!isEditing}
                      rows={18}
                      className="w-full h-full text-gray-900 border-2 border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-white disabled:border-none resize-none placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-5 py-2.5 text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={selectedNote ? handleUpdateNote : handleCreateNote}
                        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition"
                      >
                        {selectedNote ? "Save Changes" : "Create Note"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDeleteNote(selectedNote!.id)}
                        className="px-5 py-2.5 text-red-600 font-medium border-2 border-red-300 rounded-lg hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                      <button
                        onClick={handleEdit}
                        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition"
                      >
                        Edit Note
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
