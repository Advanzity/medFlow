import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: "$49",
    description: "Perfect for small clinics just getting started",
    features: [
      "Up to 2 practitioners",
      "100 appointments/month",
      "Basic patient records",
      "Email support",
      "Standard reports"
    ]
  },
  {
    name: "Professional",
    price: "$99",
    description: "Ideal for growing medical practices",
    features: [
      "Up to 5 practitioners",
      "Unlimited appointments",
      "Advanced patient management",
      "Priority support",
      "Custom reports",
      "Insurance billing",
      "API access"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large clinics with custom needs",
    features: [
      "Unlimited practitioners",
      "Custom integrations",
      "24/7 phone support",
      "Dedicated account manager",
      "Custom analytics",
      "HIPAA compliance",
      "Training & onboarding"
    ]
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="container mx-auto max-w-7xl px-4 py-24 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="text-muted-foreground max-w-[42rem] mx-auto">
          Choose the perfect plan for your clinic. All plans include a 14-day free trial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.name}
            className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                {plan.price === "Custom" ? "Contact Sales" : "Start Trial"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}