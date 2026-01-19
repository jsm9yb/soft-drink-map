'use client'

import { Map } from '@/components/map/Map'
import { PlaceSearch, PlaceResult } from '@/components/map/PlaceSearch'
import { GoogleMapsProvider, useGoogleMaps } from '@/components/map/GoogleMapsProvider'
import { EstablishmentWithReviews } from '@/types/database'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

interface HomeClientProps {
  establishments: EstablishmentWithReviews[]
}

function HomeContent({ establishments }: HomeClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const { isLoaded, loadError } = useGoogleMaps()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const handlePlaceSelect = async (place: PlaceResult) => {
    if (!user) {
      // Redirect to sign in if not authenticated
      return
    }

    // Check if establishment already exists
    const { data: existing } = await supabase
      .from('establishments')
      .select('id')
      .eq('google_place_id', place.placeId)
      .single()

    if (existing) {
      // Redirect to existing establishment
      router.push(`/place/${existing.id}`)
    } else {
      // Redirect to add review with place data
      const params = new URLSearchParams({
        placeId: place.placeId,
        name: place.name,
        address: place.address,
        lat: place.lat.toString(),
        lng: place.lng.toString(),
        ...(place.photoUrl && { photoUrl: place.photoUrl })
      })
      router.push(`/add-review?${params.toString()}`)
    }
  }

  if (loadError) {
    return (
      <div className="h-screen pt-14 flex items-center justify-center">
        <p className="text-destructive">Error loading Google Maps</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-screen pt-14 flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="h-screen pt-14">
      <div className="absolute top-18 left-4 right-4 md:left-auto md:right-4 md:w-96 z-10">
        <PlaceSearch
          onPlaceSelect={handlePlaceSelect}
          placeholder="Search for a place to review..."
        />
      </div>
      <Map establishments={establishments} />
    </div>
  )
}

export function HomeClient({ establishments }: HomeClientProps) {
  return (
    <GoogleMapsProvider>
      <HomeContent establishments={establishments} />
    </GoogleMapsProvider>
  )
}
