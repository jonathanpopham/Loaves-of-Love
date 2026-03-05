export type SuggestionCategory = 'bug' | 'feature' | 'ui_ux' | 'other'

export const CATEGORY_LABELS: Record<SuggestionCategory, string> = {
  bug: 'Bug Report',
  feature: 'Feature Request',
  ui_ux: 'UI/UX Improvement',
  other: 'Other',
}

export const CATEGORY_EMOJIS: Record<SuggestionCategory, string> = {
  bug: 'bug',
  feature: 'sparkles',
  ui_ux: 'art',
  other: 'bulb',
}

/**
 * Sanitizes user input for safe inclusion in a GitHub issue body.
 * Escapes markdown injection vectors.
 */
export function sanitizeForMarkdown(text: string): string {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Builds the GitHub issue body from a suggestion.
 */
export function buildIssueBody(params: {
  category: SuggestionCategory
  description: string
  submittedBy: string
}): string {
  const { category, description, submittedBy } = params
  const sanitizedDescription = sanitizeForMarkdown(description)
  const sanitizedName = sanitizeForMarkdown(submittedBy)

  return `## ${CATEGORY_LABELS[category]}

**Submitted by:** ${sanitizedName}

### Description

${sanitizedDescription}

---

*This suggestion was submitted through the Loaves of Love app.*

@claude please implement this`
}

/**
 * Builds the GitHub issue title from a suggestion.
 */
export function buildIssueTitle(title: string): string {
  return `[Suggestion] ${sanitizeForMarkdown(title)}`
}
