import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            Something went wrong during the sign-in process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Please try signing in again. If the problem persists, contact the administrator.
          </p>
          <Link href="/">
            <Button className="w-full">Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
