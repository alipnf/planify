import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Course } from '@/lib/types/course';
import { useSavedSchedulesStore } from '@/lib/stores/saved';
import { z } from 'zod';

export function ImportScheduleDialog() {
  const { showImportDialog, setShowImportDialog, handleImport } =
    useSavedSchedulesStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<Course[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [scheduleName, setScheduleName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Schema yang lebih fleksibel untuk import
  const importedScheduleSchema = z.array(
    z.object({
      id: z.string().optional(),
      code: z.string().min(1, 'Kode mata kuliah harus diisi'),
      name: z.string().min(1, 'Nama mata kuliah harus diisi'),
      lecturer: z.string().min(1, 'Nama dosen harus diisi'),
      credits: z.number().min(1, 'SKS minimal 1').max(20, 'SKS maksimal 20'),
      room: z.string().min(1, 'Ruang harus diisi'),
      day: z.string().min(1, 'Hari harus diisi'),
      startTime: z.string().min(1, 'Waktu mulai harus diisi'),
      endTime: z.string().min(1, 'Waktu selesai harus diisi'),
      semester: z.string().min(1, 'Semester harus diisi'),
      category: z.enum(['wajib', 'pilihan']).optional(),
      class: z.string().min(1, 'Kelas harus diisi'),
    })
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setPreviewData(null);
        setValidationErrors([]);
        setScheduleName('');
        processFile(file);
      } else {
        toast.error('Pilih file JSON yang valid');
        setSelectedFile(null);
      }
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);

    try {
      const text = await file.text();
      const parsedJson = JSON.parse(text);

      if (
        typeof parsedJson !== 'object' ||
        parsedJson === null ||
        Array.isArray(parsedJson) ||
        parsedJson.type !== 'planify-schedule'
      ) {
        setValidationErrors([
          'File tidak valid. Pastikan Anda mengimpor file jadwal yang diekspor dari Planify.',
        ]);
        setPreviewData(null);
        return;
      }

      const data = parsedJson.data;
      const validatedData = importedScheduleSchema.parse(data);

      // Add IDs if missing and ensure category has default value
      const dataWithIds: Course[] = validatedData.map((course) => ({
        ...course,
        id: course.id || crypto.randomUUID(),
        category: course.category || 'wajib',
      }));

      setPreviewData(dataWithIds);
      setValidationErrors([]);
    } catch (err) {
      console.error('Import validation error:', err);

      if (err instanceof z.ZodError) {
        // Extract specific validation errors
        const errors = err.errors.map((error) => {
          const path = error.path.join('.');
          return `${path}: ${error.message}`;
        });
        setValidationErrors(errors);
      } else {
        setValidationErrors([
          'File tidak valid atau format tidak sesuai. Pastikan file adalah JSON yang valid dengan format yang benar.',
        ]);
      }
      setPreviewData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportClick = async () => {
    if (previewData && previewData.length > 0 && scheduleName.trim()) {
      setIsImporting(true);
      try {
        await handleImport(scheduleName.trim(), previewData);
        // Toast dan penutupan modal ditangani oleh parent component
      } catch (error) {
        // Error toast sudah ditangani oleh parent, kita hanya perlu log di sini
        console.error('Gagal melakukan impor:', error);
      } finally {
        setIsImporting(false);
      }
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setValidationErrors([]);
    setIsProcessing(false);
    setScheduleName('');
    setIsImporting(false);
  };

  const handleClose = () => {
    handleReset();
    setShowImportDialog(false);
  };

  return (
    <Dialog open={showImportDialog} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Import Jadwal</span>
          </DialogTitle>
          <DialogDescription>
            Upload file JSON yang berisi data jadwal untuk diimpor ke sistem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="json-file">File JSON *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                id="json-file"
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="json-file"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                {selectedFile ? (
                  <>
                    <FileText className="h-12 w-12 text-blue-500" />
                    <div className="text-sm font-medium">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400" />
                    <div className="text-sm font-medium">
                      Klik untuk upload file JSON
                    </div>
                    <div className="text-xs text-gray-500">
                      Format: .json, maksimal 5MB
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-sm text-gray-600">Memproses file...</span>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Error Validasi</span>
              </div>
              <div className="space-y-1">
                {validationErrors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700">
                    • {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Data */}
          {previewData && previewData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Berhasil memvalidasi {previewData.length} mata kuliah
                </span>
              </div>

              {/* Schedule Name Input */}
              <div className="space-y-2">
                <Label htmlFor="schedule-name">Nama Jadwal *</Label>
                <Input
                  id="schedule-name"
                  type="text"
                  placeholder="Masukkan nama jadwal"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Schedule Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="font-medium">
                    Preview Mata Kuliah yang Akan Diimpor
                  </h4>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {previewData.map((course, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border-b last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{course.name}</div>
                        <div className="text-xs text-gray-600">
                          {course.code} • {course.credits} SKS •{' '}
                          {course.lecturer}
                        </div>
                        <div className="text-xs text-gray-500">
                          {course.day}, {course.startTime} - {course.endTime} •
                          Ruang {course.room}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isImporting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleImportClick}
                  disabled={!scheduleName.trim() || isImporting}
                >
                  {isImporting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Import Jadwal
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
