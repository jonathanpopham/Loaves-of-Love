import {
  buildCommentNotificationSubject,
  buildCommentNotificationHtml,
  getNotificationRecipients,
} from '@/lib/notifications/comment-notifier'

const ctx = {
  commenterName: 'Kim Moore',
  commentPreview: 'Great batch of sourdough today!',
  parentType: 'inventory_item' as const,
  parentId: 'item-123',
  appUrl: 'https://app.example.com',
}

describe('buildCommentNotificationSubject', () => {
  it('includes commenter name and parent type', () => {
    const subject = buildCommentNotificationSubject(ctx)
    expect(subject).toContain('Kim Moore')
    expect(subject).toContain('inventory item')
  })

  it('uses correct label for recipe', () => {
    const subject = buildCommentNotificationSubject({ ...ctx, parentType: 'recipe' })
    expect(subject).toContain('recipe')
  })

  it('uses correct label for assignment', () => {
    const subject = buildCommentNotificationSubject({ ...ctx, parentType: 'assignment' })
    expect(subject).toContain('assignment')
  })

  it('uses correct label for announcement', () => {
    const subject = buildCommentNotificationSubject({ ...ctx, parentType: 'announcement' })
    expect(subject).toContain('announcement')
  })
})

describe('buildCommentNotificationHtml', () => {
  it('includes commenter name', () => {
    const html = buildCommentNotificationHtml(ctx)
    expect(html).toContain('Kim Moore')
  })

  it('includes comment preview', () => {
    const html = buildCommentNotificationHtml(ctx)
    expect(html).toContain('Great batch of sourdough today!')
  })

  it('includes correct link for inventory item', () => {
    const html = buildCommentNotificationHtml(ctx)
    expect(html).toContain('href="https://app.example.com/inventory/item-123"')
  })

  it('includes correct link for recipe', () => {
    const html = buildCommentNotificationHtml({ ...ctx, parentType: 'recipe', parentId: 'r-1' })
    expect(html).toContain('href="https://app.example.com/recipes/r-1"')
  })

  it('includes link to notification preferences', () => {
    const html = buildCommentNotificationHtml(ctx)
    expect(html).toContain('settings/notifications')
  })
})

describe('getNotificationRecipients', () => {
  it('excludes the commenter from recipients', () => {
    const recipients = getNotificationRecipients(['user-1', 'user-2', 'user-3'], 'user-2')
    expect(recipients).toEqual(['user-1', 'user-3'])
  })

  it('deduplicates participant IDs', () => {
    const recipients = getNotificationRecipients(
      ['user-1', 'user-2', 'user-1', 'user-2'],
      'user-1'
    )
    expect(recipients).toEqual(['user-2'])
  })

  it('returns empty array when commenter is the only participant', () => {
    const recipients = getNotificationRecipients(['user-1'], 'user-1')
    expect(recipients).toEqual([])
  })

  it('returns empty array when no participants', () => {
    const recipients = getNotificationRecipients([], 'user-1')
    expect(recipients).toEqual([])
  })
})
