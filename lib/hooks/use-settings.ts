'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { APISettings } from '@/lib/types/settings';

export const useSettings = () => {
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

  const handleApiKeyChange = (value: string) => {
    setApiSettings((prev) => ({
      ...prev,
      googleAiApiKey: value,
    }));
  };

  return {
    apiSettings,
    savedApiKey,
    showApiKey,
    isSaving,
    setShowApiKey,
    handleSaveApiSettings,
    handleDeleteApiKey,
    handleApiKeyChange,
  };
};
