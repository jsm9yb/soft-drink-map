import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Grade } from "@/types/database"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Grade utilities
export const GRADES: Grade[] = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']

export function getGradeColor(grade: Grade): string {
  const letter = grade[0]
  switch (letter) {
    case 'A':
      return '#22c55e' // green-500
    case 'B':
      return '#3b82f6' // blue-500
    case 'C':
      return '#eab308' // yellow-500
    case 'D':
      return '#f97316' // orange-500
    case 'F':
      return '#ef4444' // red-500
    default:
      return '#6b7280' // gray-500
  }
}

export function getGradeBgClass(grade: Grade): string {
  const letter = grade[0]
  switch (letter) {
    case 'A':
      return 'bg-green-500'
    case 'B':
      return 'bg-blue-500'
    case 'C':
      return 'bg-yellow-500'
    case 'D':
      return 'bg-orange-500'
    case 'F':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

export function getGradeTextClass(grade: Grade): string {
  const letter = grade[0]
  switch (letter) {
    case 'A':
      return 'text-green-500'
    case 'B':
      return 'text-blue-500'
    case 'C':
      return 'text-yellow-500'
    case 'D':
      return 'text-orange-500'
    case 'F':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

// Convert grade to numeric value for averaging
export function gradeToNumber(grade: Grade): number {
  const gradeMap: Record<Grade, number> = {
    'A+': 4.3, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  }
  return gradeMap[grade]
}

// Convert numeric value back to grade
export function numberToGrade(num: number): Grade {
  if (num >= 4.15) return 'A+'
  if (num >= 3.85) return 'A'
  if (num >= 3.5) return 'A-'
  if (num >= 3.15) return 'B+'
  if (num >= 2.85) return 'B'
  if (num >= 2.5) return 'B-'
  if (num >= 2.15) return 'C+'
  if (num >= 1.85) return 'C'
  if (num >= 1.5) return 'C-'
  if (num >= 1.15) return 'D+'
  if (num >= 0.85) return 'D'
  if (num >= 0.5) return 'D-'
  return 'F'
}

// Calculate average grade from array of grades
export function calculateAverageGrade(grades: Grade[]): Grade | null {
  if (grades.length === 0) return null
  const sum = grades.reduce((acc, grade) => acc + gradeToNumber(grade), 0)
  return numberToGrade(sum / grades.length)
}
