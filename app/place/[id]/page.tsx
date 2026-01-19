import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { calculateAverageGrade, getGradeBgClass } from '@/lib/utils'
import { Grade } from '@/types/database'
import { MapPin, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface PlacePageProps {
  params: Promise<{ id: string }>
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch establishment with reviews
  const { data: establishment } = await supabase
    .from('establishments')
    .select(`
      *,
      reviews (
        *
      )
    `)
    .eq('id', id)
    .single()

  if (!establishment) {
    notFound()
  }

  // Get user emails for reviews
  const { data: users } = await supabase.auth.admin.listUsers()

  const reviewsWithEmails = establishment.reviews.map((review: {
    id: string
    user_id: string
    grade: string
    review_text: string | null
    photo_url: string | null
    created_at: string
  }) => {
    const reviewUser = users?.users?.find(u => u.id === review.user_id)
    return {
      ...review,
      user_email: reviewUser?.email || 'Anonymous'
    }
  })

  const grades = establishment.reviews.map((r: { grade: string }) => r.grade as Grade)
  const avgGrade = calculateAverageGrade(grades)

  return (
    <div className="min-h-screen pt-14 pb-8">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Establishment Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {establishment.photo_url && (
                <div className="relative w-full md:w-64 h-48 rounded-lg overflow-hidden">
                  <Image
                    src={establishment.photo_url}
                    alt={establishment.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{establishment.name}</h1>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{establishment.address}</span>
                    </div>
                  </div>

                  {avgGrade && (
                    <Badge
                      className={`${getGradeBgClass(avgGrade)} text-white text-2xl px-4 py-2`}
                    >
                      {avgGrade}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{establishment.reviews.length} review{establishment.reviews.length !== 1 ? 's' : ''}</span>
                </div>

                {user && (
                  <div className="mt-4">
                    <Link href={`/add-review?establishmentId=${establishment.id}`}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Review
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {reviewsWithEmails.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-4">
                {reviewsWithEmails.map((review: {
                  id: string
                  grade: string
                  review_text: string | null
                  photo_url: string | null
                  created_at: string
                  user_id: string
                  user_email: string
                }, index: number) => (
                  <div key={review.id}>
                    <ReviewCard
                      review={review}
                      currentUserId={user?.id}
                    />
                    {index < reviewsWithEmails.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
