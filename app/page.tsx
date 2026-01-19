import { createClient } from '@/lib/supabase/server'
import { HomeClient } from './HomeClient'
import { EstablishmentWithReviews } from '@/types/database'

export default async function Home() {
  const supabase = await createClient()

  // Fetch establishments with their reviews
  const { data: establishments } = await supabase
    .from('establishments')
    .select(`
      *,
      reviews (*)
    `)

  const establishmentsWithReviews: EstablishmentWithReviews[] = (establishments || []).map(e => ({
    ...e,
    reviews: e.reviews || []
  }))

  return <HomeClient establishments={establishmentsWithReviews} />
}
