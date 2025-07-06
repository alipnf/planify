import { Calendar } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="text-center py-16 px-6 rounded-lg">
      <div className="mx-auto h-16 w-16 text-gray-400">
        <Calendar size={64} />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-gray-900">
        Tidak Ada Jadwal Tersimpan
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Anda belum menyimpan jadwal apa pun. Buat jadwal baru untuk memulai.
      </p>
    </div>
  );
}
