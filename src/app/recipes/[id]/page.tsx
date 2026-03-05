'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useProfile } from '@/lib/hooks/use-profile'
import CommentSection from '@/components/CommentSection'

interface RecipeDetail {
  id: string
  title: string
  description: string | null
  ingredients: string[] | null
  instructions: string | null
  photo_url: string | null
  created_by: string | null
  created_at: string
}

export default function RecipeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { profile, isAdmin } = useProfile()
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecipe() {
      const res = await fetch(`/api/recipes/${id}`)
      if (res.ok) setRecipe(await res.json())
      setLoading(false)
    }
    fetchRecipe()
  }, [id])

  async function handleDelete() {
    if (!confirm('Delete this recipe?')) return
    const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/recipes')
  }

  if (loading) return <div className="animate-pulse text-gray-400">Loading...</div>
  if (!recipe) return <div className="text-red-600">Recipe not found.</div>

  const canDelete = isAdmin || recipe.created_by === profile?.id

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
        {canDelete && (
          <button
            onClick={handleDelete}
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>

      {recipe.photo_url && (
        <img
          src={recipe.photo_url}
          alt={recipe.title}
          className="w-full max-h-64 object-cover rounded-lg"
        />
      )}

      {recipe.description && <p className="text-gray-600">{recipe.description}</p>}

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Ingredients</h2>
            <ul className="list-disc list-inside space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-gray-700">
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.instructions && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h2>
            <div className="prose prose-sm text-gray-700 whitespace-pre-wrap">
              {recipe.instructions}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <CommentSection parentType="recipe" parentId={id} />
      </div>

      <button
        onClick={() => router.push('/recipes')}
        className="text-sm text-brand-600 hover:underline"
      >
        &larr; Back to Recipes
      </button>
    </div>
  )
}
