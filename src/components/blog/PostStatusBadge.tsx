import { POST_STATUS_LABELS, POST_STATUS_STYLES } from '@/types/posts'
import type { PostStatus } from '@/types/posts'

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${POST_STATUS_STYLES[status]}`}>
      {POST_STATUS_LABELS[status]}
    </span>
  )
}
