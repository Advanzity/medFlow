"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateMockMetrics } from '@/lib/mock-data'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

export function MetricsGrid() {
  const [metrics] = useState(generateMockMetrics())

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            {metric.trend === 'up' ? (
              <ArrowUp className="h-4 w-4 text-emerald-500" />
            ) : metric.trend === 'down' ? (
              <ArrowDown className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              {metric.change > 0 ? '+' : ''}
              {metric.change}% {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}