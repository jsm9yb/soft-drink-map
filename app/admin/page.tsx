'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Trash2, Mail } from 'lucide-react'
import Link from 'next/link'

interface AllowedEmail {
  email: string
  added_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      // Check if user is admin (first allowed email)
      const { data: emails } = await supabase
        .from('allowed_emails')
        .select('*')
        .order('added_at', { ascending: true })

      if (!emails || emails.length === 0 || emails[0].email !== user.email) {
        router.push('/')
        return
      }

      setIsAdmin(true)
      setAllowedEmails(emails)
      setIsLoading(false)
    }

    checkAdminAndLoad()
  }, [supabase, router])

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const emailToAdd = newEmail.trim().toLowerCase()
    if (!emailToAdd) return

    // Basic email validation
    if (!emailToAdd.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    // Check if already exists
    if (allowedEmails.some(e => e.email === emailToAdd)) {
      setError('This email is already in the allowed list')
      return
    }

    setIsAdding(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase
      .from('allowed_emails')
      .insert({
        email: emailToAdd,
        added_by: user?.id
      })

    if (insertError) {
      setError('Failed to add email')
      setIsAdding(false)
      return
    }

    setAllowedEmails([...allowedEmails, { email: emailToAdd, added_at: new Date().toISOString() }])
    setNewEmail('')
    setIsAdding(false)
  }

  const handleRemoveEmail = async (email: string) => {
    // Don't allow removing the first (admin) email
    if (allowedEmails[0]?.email === email) {
      setError("Can't remove the admin email")
      return
    }

    if (!confirm(`Remove ${email} from allowed list?`)) return

    const { error: deleteError } = await supabase
      .from('allowed_emails')
      .delete()
      .eq('email', email)

    if (deleteError) {
      setError('Failed to remove email')
      return
    }

    setAllowedEmails(allowedEmails.filter(e => e.email !== email))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
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
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>
              Manage who can sign in and add reviews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Email Form */}
            <form onSubmit={handleAddEmail} className="space-y-3">
              <Label htmlFor="email">Add Allowed Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isAdding || !newEmail.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </form>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            {/* Email List */}
            <div className="space-y-2">
              <Label>Allowed Emails ({allowedEmails.length})</Label>
              <div className="border rounded-lg divide-y">
                {allowedEmails.map((item, index) => (
                  <div key={item.email} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {index === 0 ? 'Admin' : `Added ${new Date(item.added_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    {index !== 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEmail(item.email)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
