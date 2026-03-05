'use client'

import { useEffect, useState } from 'react'
import { useProfile } from '@/lib/hooks/use-profile'
import type { CommentParentType } from '@/types/database'

interface Comment {
  id: string
  body: string
  author_id: string | null
  created_at: string
  author: { display_name: string } | null
}

interface CommentSectionProps {
  parentType: CommentParentType
  parentId: string
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function CommentSection({ parentType, parentId }: CommentSectionProps) {
  const { profile, isAdmin } = useProfile()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')

  useEffect(() => {
    async function fetchComments() {
      const res = await fetch(`/api/comments?parentType=${parentType}&parentId=${parentId}`)
      if (res.ok) setComments(await res.json())
      setLoading(false)
    }
    fetchComments()
  }, [parentType, parentId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parent_type: parentType,
        parent_id: parentId,
        body: newComment.trim(),
      }),
    })

    if (res.ok) {
      const comment = await res.json()
      setComments((prev) => [...prev, comment])
      setNewComment('')
    }
    setSubmitting(false)
  }

  async function handleEdit(id: string) {
    if (!editBody.trim()) return
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: editBody.trim() }),
    })
    if (res.ok) {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, body: editBody.trim() } : c)))
      setEditingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this comment?')) return
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Comments</h3>

      {loading ? (
        <div className="animate-pulse text-gray-400 text-sm">Loading comments...</div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {comment.author?.display_name || 'Unknown'}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={2}
                    className="block w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                  <div className="flex gap-2 mt-1">
                    {comment.author_id === profile?.id && (
                      <button
                        onClick={() => {
                          setEditingId(comment.id)
                          setEditBody(comment.body)
                        }}
                        className="text-xs text-gray-500 hover:text-brand-600"
                      >
                        Edit
                      </button>
                    )}
                    {(comment.author_id === profile?.id || isAdmin) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? '...' : 'Post'}
        </button>
      </form>
    </div>
  )
}
