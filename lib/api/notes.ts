export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface FetchNotesParams {
  search?: string
}

export async function fetchNotes(params?: FetchNotesParams): Promise<Note[]> {
  const searchParams = new URLSearchParams()

  if (params?.search) {
    searchParams.set('search', params.search)
  }

  const url = `/api/notes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch notes')
  return response.json()
}

export async function createNote(title: string, content: string): Promise<Note> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  })
  if (!response.ok) throw new Error('Failed to create note')
  return response.json()
}

export async function updateNote(id: string, title: string, content: string): Promise<Note> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  })
  if (!response.ok) throw new Error('Failed to update note')
  return response.json()
}

export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete note')
}
