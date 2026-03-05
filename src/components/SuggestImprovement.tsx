'use client'

import { useState } from 'react'
import { CATEGORY_LABELS, type SuggestionCategory } from '@/lib/suggestions'

export default function SuggestImprovement() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ issueUrl?: string } | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(null)

    const form = new FormData(e.currentTarget)
    const body = {
      title: form.get('title'),
      description: form.get('description'),
      category: form.get('category'),
    }

    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const data = await res.json()
      setSuccess({ issueUrl: data.issueUrl })
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  function handleClose() {
    setOpen(false)
    setSuccess(null)
    setError('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-brand-700 z-50"
      >
        Suggest Improvement
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {success ? (
              <div className="text-center space-y-3">
                <h2 className="text-lg font-bold text-gray-900">Thank you!</h2>
                <p className="text-sm text-gray-600">
                  Your suggestion has been submitted. Our team will review it.
                </p>
                {success.issueUrl && (
                  <a
                    href={success.issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:underline"
                  >
                    View on GitHub
                  </a>
                )}
                <button
                  onClick={handleClose}
                  className="block mx-auto mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Suggest an Improvement</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="sug-title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      id="sug-title"
                      name="title"
                      type="text"
                      required
                      placeholder="Brief summary"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sug-description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="sug-description"
                      name="description"
                      required
                      rows={4}
                      placeholder="What would you like to see improved or added?"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sug-category"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Category
                    </label>
                    <select
                      id="sug-category"
                      name="category"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
                    >
                      {(Object.keys(CATEGORY_LABELS) as SuggestionCategory[]).map((key) => (
                        <option key={key} value={key}>
                          {CATEGORY_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
