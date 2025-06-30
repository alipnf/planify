import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  Calendar,
  Share2,
  MousePointer,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/feature-card';

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-muted text-muted-foreground backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                Penjadwalan Kuliah dengan AI
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-primary">
            Planify
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Platform modern untuk manajemen KRS dengan teknologi AI yang
            membantu mahasiswa menyusun jadwal kuliah secara otomatis dan
            optimal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3 text-lg">
                <GraduationCap className="mr-2 h-5 w-5" />
                Mulai Sekarang
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Masuk
              </Button>
            </Link>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-muted backdrop-blur-sm rounded-2xl shadow-2xl border border-border p-8">
              <div className="aspect-video bg-muted/50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">
                    Visualisasi Jadwal Cerdas
                  </h3>
                  <p className="text-muted-foreground">
                    Preview jadwal mingguan dengan deteksi konflik otomatis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Solusi modern untuk pengalaman perencanaan akademik yang optimal
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Wand2 className="h-8 w-8" />}
              title="Generator Jadwal AI"
              description="Sistem AI canggih yang menganalisis preferensi dan menghasilkan jadwal optimal secara otomatis"
            />
            <FeatureCard
              icon={<MousePointer className="h-8 w-8" />}
              title="Pembuat Manual"
              description="Interface intuitif dengan deteksi konflik real-time untuk penyusunan jadwal secara manual"
            />
            <FeatureCard
              icon={<Share2 className="h-8 w-8" />}
              title="Berbagi Jadwal"
              description="Bagikan dan kolaborasi jadwal dengan teman satu angkatan"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Siap mengoptimalkan jadwal kuliah Anda?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Mulai merencanakan KRS dengan mudah menggunakan bantuan AI
          </p>
          <Link href="/register">
            <Button size="lg" className="px-10 py-4 text-lg">
              <GraduationCap className="mr-2 h-6 w-6" />
              Daftar Gratis Sekarang
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
