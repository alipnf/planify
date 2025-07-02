// Auth error messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email atau password salah. Silakan periksa kembali.',
  EMAIL_EXISTS: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
  GOOGLE_LOGIN_FAILED: 'Gagal login dengan Google. Silakan coba lagi.',
  GOOGLE_REGISTER_FAILED: 'Gagal daftar dengan Google. Silakan coba lagi.',
  GENERAL_ERROR: 'Terjadi kesalahan. Silakan coba lagi.',
  REGISTRATION_SUCCESS:
    'Pendaftaran berhasil! Cek email untuk konfirmasi akun.',
  LOGIN_SUCCESS: 'Login berhasil! Mengalihkan...',
} as const;

// Form field labels
export const FORM_LABELS = {
  EMAIL: 'Email',
  PASSWORD: 'Kata Sandi',
  CONFIRM_PASSWORD: 'Konfirmasi Kata Sandi',
  FULL_NAME: 'Nama Lengkap',
} as const;

// Form placeholders
export const FORM_PLACEHOLDERS = {
  EMAIL: 'nama@contoh.com',
  PASSWORD: '••••••••',
  FULL_NAME: 'Masukkan nama lengkap',
} as const;

// Button texts
export const BUTTON_TEXTS = {
  LOGIN: 'Masuk',
  REGISTER: 'Daftar',
  LOGIN_LOADING: 'Masuk...',
  REGISTER_LOADING: 'Mendaftar...',
  GOOGLE_LOGIN: 'Masuk dengan Google',
  GOOGLE_REGISTER: 'Daftar dengan Google',
  GOOGLE_LOGIN_LOADING: 'Masuk dengan Google...',
  GOOGLE_REGISTER_LOADING: 'Daftar dengan Google...',
} as const;

