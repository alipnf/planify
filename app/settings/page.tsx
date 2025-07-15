'use client';

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
import { useSettingsStore, initializeTempApiKey } from '@/lib/stores/settings';
import { useEffect } from 'react';

export default function SettingsPage() {
  const {
    savedApiKey,
    tempApiKey,
    showApiKey,
    isSaving,
    setShowApiKey,
    setTempApiKey,
    handleSaveApiSettings,
    handleDeleteApiKey,
  } = useSettingsStore();

  useEffect(() => {
    initializeTempApiKey();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="mr-3 text-blue-600" />
            Pengaturan
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola pengaturan API Key Anda untuk fitur-fitur AI.
          </p>
        </header>
        <div className="space-y-6 max-w-3xl mx-auto">
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

          {/* API Key Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-blue-600" />
                <span>Google AI API Key</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="Masukkan Google AI API Key Anda..."
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                    isSaving || !tempApiKey.trim() || tempApiKey === savedApiKey
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
