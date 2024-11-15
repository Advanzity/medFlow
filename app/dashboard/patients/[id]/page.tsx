import { Suspense } from 'react';
import { DashboardShell } from '@/components/dashboard/shell';
import { PatientHeader } from '@/components/patients/patient-header';
import { RecordList } from '@/components/medical-records/record-list';
import { Skeleton } from '@/components/ui/skeleton';
import { generateMockPets } from '@/lib/mock-patients';

interface PatientPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const pets = generateMockPets(50)
  
  return pets.map((pet) => ({
    id: pet.id.toString(),
  }));
}

export async function generateMetadata({ params }: PatientPageProps) {
  return {
    title: `Patient Details - ${params.id}`,
    description: `Patient details and medical records for ${params.id}`,
  };
}

export default function PatientDetailsPage({ params }: PatientPageProps) {
  return (
    <DashboardShell>
      <PatientHeader patientId={params.id} />
      <Suspense fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      }>
        <RecordList petId={params.id} />
      </Suspense>
    </DashboardShell>
  );
}