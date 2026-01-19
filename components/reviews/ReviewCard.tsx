'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getGradeBgClass } from '@/lib/utils'
import { Grade } from '@/types/database'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ReviewCardProps {
  review: {
    id: string
    grade: string
    review_text: string | null
    photo_url: string | null
    created_at: string
    user_id: string
    user_email?: string
  }
  currentUserId?: string
}

export function ReviewCard({ review, currentUserId }: ReviewCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const canDelete = currentUserId === review.user_id

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return

    setIsDeleting(true)
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', review.id)

    if (!error) {
      router.refresh()
    }
    setIsDeleting(false)
  }

  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className="flex gap-4">
      <Badge
        className={`${getGradeBgClass(review.grade as Grade)} text-white h-12 w-12 flex items-center justify-center text-lg shrink-0`}
      >
        {review.grade}
      </Badge>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{review.user_email || 'Anonymous'}</span>
            <span className="text-sm text-muted-foreground">{formattedDate}</span>
          </div>

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>

        {review.review_text && (
          <p className="text-sm text-foreground mt-2">{review.review_text}</p>
        )}

        {review.photo_url && (
          <div className="relative w-full max-w-sm h-48 mt-3 rounded-lg overflow-hidden">
            <Image
              src={review.photo_url}
              alt="Review photo"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  )
}
