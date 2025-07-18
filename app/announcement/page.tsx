import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function AnnouncementPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-10">
        Pengumuman & Info Terbaru
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Fitur yang Akan Hadir</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Berikut beberapa fitur yang sedang dipersiapkan:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Integrasi Kalender: Jadwal bisa langsung tersinkron ke Google
                Calendar.
              </li>
              <li>
                AI Scheduler yang Lebih Pintar: Penjadwalan jadi lebih cepat,
                cerdas, dan sesuai kebutuhanmu.
              </li>
              <li>
                Scan Matkul dari PDF/Gambar: Menggunakan teknologi OCR untuk
                mengekstrak daftar mata kuliah dari file PDF atau gambar jadwal
                kampusmu.
              </li>
              <li>
                Export Jadwal ke PDF: Menyimpan jadwal kuliah dalam format PDF
                untuk dicetak atau dibagikan dengan mudah.
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              Tunggu info tanggal rilisnya, ya!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saran & Laporan Bug</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Masukanmu sangat berharga untuk pengembangan Planify ke depannya.
              Jika memiliki ide fitur baru atau menemukan bug, jangan ragu untuk
              memberi tahu.
            </p>
            <p className="mb-4">
              Bisa mengirimkan saran atau laporan bug melalui formulir berikut:
            </p>
            <Link
              href="https://forms.gle/EH3dkN1RGrPcaP328"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Kirim Saran/Bug di Sini
            </Link>
            <Separator className="my-6" />
            <h3 className="text-lg font-semibold mb-2">Informasi Lainnya</h3>
            <p className="text-sm text-gray-700">
              Saat ini pengembang sedang mengikuti{' '}
              <strong>Kuliah Kerja Nyata (KKN)</strong>, sehingga pengembangan
              fitur baru dan perbaikan bug mungkin akan dikerjakan setelah KKN
              selesai.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Data Dummy, Kontribusi, & Import Matkul</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Bisa melihat contoh data dummy mata kuliah yang dapat digunakan di
              Planify melalui link berikut:
            </p>
            <Link
              href="https://drive.google.com/drive/folders/1Ft4XD523kpCOx9_h2iyZAfGYdUBpxyKP?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Lihat Data Dummy Matkul
            </Link>

            <Separator className="my-6" />

            <p className="mb-4">
              Jika ingin membantu menambahkan data mata kuliah dari kampusmu,
              bisa mengirimkannya melalui link di bawah ini. Kontribusimu sangat
              membantu pengembangan Planify ke depannya.
            </p>
            <Link
              href="https://forms.gle/HR2G3sYwqoXXMiqm7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Kirim Data Matkul di Sini
            </Link>

            <Separator className="my-6" />

            <h3 className="text-lg font-semibold mb-2">
              Cara Import Mata Kuliah
            </h3>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>
                Buka link data dummy matkul di atas dan download file-nya.
              </li>
              <li>
                Pergi ke halaman <strong>Semua Mata Kuliah</strong> pada
                aplikasi Planify.
              </li>
              <li>
                Klik tombol <strong>Import</strong> di bagian atas halaman.
              </li>
              <li>Pilih file data matkul yang telah didownload.</li>
              <li>
                Selesai! Data mata kuliah akan otomatis ditambahkan ke akunmu.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
