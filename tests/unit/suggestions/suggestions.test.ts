import {
  CATEGORY_LABELS,
  sanitizeForMarkdown,
  buildIssueBody,
  buildIssueTitle,
} from '@/lib/suggestions'

describe('CATEGORY_LABELS', () => {
  it('has labels for all four categories', () => {
    expect(CATEGORY_LABELS.bug).toBe('Bug Report')
    expect(CATEGORY_LABELS.feature).toBe('Feature Request')
    expect(CATEGORY_LABELS.ui_ux).toBe('UI/UX Improvement')
    expect(CATEGORY_LABELS.other).toBe('Other')
  })
})

describe('sanitizeForMarkdown', () => {
  it('escapes HTML angle brackets', () => {
    expect(sanitizeForMarkdown('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert("xss")&lt;/script&gt;'
    )
  })

  it('leaves normal text unchanged', () => {
    expect(sanitizeForMarkdown('Hello world')).toBe('Hello world')
  })

  it('escapes mixed content', () => {
    expect(sanitizeForMarkdown('foo <img> bar')).toBe('foo &lt;img&gt; bar')
  })
})

describe('buildIssueTitle', () => {
  it('prefixes with [Suggestion]', () => {
    expect(buildIssueTitle('Add dark mode')).toBe('[Suggestion] Add dark mode')
  })

  it('sanitizes HTML in title', () => {
    expect(buildIssueTitle('Fix <script> bug')).toBe('[Suggestion] Fix &lt;script&gt; bug')
  })
})

describe('buildIssueBody', () => {
  const params = {
    category: 'feature' as const,
    description: 'I would like dark mode support',
    submittedBy: 'Kim Moore',
  }

  it('includes category label', () => {
    const body = buildIssueBody(params)
    expect(body).toContain('Feature Request')
  })

  it('includes submitter name', () => {
    const body = buildIssueBody(params)
    expect(body).toContain('Kim Moore')
  })

  it('includes description', () => {
    const body = buildIssueBody(params)
    expect(body).toContain('I would like dark mode support')
  })

  it('includes @claude tag', () => {
    const body = buildIssueBody(params)
    expect(body).toContain('@claude please implement this')
  })

  it('sanitizes HTML in description', () => {
    const body = buildIssueBody({
      ...params,
      description: '<script>alert("xss")</script>',
    })
    expect(body).toContain('&lt;script&gt;')
    expect(body).not.toContain('<script>')
  })

  it('sanitizes HTML in submitter name', () => {
    const body = buildIssueBody({
      ...params,
      submittedBy: '<b>Admin</b>',
    })
    expect(body).toContain('&lt;b&gt;Admin&lt;/b&gt;')
  })
})
