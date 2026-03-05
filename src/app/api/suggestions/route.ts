import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildIssueBody, buildIssueTitle } from '@/lib/suggestions'
import type { SuggestionCategory } from '@/lib/suggestions'

const GITHUB_TOKEN = process.env.GITHUB_SUGGESTIONS_TOKEN || process.env.GH_WORKFLOW_TOKEN
const GITHUB_REPO = process.env.GITHUB_SUGGESTIONS_REPO || 'jonathanpopham/Loaves-of-Love'

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const MAX_PER_DAY = 3

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 })
    return true
  }

  if (entry.count >= MAX_PER_DAY) return false
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: 'GitHub integration not configured' }, { status: 503 })
  }

  // Rate limit check
  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 3 suggestions per day.' },
      { status: 429 }
    )
  }

  const body = await request.json()
  const { title, description, category } = body as {
    title: string
    description: string
    category: SuggestionCategory
  }

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
  }

  // Get user display name for attribution
  const { data: profile } = (await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()) as unknown as { data: { display_name: string } | null }

  const submittedBy = profile?.display_name || 'Anonymous Baker'
  const issueTitle = buildIssueTitle(title)
  const issueBody = buildIssueBody({
    category: category || 'other',
    description,
    submittedBy,
  })

  // Create GitHub issue
  const [owner, repo] = GITHUB_REPO.split('/')
  const ghResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: issueTitle,
      body: issueBody,
      labels: ['claude-task', 'community-suggestion'],
    }),
  })

  if (!ghResponse.ok) {
    const ghError = await ghResponse.text()
    console.error('GitHub issue creation failed:', ghError)
    return NextResponse.json(
      { error: 'Failed to create suggestion. Please try again.' },
      { status: 500 }
    )
  }

  const ghData = await ghResponse.json()
  return NextResponse.json(
    {
      success: true,
      issueNumber: ghData.number,
      issueUrl: ghData.html_url,
    },
    { status: 201 }
  )
}
