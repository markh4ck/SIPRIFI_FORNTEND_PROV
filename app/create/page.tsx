import { CreateMarketForm } from "@/components/create-market-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CreatePage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Markets
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create CDS Contract</h1>
          <p className="text-muted-foreground">
            Issue a new Credit Default Swap by defining the reference entity and protection terms.
          </p>
        </div>

        <CreateMarketForm />
      </div>
    </div>
  )
}
