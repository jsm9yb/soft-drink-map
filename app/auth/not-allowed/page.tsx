import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function NotAllowedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            Your email is not on the allowed list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This is a private application. If you believe you should have access,
            please contact the administrator to add your email to the allow list.
          </p>
          <Link href="/">
            <Button className="w-full">Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
