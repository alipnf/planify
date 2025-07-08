'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Save,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface APISettings {
  googleAiApiKey: string;
}

export default function SettingsPage() {
  // API Settings State
  const [apiSettings, setApiSettings] = useState<APISettings>({
    googleAiApiKey: '',
  });
  const [savedApiKey, setSavedApiKey] = useState<string>('');

  // UI States
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('googleAiApiKey');
    if (storedApiKey) {
      setApiSettings({ googleAiApiKey: storedApiKey });
      setSavedApiKey(storedApiKey);
    }
  }, []);

  // --- HANDLERS ---

  // Validate and Save API Settings
  const handleSaveApiSettings = async () => {
    if (!apiSettings.googleAiApiKey.trim()) {
      toast.error('Masukkan API key terlebih dahulu.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/test-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiSettings.googleAiApiKey }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem('googleAiApiKey', apiSettings.googleAiApiKey);
        setSavedApiKey(apiSettings.googleAiApiKey);
        toast.success('API key valid dan berhasil disimpan!');
      } else {
        toast.error(result.message || 'API key tidak valid. Gagal menyimpan.');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Terjadi kesalahan saat validasi. Gagal menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApiKey = () => {
    localStorage.removeItem('googleAiApiKey');
    setApiSettings({ googleAiApiKey: '' });
    setSavedApiKey('');
    toast.info('API key telah dihapus.');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <span>Pengaturan</span>
          </h1>
          <p className="text-gray-600">
            Konfigurasi API untuk fitur Generator Jadwal AI
          </p>
        </div>

        <div className="space-y-6">
          {/* Google AI Studio Info */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-medium">
                  Cara Mendapatkan Google AI API Key:
                </p>
                <ol className="text-sm space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">1.</span>
                    <span>
                      Kunjungi{' '}
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
                      >
                        Google AI Studio
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>{' '}
                      dan masuk dengan akun Google Anda.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">2.</span>
                    <span>
                      Klik tombol &quot;Create API key&quot; untuk membuat API
                      key baru.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">3.</span>
                    <span>Salin API key yang telah dibuat.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">4.</span>
                    <span>Tempel API key di form di bawah ini.</span>
                  </li>
                </ol>
                <p className="text-sm text-blue-700 mt-3">
                  <strong>Catatan:</strong> Google AI Studio menyediakan akses
                  gratis ke model Gemini untuk penggunaan dalam batas tertentu.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Konfigurasi API</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key Input */}
              <div className="space-y-2">
                <Label htmlFor="apiKey">Google AI API Key *</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiSettings.googleAiApiKey}
                    onChange={(e) =>
                      setApiSettings((prev) => ({
                        ...prev,
                        googleAiApiKey: e.target.value,
                      }))
                    }
                    placeholder="Masukkan Google AI API Key Anda..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  API key akan disimpan secara lokal di browser Anda dan tidak
                  akan dikirim ke server kami.
                </p>
              </div>
              <div className="flex justify-end pt-2 space-x-2">
                {savedApiKey && (
                  <Button
                    variant="outline"
                    onClick={handleDeleteApiKey}
                    disabled={isSaving}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                )}
                <Button
                  onClick={handleSaveApiSettings}
                  disabled={
                    isSaving ||
                    !apiSettings.googleAiApiKey.trim() ||
                    apiSettings.googleAiApiKey === savedApiKey
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memvalidasi...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan API Key
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
