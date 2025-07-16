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
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateCourseData } from '@/lib/interfaces/course';
import { formatTimeRange } from '@/lib/course-utils';
import { CategoryBadge } from '@/components/ui/category-badge';
import { useCoursesStore } from '@/lib/stores/courses';

export function ImportCoursesModal() {
  const { showImportModal, setShowImportModal, handleImportCourses, courses } =
    useCoursesStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<CreateCourseData[] | null>(
    null
  );
  const [duplicateData, setDuplicateData] = useState<CreateCourseData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setPreviewData(null);
        setDuplicateData([]);
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

      // Only accept structured format with type: "planify-courses"
      if (
        typeof data === 'object' &&
        data !== null &&
        !Array.isArray(data) &&
        data.type === 'planify-courses' &&
        Array.isArray(data.data)
      ) {
        // Validate required metadata
        if (typeof data.totalCourses !== 'number') {
          setValidationErrors([
            'Format file tidak valid. File ekspor mata kuliah harus memiliki metadata yang lengkap.',
          ]);
          setPreviewData(null);
          return;
        }

        // Validate that the data array contains course objects with required fields
        const isValidCourseArray = data.data.every((item: unknown) =>
          isValidCourseObject(item)
        );

        if (!isValidCourseArray) {
          setValidationErrors([
            'Format file tidak valid. Data mata kuliah dalam file tidak memiliki struktur yang benar.',
          ]);
          setPreviewData(null);
          return;
        }

        // Additional validation - ensure data is not empty
        if (data.data.length === 0) {
          setValidationErrors([
            'File mata kuliah kosong. Pastikan file berisi data mata kuliah yang valid.',
          ]);
          setPreviewData(null);
          return;
        }

        // Validate that totalCourses matches actual data length
        if (data.totalCourses !== data.data.length) {
          setValidationErrors([
            'Format file tidak valid. Jumlah mata kuliah tidak sesuai dengan data yang ada.',
          ]);
          setPreviewData(null);
          return;
        }

        // Validate and normalize data
        const { validatedData, duplicateData, errors } = validateImportData(
          data.data
        );

        if (errors.length > 0) {
          setValidationErrors(errors);
          setPreviewData(null);
          setDuplicateData([]);
        } else {
          setPreviewData(validatedData);
          setDuplicateData(duplicateData);
          setValidationErrors([]);
        }
      } else {
        setValidationErrors([
          'File tidak valid. Pastikan Anda mengimpor file jadwal yang diekspor dari Planify.',
        ]);
        setPreviewData(null);
        return;
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
    if (typeof value !== 'string') return false;
    const lowercasedValue = value.trim().toLowerCase();
    return lowercasedValue === 'wajib' || lowercasedValue === 'pilihan';
  };

  // Helper function to validate course object structure
  const isValidCourseObject = (item: unknown): boolean => {
    // Check basic structure
    if (typeof item !== 'object' || item === null) return false;

    // Type assertion after null check
    const obj = item as Record<string, unknown>;

    // Check for required fields with proper types and values
    const requiredFields = [
      'code',
      'name',
      'lecturer',
      'credits',
      'room',
      'day',
      'startTime',
      'endTime',
      'semester',
      'category',
      'class',
    ];

    // Ensure all required fields exist
    for (const field of requiredFields) {
      if (!(field in obj)) return false;
    }

    // Validate specific field types and values
    return (
      typeof obj.code === 'string' &&
      obj.code.trim().length >= 3 &&
      typeof obj.name === 'string' &&
      obj.name.trim().length >= 3 &&
      typeof obj.lecturer === 'string' &&
      obj.lecturer.trim().length >= 2 &&
      typeof obj.credits === 'number' &&
      obj.credits >= 1 &&
      obj.credits <= 20 &&
      typeof obj.room === 'string' &&
      obj.room.trim().length >= 1 &&
      typeof obj.day === 'string' &&
      obj.day.trim().length >= 1 &&
      typeof obj.startTime === 'string' &&
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(obj.startTime) &&
      typeof obj.endTime === 'string' &&
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(obj.endTime) &&
      typeof obj.semester === 'string' &&
      obj.semester.trim().length >= 1 &&
      typeof obj.category === 'string' &&
      (obj.category.trim().toLowerCase() === 'wajib' ||
        obj.category.trim().toLowerCase() === 'pilihan') &&
      typeof obj.class === 'string' &&
      obj.class.trim().length >= 1 &&
      // Ensure no extraneous fields that might indicate it's from another app
      Object.keys(obj).length <= 12 // Only allow the expected fields + optional id
    );
  };

  const validateImportData = (
    data: unknown
  ): {
    validatedData: CreateCourseData[] | null;
    duplicateData: CreateCourseData[];
    errors: string[];
  } => {
    const errors: string[] = [];

    // Check if data is array or single object
    let rawCourses: unknown[] = [];
    if (Array.isArray(data)) {
      rawCourses = data;
    } else if (data && typeof data === 'object') {
      rawCourses = [data];
    } else {
      errors.push('Format data tidak valid');
      return { validatedData: null, duplicateData: [], errors };
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
          category: (course.category as string).trim().toLowerCase() as
            | 'wajib'
            | 'pilihan',
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

    // If there are errors, return early
    if (errors.length > 0) {
      return { validatedData: null, duplicateData: [], errors };
    }

    // Check for duplicates against existing courses
    const existingCourses = courses.map(
      (course) => `${course.code}-${course.class}`
    );
    const duplicates: CreateCourseData[] = [];
    const nonDuplicates: CreateCourseData[] = [];

    validatedCourses.forEach((course) => {
      const courseKey = `${course.code}-${course.class}`;
      if (existingCourses.includes(courseKey)) {
        duplicates.push(course);
      } else {
        nonDuplicates.push(course);
      }
    });

    return { validatedData: nonDuplicates, duplicateData: duplicates, errors };
  };

  const handleImport = async () => {
    if (previewData && previewData.length > 0) {
      setIsImporting(true);
      try {
        await handleImportCourses(previewData);
        // Reset hanya jika berhasil (modal sudah tertutup dari store)
        handleReset();
      } catch (error) {
        // Jangan reset jika ada error, biarkan user melihat data dan bisa retry
        console.error('Error importing courses:', error);
      } finally {
        setIsImporting(false);
      }
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setDuplicateData([]);
    setValidationErrors([]);
    setIsProcessing(false);
    setIsImporting(false);
  };

  const handleClose = () => {
    handleReset();
    setShowImportModal(false);
  };

  return (
    <Dialog open={showImportModal} onOpenChange={handleClose}>
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

          {/* Duplicate Data Warning */}
          {duplicateData.length > 0 && (
            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  Data Duplikat Ditemukan
                </span>
              </div>
              <p className="text-sm text-yellow-700 mb-2">
                {duplicateData.length} mata kuliah sudah ada di sistem dan akan
                dilewati:
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {duplicateData.map((course, index) => (
                  <div key={index} className="text-sm text-yellow-600">
                    • {course.code}-{course.class} - {course.name}
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
                  {previewData.length} mata kuliah siap diimpor
                  {duplicateData.length > 0 &&
                    ` (${duplicateData.length} duplikat dilewati)`}
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
                            <CategoryBadge category={course.category} />
                          </div>
                          <div className="text-sm text-gray-700 mb-1">
                            {course.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {course.lecturer} • {course.day},{' '}
                            {formatTimeRange(course.startTime, course.endTime)}{' '}
                            • {course.room}
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
                  setDuplicateData([]);
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
                disabled={isImporting}
                className="bg-primary disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengimpor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Import {previewData.length} Mata Kuliah
                    {duplicateData.length > 0 &&
                      ` (${duplicateData.length} dilewati)`}
                  </>
                )}
              </Button>
            )}

            {/* Show message when all data is duplicate */}
            {(!previewData || previewData.length === 0) &&
              duplicateData.length > 0 && (
                <div className="text-center text-gray-600 text-sm">
                  Semua data yang akan diimpor sudah ada di sistem
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
