import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
          <p className="text-muted-foreground">
            Get started by editing this page.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Start building your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is a starter template with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact (example API + form)</CardTitle>
            <CardDescription>
              Secure form with zod validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>A2UI + AG-UI prototype</CardTitle>
            <CardDescription>
              Chat-led canvas with just-in-time UI generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full" asChild>
              <Link href="/prototype">Open prototype</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

