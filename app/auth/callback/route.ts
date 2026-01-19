import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user && data.user.email) {
      const userEmail = data.user.email

      // Check if user's email is in allowed_emails
      const { data: allowedEmail } = await supabase
        .from('allowed_emails')
        .select('email')
        .eq('email', userEmail)
        .single()

      // If no allowed emails exist yet, this is the first user (admin)
      const { count } = await supabase
        .from('allowed_emails')
        .select('*', { count: 'exact', head: true })

      if (count === 0) {
        // First user - add them as allowed and continue
        await supabase.from('allowed_emails').insert({
          email: userEmail,
          added_by: data.user.id
        })
        return NextResponse.redirect(`${origin}${next}`)
      }

      if (!allowedEmail) {
        // User not in allow list - sign them out and redirect to error
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/auth/not-allowed`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
