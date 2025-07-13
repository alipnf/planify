import {
  Wand2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Course } from '@/lib/types/course';
import { detectTimeConflicts, daysOfWeek } from '@/lib/schedule-utils';
import { formatTimeRange } from '@/lib/course-utils';
import { WeeklySchedule } from './weekly-schedule';
import { Textarea } from '../ui/textarea';
import { CategoryBadge } from '../ui/category-badge';
import { useCoursesStore } from '@/lib/stores/courses';
import { useCreateSchedule } from '@/lib/hooks/use-create-schedule';

interface SchedulePreferences {
  targetCredits: number;
  maxDailyCredits: number;
  preferredStartTime: string;
  preferredEndTime: string;
  offDays: string[];
  requiredCourses: string[];
  avoidedCourses: string[];
}

interface ScheduleOptionView {
  id: number;
  courses: Course[];
  totalCredits: number;
}

export function AIScheduler() {
  const { courses, isLoading } = useCoursesStore();
  const { handleAIEdit, handleAISave } = useCreateSchedule();

  const preferences: SchedulePreferences = {
    targetCredits: 20,
    maxDailyCredits: 8,
    preferredStartTime: '08:00',
    preferredEndTime: '18:00',
    offDays: [],
    requiredCourses: [],
    avoidedCourses: [],
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOptionView[]>(
    []
  );
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [previewCourses, setPreviewCourses] = useState<Course[]>([]);
  const [prompt, setPrompt] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate schedule options via Gemini API
  const generateScheduleOptions = async () => {
    if (courses.length === 0) return;

    setIsGenerating(true);
    setScheduleOptions([]);
    setSelectedOptionId(null);
    setPreviewCourses([]);
    setErrorMessage(null);

    try {
      // Get the API key from local storage. It's okay if it's null.
      const apiKey = localStorage.getItem('googleAiApiKey');

      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courses,
          preferences,
          userPrompt: prompt,
          apiKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error || 'Terjadi kesalahan saat membuat jadwal.'
        );
        console.error('Error generating schedule options:', result.details);
        return;
      }
      const schedules = result.options as Course[][];
      const mappedOptions: ScheduleOptionView[] = schedules.map(
        (courseArr: Course[], index: number) => ({
          id: index + 1,
          courses: courseArr,
          totalCredits: courseArr.reduce(
            (sum: number, c: Course) => sum + c.credits,
            0
          ),
        })
      );
      setScheduleOptions(mappedOptions);
    } catch (error) {
      setErrorMessage('Gagal terhubung ke server. Silakan coba lagi.');
      console.error('Error generating schedule options:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate free days based on returned schedule (case-insensitive)
  const getFreeDays = (schedule: Course[]): string[] => {
    const usedDays = schedule.map((c) => c.day.trim().toLowerCase());
    return daysOfWeek.filter((day) => {
      return !usedDays.includes(day.trim().toLowerCase());
    });
  };

  const handlePreviewOption = (option: ScheduleOptionView) => {
    setPreviewCourses(option.courses);
    setSelectedOptionId(option.id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const previewConflicts = detectTimeConflicts(previewCourses);

  return (
    <div className="space-y-6">
      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Generator Jadwal AI</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt-input">
                Deskripsikan preferensi jadwal Anda
              </Label>
              <Textarea
                id="prompt-input"
                placeholder="Contoh: 'saya ingin kelas dimulai jam 8 pagi, hindari kelas di hari jumat, prioritaskan mata kuliah wajib, target 20 SKS, lebih suka lab komputer'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          {/* Generate Button */}
          <Button
            onClick={generateScheduleOptions}
            disabled={
              isGenerating || courses.length === 0 || prompt.trim() === ''
            }
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat Opsi Jadwal...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Buat Opsi Jadwal
              </>
            )}
          </Button>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              AI akan menghasilkan 3-5 opsi jadwal berdasarkan preferensi Anda.
              Klik &quot;Pratinjau&quot; untuk melihat jadwal, lalu &quot;Pilih
              & Simpan&quot; untuk menyimpan.
            </AlertDescription>
          </Alert>
          {/* Debug UI removed */}
        </CardContent>
      </Card>

      {/* Schedule Options and Preview */}
      {scheduleOptions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Schedule Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Opsi Jadwal yang Dihasilkan
            </h3>

            {scheduleOptions.map((option) => {
              const isSelected = selectedOptionId === option.id;

              return (
                <Card
                  key={option.id}
                  className={`${isSelected ? 'ring-2 ring-blue-500 border-blue-200' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Opsi {option.id}
                        {isSelected && (
                          <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                        )}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {option.totalCredits}
                        </div>
                        <div className="text-xs text-gray-600">Total SKS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {option.courses.length}
                        </div>
                        <div className="text-xs text-gray-600">Mata Kuliah</div>
                      </div>
                    </div>

                    {/* Free Days */}
                    {(() => {
                      const freeDays = getFreeDays(option.courses);
                      return freeDays.length > 0 ? (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-sm font-medium text-green-800 mb-1">
                            Hari Libur:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {freeDays.map((day: string) => (
                              <span
                                key={day}
                                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full"
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="text-sm font-medium text-orange-800">
                            Tidak ada hari libur
                          </div>
                        </div>
                      );
                    })()}

                    {/* Course List */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {option.courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-2 bg-white border rounded text-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{course.name}</div>
                            <div className="text-xs text-gray-500">
                              {course.code} • Kelas {course.class} •{' '}
                              {course.day} •{' '}
                              {formatTimeRange(
                                course.startTime,
                                course.endTime
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {course.credits} SKS
                            </span>
                            <CategoryBadge
                              category={course.category}
                              className="text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePreviewOption(option)}
                        className="flex-1"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Pratinjau
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAIEdit(option.courses)}
                        className="flex-1"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleAISave(option.courses)}
                        className="flex-1"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Simpan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Right Column - Schedule Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Pratinjau Jadwal
              {selectedOptionId && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Opsi {selectedOptionId})
                </span>
              )}
            </h3>

            {previewCourses.length > 0 ? (
              <WeeklySchedule
                courses={previewCourses}
                conflicts={previewConflicts}
                showActions={false}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg font-medium mb-2">
                      Belum Ada Pratinjau
                    </h4>
                    <p className="text-sm">
                      Klik &quot;Pratinjau&quot; pada salah satu opsi jadwal
                      untuk melihat tampilannya
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
