import { getScheduleByShareId } from '@/lib/services/schedules';
import { ShareClientPage } from './share-client-page';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate data every 60 seconds

export default async function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const schedule = await getScheduleByShareId(shareId);

  if (!schedule) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Planify
          </h1>
          <p className="text-gray-500 mt-1">Jadwal Bersama</p>
        </header>

        <ShareClientPage schedule={schedule} />

        <footer className="text-center mt-12 text-sm text-gray-400">
          <p>Dibagikan melalui Planify</p>
        </footer>
      </div>
    </div>
  );
}
