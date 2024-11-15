import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="container mx-auto max-w-7xl px-4 py-16 md:py-24 lg:py-32">
      <div className="flex flex-col items-center text-center gap-6 md:gap-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Modern Clinic Management
          <span className="text-primary"> Simplified</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[42rem] mx-auto">
          Streamline your practice with our comprehensive clinic management solution. 
          From appointments to billing, we've got you covered.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button size="lg" variant="outline">
              Book a Demo
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-8 gap-y-3 text-sm text-muted-foreground mt-4 md:mt-6">
          {[
            'No credit card required',
            '14-day free trial',
            '24/7 support'
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}