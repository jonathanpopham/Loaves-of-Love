'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Recipe {
  id: string
  title: string
  description: string | null
  photo_url: string | null
  created_at: string
  profiles: { display_name: string } | null
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchRecipes() {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/recipes?${params}`)
      if (res.ok) setRecipes(await res.json())
      setLoading(false)
    }
    const timer = setTimeout(fetchRecipes, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
        <Link
          href="/recipes/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Add Recipe
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
      />

      {loading ? (
        <div className="animate-pulse text-gray-400">Loading...</div>
      ) : recipes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {search ? 'No recipes match your search.' : 'No recipes yet. Add the first one!'}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {recipe.photo_url && (
                <img
                  src={recipe.photo_url}
                  alt={recipe.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="font-semibold text-gray-900">{recipe.title}</h2>
                {recipe.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {recipe.profiles?.display_name && `by ${recipe.profiles.display_name} · `}
                  {new Date(recipe.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
