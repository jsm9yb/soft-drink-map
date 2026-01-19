import Link from 'next/link'
import { AuthButton } from './AuthButton'
import { createClient } from '@/lib/supabase/server'
import { Button } from './ui/button'
import { Plus, MapPin } from 'lucide-react'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin (first registered user)
  let isAdmin = false
  if (user) {
    const { data: firstAllowed } = await supabase
      .from('allowed_emails')
      .select('email')
      .order('added_at', { ascending: true })
      .limit(1)
      .single()

    isAdmin = firstAllowed?.email === user.email
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MapPin className="h-5 w-5 text-primary" />
          <span>Soft Drink Map</span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <Link href="/add-review">
              <Button size="sm" variant="default">
                <Plus className="h-4 w-4 mr-1" />
                Add Review
              </Button>
            </Link>
          )}
          <AuthButton isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  )
}
