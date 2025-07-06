import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { CreateCourseData } from '@/lib/types/course';

interface ImportCoursesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (courses: CreateCourseData[]) => void;
}

export function ImportCoursesModal({
  open,
  onOpenChange,
  onImport,
}: ImportCoursesModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<CreateCourseData[] | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setPreviewData(null);
        setValidationErrors([]);
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
      const data = JSON.parse(text);

      // Check if it's a schedule file
      if (
        typeof data === 'object' &&
        data !== null &&
        !Array.isArray(data) &&
        data.type === 'planify-schedule'
      ) {
        setValidationErrors([
          'File ini adalah file jadwal, bukan file mata kuliah. Silakan gunakan fitur "Impor Jadwal".',
        ]);
        setPreviewData(null);
        return;
      }

      // Validate and normalize data
      const { validatedData, errors } = validateImportData(data);

      if (errors.length > 0) {
        setValidationErrors(errors);
        setPreviewData(null);
      } else {
        setPreviewData(validatedData);
        setValidationErrors([]);
      }
    } catch {
      setValidationErrors(['File JSON tidak valid atau rusak']);
      setPreviewData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Type guard functions
  const isValidString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
  };

  const isValidNumber = (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value);
  };

  const isValidCategory = (value: unknown): value is 'wajib' | 'pilihan' => {
    return value === 'wajib' || value === 'pilihan';
  };

  const validateImportData = (
    data: unknown
  ): { validatedData: CreateCourseData[] | null; errors: string[] } => {
    const errors: string[] = [];

    // Check if data is array or single object
    let rawCourses: unknown[] = [];
    if (Array.isArray(data)) {
      rawCourses = data;
    } else if (data && typeof data === 'object') {
      rawCourses = [data];
    } else {
      errors.push('Format data tidak valid');
      return { validatedData: null, errors };
    }

    const validatedCourses: CreateCourseData[] = [];

    rawCourses.forEach((rawCourse, index) => {
      const courseErrors: string[] = [];
      const courseIndex = index + 1;

      // Type assertion to access properties
      const course = rawCourse as Record<string, unknown>;

      // Validate required fields
      if (!isValidString(course.code)) {
        courseErrors.push(
          `Mata kuliah ${courseIndex}: Kode mata kuliah tidak valid`
        );
      }

      if (!isValidString(course.name)) {
        courseErrors.push(
          `Mata kuliah ${courseIndex}: Nama mata kuliah tidak valid`
        );
      }

      if (!isValidString(course.lecturer)) {
        courseErrors.push(`Mata kuliah ${courseIndex}: Nama dosen tidak valid`);
      }

      if (
        !isValidNumber(course.credits) ||
        course.credits < 1 ||
        course.credits > 20
      ) {
        courseErrors.push(
          `Mata kuliah ${courseIndex}: SKS tidak valid (harus 1-20)`
        );
      }

      if (!isValidString(course.room)) {
        courseErrors.push(`Mata kuliah ${courseIndex}: Ruang tidak valid`);
      }

      if (!isValidString(course.day)) {
        courseErrors.push(`Mata kuliah ${courseIndex}: Hari tidak valid`);
      }

      if (!isValidString(course.startTime) || !isValidString(course.endTime)) {
        courseErrors.push(`Mata kuliah ${courseIndex}: Waktu tidak valid`);
      }

      if (!isValidString(course.semester)) {
        courseErrors.push(`Mata kuliah ${courseIndex}: Semester tidak valid`);
      }

      if (!isValidCategory(course.category)) {
        courseErrors.push(
          `Mata kuliah ${courseIndex}: Kategori tidak valid (harus 'wajib' atau 'pilihan')`
        );
      }

      if (!isValidString(course.class)) {
        courseErrors.push(`Mata kuliah ${courseIndex}: Kelas tidak valid`);
      }

      if (courseErrors.length === 0) {
        // Create validated course data (no ID needed for import)
        const validatedCourse: CreateCourseData = {
          code: course.code as string,
          name: course.name as string,
          lecturer: course.lecturer as string,
          credits: course.credits as number,
          room: course.room as string,
          day: course.day as string,
          startTime: course.startTime as string,
          endTime: course.endTime as string,
          semester: course.semester as string,
          category: course.category as 'wajib' | 'pilihan',
          class: course.class as string,
        };
        validatedCourses.push(validatedCourse);
      } else {
        errors.push(...courseErrors);
      }
    });

    if (validatedCourses.length === 0 && errors.length === 0) {
      errors.push('Tidak ada mata kuliah valid yang ditemukan');
    }

    return { validatedData: validatedCourses, errors };
  };

  const handleImport = () => {
    if (previewData && previewData.length > 0) {
      onImport(previewData);
      handleReset();
      toast.success(`${previewData.length} mata kuliah berhasil diimpor`);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setValidationErrors([]);
    setIsProcessing(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Import Mata Kuliah</span>
          </DialogTitle>
          <DialogDescription>
            Upload file JSON yang berisi data mata kuliah untuk diimpor ke
            sistem
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
              <div className="space-y-1 max-h-40 overflow-y-auto">
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
                      className="px-4 py-3 border-b last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {course.code}-{course.class}
                            </span>
                            <span className="text-sm text-gray-600">
                              • {course.credits} SKS
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                course.category === 'wajib'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {course.category === 'wajib'
                                ? 'Wajib'
                                : 'Pilihan'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 mb-1">
                            {course.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {course.lecturer} • {course.day}, {course.startTime}
                            -{course.endTime} • {course.room}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>

            {selectedFile && !isProcessing && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewData(null);
                  setValidationErrors([]);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}

            {previewData && previewData.length > 0 && (
              <Button
                onClick={handleImport}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Import {previewData.length} Mata Kuliah
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
