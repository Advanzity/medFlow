"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useClinicStore } from '@/hooks/use-clinic'
import { generateFinancialReport } from '@/app/actions/billing'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export function FinancialReports() {
  const [startDate, setStartDate] = useState(() => {
    const date = startOfMonth(subMonths(new Date(), 1))
    return format(date, 'yyyy-MM-dd')
  })
  
  const [endDate, setEndDate] = useState(() => {
    const date = endOfMonth(new Date())
    return format(date, 'yyyy-MM-dd')
  })

  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { selectedClinic } = useClinicStore()

  const generateReport = async () => {
    if (!selectedClinic) return

    setIsLoading(true)
    try {
      const result = await generateFinancialReport(
        selectedClinic.id,
        new Date(startDate),
        new Date(endDate)
      )

      if (result.success) {
        setReport(result.data)
      } else {
        toast.error(result.error || 'Failed to generate report')
      }
    } catch (error) {
      toast.error('Error generating report')
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedClinic) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Please select a clinic to view financial reports
      </div>
    )
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateReport}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${report.revenue.total.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Collections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${report.collections.total.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Outstanding: ${report.collections.outstanding.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Insurance Claims
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${report.insurance.claimed.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Approved: ${report.insurance.received.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Aging Receivables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${report.aging['90+'].toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  90+ days outstanding
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(report.revenue.byService).map(([name, value]) => ({
                        name,
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(report.revenue.byService).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aging Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(report.aging).map(([range, value]) => ({
                      range,
                      amount: value
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}