import type { CommentParentType } from '@/types/database'

export interface CommentNotificationContext {
  commenterName: string
  commentPreview: string
  parentType: CommentParentType
  parentId: string
  appUrl: string
}

const PARENT_TYPE_LABELS: Record<CommentParentType, string> = {
  inventory_item: 'inventory item',
  recipe: 'recipe',
  assignment: 'assignment',
  announcement: 'announcement',
}

function parentPath(parentType: CommentParentType): string {
  switch (parentType) {
    case 'inventory_item':
      return 'inventory'
    case 'recipe':
      return 'recipes'
    case 'assignment':
      return 'assignments'
    case 'announcement':
      return 'announcements'
  }
}

export function buildCommentNotificationSubject(ctx: CommentNotificationContext): string {
  return `New comment on ${PARENT_TYPE_LABELS[ctx.parentType]} — ${ctx.commenterName}`
}

export function buildCommentNotificationHtml(ctx: CommentNotificationContext): string {
  const link = `${ctx.appUrl}/${parentPath(ctx.parentType)}/${ctx.parentId}`
  return `
    <div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #333;">New Comment</h2>
      <p><strong>${ctx.commenterName}</strong> commented on a ${PARENT_TYPE_LABELS[ctx.parentType]}:</p>
      <blockquote style="border-left: 3px solid #ddd; padding-left: 12px; color: #555;">
        ${ctx.commentPreview}
      </blockquote>
      <p><a href="${link}" style="color: #7c3aed;">View the conversation</a></p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">
        You're receiving this because you commented on this item.
        <a href="${ctx.appUrl}/settings/notifications">Manage preferences</a>
      </p>
    </div>
  `.trim()
}

/**
 * Determines which user IDs should be notified about a new comment.
 * Returns IDs of other thread participants (excluding the commenter).
 */
export function getNotificationRecipients(
  threadParticipantIds: string[],
  commenterId: string
): string[] {
  return Array.from(new Set(threadParticipantIds)).filter((id) => id !== commenterId)
}
