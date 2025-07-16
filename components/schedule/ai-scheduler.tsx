import {
  Wand2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  Save,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Course } from '@/lib/interfaces/course';
import { SchedulePreferences } from '@/lib/interfaces/schedule';
import { detectTimeConflicts, daysOfWeek } from '@/lib/schedule-utils';
import { WeeklySchedule } from './weekly-schedule';
import { Textarea } from '../ui/textarea';
import { CourseCard } from '../ui/course-card';
import { useCoursesStore } from '@/lib/stores/courses';
import { useCreateSchedule } from '@/lib/hooks/use-create-schedule';
import { useSettingsStore } from '@/lib/stores/settings';

export function AIScheduler() {
  const { courses } = useCoursesStore();
  const { savedApiKey } = useSettingsStore();
  const {
    handleAIEdit,
    handleAISave,
    // AI state from store
    aiPrompt,
    isGenerating,
    scheduleOptions,
    selectedOptionId,
    previewCourses,
    errorMessage,
    showApiKeyAlert,
    // AI actions from store
    setAiPrompt,
    setIsGenerating,
    setScheduleOptions,
    setSelectedOptionId,
    setPreviewCourses,
    setErrorMessage,
    setShowApiKeyAlert,
  } = useCreateSchedule();
  const router = useRouter();

  const preferences: SchedulePreferences = {
    targetCredits: 20,
    maxDailyCredits: 8,
    preferredStartTime: '08:00',
    preferredEndTime: '18:00',
    offDays: [],
    requiredCourses: [],
    avoidedCourses: [],
  };

  // Generate schedule options via Gemini API
  const generateScheduleOptions = async () => {
    if (courses.length === 0) return;

    setIsGenerating(true);
    setScheduleOptions([]);
    setSelectedOptionId(null);
    setPreviewCourses([]);
    setErrorMessage(null);

    try {
      // Get the API key from settings store. It's okay if it's null.
      const apiKey = savedApiKey;

      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courses,
          preferences,
          userPrompt: aiPrompt,
          apiKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle API key not configured error
        if (
          response.status === 400 &&
          result.error?.includes('API key tidak dikonfigurasi')
        ) {
          setShowApiKeyAlert(true);
          setErrorMessage(null);
          return;
        }

        // Handle server error
        if (response.status === 500) {
          setShowApiKeyAlert(true);
          setErrorMessage(null);
          console.error(
            'Server error generating schedule options:',
            result.details
          );
          return;
        }

        // Handle other errors
        setErrorMessage(
          result.error || 'Terjadi kesalahan saat membuat jadwal.'
        );
        console.error('Error generating schedule options:', result.details);
        return;
      }
      const schedules = result.options as Course[][];
      const mappedOptions = schedules.map(
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
      setShowApiKeyAlert(true);
      setErrorMessage(null);
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

  const handlePreviewOption = (option: {
    id: number;
    courses: Course[];
    totalCredits: number;
  }) => {
    setPreviewCourses(option.courses);
    setSelectedOptionId(option.id);
  };

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
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          {/* Generate Button */}
          <Button
            onClick={generateScheduleOptions}
            disabled={
              isGenerating || courses.length === 0 || aiPrompt.trim() === ''
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
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {showApiKeyAlert && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center">
                {savedApiKey ? (
                  <span>Server sedang sibuk</span>
                ) : (
                  <>
                    <span>
                      Server sedang sibuk, silahkan custom api gemini di
                      pengaturan.
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push('/settings');
                        setShowApiKeyAlert(false);
                      }}
                      className="ml-auto"
                    >
                      <Settings className="mr-1 h-3 w-3" />
                      Pengaturan
                    </Button>
                  </>
                )}
              </AlertDescription>
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
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {option.courses.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          variant="minimal"
                          className="hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-end space-x-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {course.credits} SKS
                            </span>
                          </div>
                        </CourseCard>
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
