'use client'

import { useCallback, useState, useRef } from 'react'
import { GoogleMap, InfoWindow } from '@react-google-maps/api'
import { EstablishmentWithReviews, Grade } from '@/types/database'
import { GradeMarker } from './GradeMarker'
import { calculateAverageGrade, getGradeColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useGoogleMaps } from './GoogleMapsProvider'

const containerStyle = {
  width: '100%',
  height: '100%'
}

// Default center (Kansas City)
const defaultCenter = {
  lat: 39.0997,
  lng: -94.5786
}

interface MapProps {
  establishments: EstablishmentWithReviews[]
  onMapClick?: (lat: number, lng: number) => void
}

export function Map({ establishments, onMapClick }: MapProps) {
  const { isLoaded, loadError } = useGoogleMaps()

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedEstablishment, setSelectedEstablishment] = useState<EstablishmentWithReviews | null>(null)
  const markersRef = useRef(new globalThis.Map<string, google.maps.marker.AdvancedMarkerElement>())

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && onMapClick) {
      onMapClick(e.latLng.lat(), e.latLng.lng())
    }
    setSelectedEstablishment(null)
  }, [onMapClick])

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-destructive">Error loading Google Maps</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      }}
    >
      {establishments.map((establishment) => {
        const grades = establishment.reviews.map(r => r.grade)
        const avgGrade = calculateAverageGrade(grades)

        if (!avgGrade) return null

        return (
          <GradeMarker
            key={establishment.id}
            position={{ lat: establishment.lat, lng: establishment.lng }}
            grade={avgGrade}
            onClick={() => setSelectedEstablishment(establishment)}
          />
        )
      })}

      {selectedEstablishment && (
        <InfoWindow
          position={{ lat: selectedEstablishment.lat, lng: selectedEstablishment.lng }}
          onCloseClick={() => setSelectedEstablishment(null)}
        >
          <div className="p-2 min-w-[200px]">
            <h3 className="font-semibold text-lg">{selectedEstablishment.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{selectedEstablishment.address}</p>

            {selectedEstablishment.reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">Average Grade:</span>
                <span
                  className="font-bold text-lg px-2 py-1 rounded text-white"
                  style={{
                    backgroundColor: getGradeColor(
                      calculateAverageGrade(selectedEstablishment.reviews.map(r => r.grade)) || 'C'
                    )
                  }}
                >
                  {calculateAverageGrade(selectedEstablishment.reviews.map(r => r.grade))}
                </span>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-3">
              {selectedEstablishment.reviews.length} review{selectedEstablishment.reviews.length !== 1 ? 's' : ''}
            </p>

            <Link href={`/place/${selectedEstablishment.id}`}>
              <Button size="sm" className="w-full">
                View Details
              </Button>
            </Link>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}
