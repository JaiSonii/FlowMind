import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export const metadata = {
  title: 'Settings - FlowMind',
  description: 'Account settings',
}

export default async function SettingsPage() {
  const session = await auth()

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-4xl font-bold text-foreground mb-8">Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* Account Information */}
        <Card className="p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">Account Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-lg font-medium text-foreground">{session?.user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-medium text-foreground">{session?.user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">Preferences</h2>
          <p className="text-muted-foreground mb-4">More settings coming soon...</p>
        </Card>

        {/* Sign Out */}
        <Card className="p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">Session</h2>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <Button
              type="submit"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-800"
              variant="outline"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
