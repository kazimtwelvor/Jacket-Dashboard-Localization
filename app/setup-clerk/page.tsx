"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Info, AlertTriangle, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SetupClerkPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Clerk Setup Guide</h1>
          <p className="text-muted-foreground">
            Follow these steps to properly configure Clerk for role-based access control
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Configure Session Token
              </CardTitle>
              <CardDescription>Add user metadata to your Clerk session token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  Log in to your{" "}
                  <Link
                    href="https://dashboard.clerk.dev"
                    className="text-primary underline hover:no-underline inline-flex items-center"
                    target="_blank"
                  >
                    Clerk Dashboard <ExternalLink className="h-3 w-3 ml-0.5" />
                  </Link>
                </li>
                <li>
                  Navigate to the <strong>JWT Templates</strong> section
                </li>
                <li>
                  Under <strong>Session Token</strong>, click <strong>Edit</strong>
                </li>
                <li>Add the following JSON to your session claims:</li>
              </ol>

              <div className="relative bg-muted p-4 rounded-md font-mono text-sm">
                {`{
  "metadata": "{{user.public_metadata}}"
}`}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => {
                    navigator.clipboard.writeText(`{
  "metadata": "{{user.public_metadata}}"
}`)
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  If you already have custom claims, merge this with your existing configuration.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  2
                </span>
                Set Admin Role
              </CardTitle>
              <CardDescription>Assign the admin role to your own account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  In the Clerk Dashboard, go to <strong>Users</strong>
                </li>
                <li>Find and select your own user account</li>
                <li>
                  Scroll down to <strong>Metadata</strong>
                </li>
                <li>
                  Under <strong>Public metadata</strong>, click <strong>Edit</strong>
                </li>
                <li>Add the following JSON:</li>
              </ol>

              <div className="relative bg-muted p-4 rounded-md font-mono text-sm">
                {`{
  "role": "admin"
}`}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => {
                    navigator.clipboard.writeText(`{
  "role": "admin"
}`)
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Sign out required</AlertTitle>
                <AlertDescription>
                  After setting the role, sign out and sign back in to refresh your session.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  3
                </span>
                Verify Setup
              </CardTitle>
              <CardDescription>Confirm that your role-based access control is working</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p>After completing the steps above, you should:</p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span>
                      See an <strong>Admin</strong> button in your navbar
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span>
                      Be able to access the <strong>Admin Dashboard</strong> at <code>/admin</code>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span>See your role displayed in the navbar</span>
                  </li>
                </ul>

                <Separator />

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Having trouble? Check the browser console for any errors.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/admin">Go to Admin Dashboard</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
