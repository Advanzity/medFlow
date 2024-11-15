"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useClinicStore } from '@/hooks/use-clinic'
import { ClaimStatus } from '@/types/billing'
import { format } from 'date-fns'
import { Search, FileText, Plus } from 'lucide-react'
import { SubmitClaimDialog } from './submit-claim-dialog'

export function InsuranceList() {
  const [claims, setClaims] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const { selectedClinic } = useClinicStore()

  const loadClaims = async () => {
    // In a real app, this would fetch claims from the server
    setIsLoading(false)
  }

  useEffect(() => {
    if (selectedClinic) {
      loadClaims()
    }
  }, [selectedClinic])

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.DRAFT:
        return 'bg-gray-500'
      case ClaimStatus.SUBMITTED:
        return 'bg-blue-500'
      case ClaimStatus.IN_REVIEW:
        return 'bg-yellow-500'
      case ClaimStatus.APPROVED:
        return 'bg-green-500'
      case ClaimStatus.DENIED:
        return 'bg-red-500'
      case ClaimStatus.APPEALED:
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!selectedClinic) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Please select a clinic to view insurance claims
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search claims..."
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <Button onClick={() => setShowSubmitDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Submit Claim
        </Button>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading claims...
                  </TableCell>
                </TableRow>
              ) : claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No claims found
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">
                      {claim.id}
                    </TableCell>
                    <TableCell>{claim.patientName}</TableCell>
                    <TableCell>{claim.provider}</TableCell>
                    <TableCell>
                      {format(new Date(claim.submittedAt), 'PPp')}
                    </TableCell>
                    <TableCell>
                      ${claim.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {claim.approvedAmount 
                        ? `$${claim.approvedAmount.toFixed(2)}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`${getStatusColor(claim.status)} text-white border-0`}
                      >
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`/claims/${claim.id}`, '_blank')}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <SubmitClaimDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onSuccess={() => {
          setShowSubmitDialog(false)
          loadClaims()
        }}
      />
    </div>
  )
}