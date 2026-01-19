import { AdminClient } from './AdminClient'

// Prevent static prerendering - this page needs runtime env vars
export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return <AdminClient />
}
