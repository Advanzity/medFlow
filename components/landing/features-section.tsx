import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, FileText, Bell, CreditCard, BarChart } from "lucide-react"

const features = [
  {
    title: "Smart Scheduling",
    description: "Intelligent appointment management with automated reminders and conflict detection.",
    icon: Calendar
  },
  {
    title: "Patient Management",
    description: "Complete patient records, history tracking, and visit management in one place.",
    icon: Users
  },
  {
    title: "Digital Records",
    description: "Secure, cloud-based storage for all your medical records and documents.",
    icon: FileText
  },
  {
    title: "Instant Notifications",
    description: "Real-time alerts for appointments, test results, and important updates.",
    icon: Bell
  },
  {
    title: "Seamless Billing",
    description: "Automated invoicing, payment processing, and insurance claim management.",
    icon: CreditCard
  },
  {
    title: "Analytics Dashboard",
    description: "Comprehensive insights into your clinic's performance and patient trends.",
    icon: BarChart
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto max-w-7xl px-4 py-24 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Everything You Need to Run Your Clinic
        </h2>
        <p className="text-muted-foreground max-w-[42rem] mx-auto">
          Powerful features designed to streamline your clinic operations and enhance patient care.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title} className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </section>
  )
}