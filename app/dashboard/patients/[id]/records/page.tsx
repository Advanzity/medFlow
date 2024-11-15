import { generateMockPets } from '@/lib/mock-patients'

export async function generateStaticParams() {
  // Get all possible pet IDs from the mock data
  const pets = generateMockPets(50)
  
  return pets.map((pet) => ({
    id: pet.id.toString(),
  }))
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Patient Records - ${params.id}`,
    description: `Medical records for patient ${params.id}`,
  }
}

      <div className="container px-4 md:px-8 pt-6">
      </div>
import { RecordList } from '@/components/medical-records/record-list'

interface RecordsPageProps {
  params: {
    id: string
  }
}

export default function RecordsPage({ params }: RecordsPageProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Medical Records</h2>
        <p className="text-sm text-muted-foreground">
          View and manage patient medical records
        </p>
      </div>
      <RecordList petId={params.id} />
    </div>
  )
}