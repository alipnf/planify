import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <h2 className="text-3xl font-semibold text-foreground mb-4">
        Halaman Tidak Ditemukan
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Maaf, halaman yang Anda cari tidak ada atau mungkin telah dipindahkan.
        Mari kita kembali ke tempat yang lebih aman.
      </p>
      <Button asChild>
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
