'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Autocomplete } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export interface PlaceResult {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  photoUrl?: string
}

interface PlaceSearchProps {
  onPlaceSelect: (place: PlaceResult) => void
  placeholder?: string
}

export function PlaceSearch({ onPlaceSelect, placeholder = "Search for a place..." }: PlaceSearchProps) {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setAutocomplete(autocomplete)
  }, [])

  const onPlaceChanged = useCallback(() => {
    if (autocomplete) {
      const place = autocomplete.getPlace()

      if (place.place_id && place.geometry?.location && place.name) {
        const result: PlaceResult = {
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 300 })
        }

        onPlaceSelect(result)

        // Clear the input
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      }
    }
  }, [autocomplete, onPlaceSelect])

  return (
    <div className="relative">
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{
          types: ['establishment'],
          fields: ['place_id', 'name', 'formatted_address', 'geometry', 'photos']
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="pl-10 pr-4"
          />
        </div>
      </Autocomplete>
    </div>
  )
}
