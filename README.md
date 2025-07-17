# Planify

Planify adalah aplikasi berbasis web yang membantu pengguna dalam mengelola mata
kuliah, membuat jadwal kuliah secara otomatis, serta menyimpan dan membagikan
jadwal yang telah dibuat. Aplikasi ini dirancang untuk memberikan pengalaman
pengguna yang mudah, cepat, dan efisien dalam perencanaan jadwal perkuliahan.

## Fitur

- **Autentikasi Pengguna (login/daftar):** Pengguna dapat membuat akun baru atau
  masuk menggunakan akun yang sudah ada untuk mengakses seluruh fitur aplikasi
  secara personal dan aman.

- **Manajemen Mata Kuliah (tambah, edit, hapus, impor):** Pengguna dapat
  menambahkan, mengedit, menghapus, dan mengimpor daftar mata kuliah sesuai
  kebutuhan. Fitur impor memudahkan input data secara massal.

- **Pembuatan Jadwal dan Generasi Jadwal Menggunakan AI:** Pengguna dapat
  membuat jadwal kuliah secara manual atau menggunakan fitur AI untuk
  menghasilkan jadwal otomatis yang optimal sesuai preferensi.

- **Menyimpan dan Membagikan Jadwal:** Jadwal yang telah dibuat dapat disimpan
  untuk digunakan di kemudian hari, serta dapat dibagikan kepada orang lain
  melalui tautan khusus.

## Teknologi yang Digunakan

- **Next.js (App Router)**
- **TypeScript**
- **Zustand**
- **Supabase**
- **Zod**
- **Shadcn UI**

## Struktur Proyek

Struktur folder pada proyek ini dirancang agar mudah dipahami dan dapat
dikembangkan lebih lanjut:

```
.next/                 # Output build dari Next.js
app/                   # Halaman dan API routes menggunakan Next.js App Router
├── api/               # API routes (misal: autentikasi, generate jadwal)
├── auth/              # Halaman autentikasi (login, daftar)
├── courses/           # Halaman daftar mata kuliah
├── create-schedule/   # Halaman pembuatan jadwal
├── saved/             # Halaman jadwal yang disimpan
├── settings/          # Halaman pengaturan pengguna
└── share/[shareId]/   # Halaman berbagi jadwal
components/            # Komponen React yang dapat digunakan kembali
├── auth/              # Komponen terkait autentikasi
├── course/            # Komponen terkait mata kuliah
├── layout/            # Komponen layout (navbar, footer, dsb)
├── saved/             # Komponen untuk jadwal yang disimpan
├── schedule/          # Komponen pembuatan/penampilan jadwal
└── ui/                # Komponen UI dari Shadcn
lib/                   # Utilitas, hooks, skema, layanan, dan store
├── hooks/             # Custom React hooks
├── schemas/           # Skema validasi Zod
├── services/          # Integrasi layanan API (misal: Supabase)
├── stores/            # State management menggunakan Zustand
├── supabase/          # Setup client Supabase
└── types/             # Definisi tipe data TypeScript
public/                # Asset statis (gambar, ikon, dsb)
```

## Lisensi

Proyek ini dilisensikan di bawah MIT License. Silakan lihat file `LICENSE` untuk
detail lebih lanjut.
