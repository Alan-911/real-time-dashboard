// Server Component — owns the dynamic rendering config.
// All interactive logic lives in DashboardClient (client component).
export const dynamic = 'force-dynamic'
export const revalidate = 0

import DashboardClient from './DashboardClient'

export default function Page() {
  return <DashboardClient />
}
