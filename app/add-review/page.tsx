'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GRADES, getGradeBgClass } from '@/lib/utils'
import { Grade } from '@/types/database'
import { MapPin, ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { PlaceSearch, PlaceResult } from '@/components/map/PlaceSearch'
import { GoogleMapsProvider, useGoogleMaps } from '@/components/map/GoogleMapsProvider'

function AddReviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  // Query params for new establishment
  const placeId = searchParams.get('placeId')
  const name = searchParams.get('name')
  const address = searchParams.get('address')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const photoUrl = searchParams.get('photoUrl')

  // Query param for existing establishment
  const establishmentId = searchParams.get('establishmentId')

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [reviewText, setReviewText] = useState('')
  const [error, setError] = useState<string | null>(null)

  // For existing establishments
  const [existingEstablishment, setExistingEstablishment] = useState<{
    id: string
    name: string
    address: string
    photo_url: string | null
  } | null>(null)

  // For place search (when no establishment provided)
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUserId(user.id)

      // If we have an establishmentId, fetch the establishment
      if (establishmentId) {
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id, name, address, photo_url')
          .eq('id', establishmentId)
          .single()

        if (establishment) {
          setExistingEstablishment(establishment)
        } else {
          setError('Establishment not found')
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [supabase, router, establishmentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedGrade) {
      setError('Please select a grade')
      return
    }

    if (!userId) {
      setError('You must be logged in')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let targetEstablishmentId = establishmentId

      // If this is a new establishment, create it first
      const newPlaceId = placeId || selectedPlace?.placeId
      const newName = name || selectedPlace?.name
      const newAddress = address || selectedPlace?.address
      const newLat = lat ? parseFloat(lat) : selectedPlace?.lat
      const newLng = lng ? parseFloat(lng) : selectedPlace?.lng
      const newPhotoUrl = photoUrl || selectedPlace?.photoUrl

      if (!establishmentId && newPlaceId && newName && newAddress && newLat && newLng) {
        // Check if this place already exists
        const { data: existing } = await supabase
          .from('establishments')
          .select('id')
          .eq('google_place_id', newPlaceId)
          .single()

        if (existing) {
          targetEstablishmentId = existing.id
        } else {
          const { data: newEstablishment, error: establishmentError } = await supabase
            .from('establishments')
            .insert({
              google_place_id: newPlaceId,
              name: newName,
              address: newAddress,
              lat: newLat,
              lng: newLng,
              photo_url: newPhotoUrl || null
            })
            .select('id')
            .single()

          if (establishmentError) {
            throw new Error('Failed to create establishment')
          }

          targetEstablishmentId = newEstablishment.id
        }
      }

      if (!targetEstablishmentId) {
        throw new Error('No establishment to review')
      }

      // Create the review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          establishment_id: targetEstablishmentId,
          user_id: userId,
          grade: selectedGrade,
          review_text: reviewText.trim() || null
        })

      if (reviewError) {
        throw new Error('Failed to create review')
      }

      // Redirect to the place page
      router.push(`/place/${targetEstablishmentId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Determine display info
  const displayName = existingEstablishment?.name || name || selectedPlace?.name
  const displayAddress = existingEstablishment?.address || address || selectedPlace?.address
  const displayPhoto = existingEstablishment?.photo_url || photoUrl || selectedPlace?.photoUrl

  // Handle place selection from search
  const handlePlaceSelect = (place: PlaceResult) => {
    setSelectedPlace(place)
  }

  // No establishment provided - show place search
  if (!displayName || !displayAddress) {
    return (
      <PlaceSearchView onPlaceSelect={handlePlaceSelect} />
    )
  }

  return (
    <div className="min-h-screen pt-14 pb-8">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={establishmentId ? `/place/${establishmentId}` : '/'} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Add Review</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Establishment Info */}
            <div className="flex gap-4 mb-6 p-4 bg-muted rounded-lg">
              {displayPhoto && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={displayPhoto}
                    alt={displayName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold">{displayName}</h3>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {displayAddress}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grade Selection */}
              <div className="space-y-3">
                <Label>Grade *</Label>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                  {GRADES.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedGrade(grade)}
                      className={`
                        p-3 rounded-lg font-bold text-lg transition-all
                        ${selectedGrade === grade
                          ? `${getGradeBgClass(grade)} text-white ring-2 ring-offset-2 ring-primary`
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                        }
                      `}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                <Label htmlFor="review">Review (optional)</Label>
                <Textarea
                  id="review"
                  placeholder="Share your thoughts about the soft drinks here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                />
              </div>

              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !selectedGrade}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Separate component for place search that needs Google Maps
function PlaceSearchView({ onPlaceSelect }: { onPlaceSelect: (place: PlaceResult) => void }) {
  const { isLoaded, loadError } = useGoogleMaps()

  if (loadError) {
    return (
      <div className="min-h-screen pt-14 pb-8">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Link>
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading Google Maps</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen pt-14 pb-8">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Link>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-14 pb-8">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Map
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Add Review</CardTitle>
            <CardDescription>
              Search for a place to review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Search className="h-4 w-4" />
                <span className="text-sm">Find a restaurant, bar, or store</span>
              </div>
              <PlaceSearch
                onPlaceSelect={onPlaceSelect}
                placeholder="Search for a place..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen pt-14 flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}

export default function AddReviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleMapsProvider>
        <AddReviewContent />
      </GoogleMapsProvider>
    </Suspense>
  )
}
