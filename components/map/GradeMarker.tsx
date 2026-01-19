'use client'

import { Marker, OverlayView } from '@react-google-maps/api'
import { Grade } from '@/types/database'
import { getGradeColor } from '@/lib/utils'

interface GradeMarkerProps {
  position: { lat: number; lng: number }
  grade: Grade
  onClick?: () => void
}

export function GradeMarker({ position, grade, onClick }: GradeMarkerProps) {
  const color = getGradeColor(grade)

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        onClick={onClick}
        className="cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: color,
          border: '3px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
          userSelect: 'none',
        }}
      >
        {grade}
      </div>
    </OverlayView>
  )
}

// SVG marker icon generator for use with standard Marker component
export function createGradeMarkerIcon(grade: Grade): string {
  const color = getGradeColor(grade)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="16" fill="${color}" stroke="white" stroke-width="3"/>
      <text x="20" y="25" text-anchor="middle" fill="white" font-weight="bold" font-size="12" font-family="Arial, sans-serif">${grade}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
