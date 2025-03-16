import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ExamplesPage() {
  const examples = [
    {
      title: "Sales Analysis",
      description: "Analyze quarterly sales performance across different regions and product categories.",
      query: "Show me a breakdown of quarterly sales by region",
      image: "/examples/sales-chart.png"
    },
    {
      title: "User Demographics",
      description: "Understand your user base by analyzing demographic data and user behavior patterns.",
      query: "What's the age distribution of our users?",
      image: "/examples/users-chart.png"
    },
    {
      title: "Inventory Management",
      description: "Track inventory levels, predict stockouts, and optimize reorder points.",
      query: "Which products are at risk of running out of stock?",
      image: "/examples/inventory-chart.png"
    }
  ]

  return (
    <div className="container py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Example Queries</h1>
        <p className="text-muted-foreground">
          Explore the capabilities of ChatData with these example queries
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {examples.map((example, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="h-48 bg-muted flex items-center justify-center">
              {/* In a real app, you'd have actual example images */}
              <div className="text-4xl text-muted-foreground">
                Example Chart {index + 1}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg">{example.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {example.description}
              </p>
              <div className="bg-muted p-2 rounded text-sm mt-4">
                &quot;{example.query}&quot;
              </div>
            </div>
            <div className="px-4 pb-4">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">Try This Example</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/dashboard">
          <Button size="lg">Start Analyzing Your Data</Button>
        </Link>
      </div>
    </div>
  )
}
