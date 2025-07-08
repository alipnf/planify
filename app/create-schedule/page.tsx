'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hand, Bot } from 'lucide-react';
import { WeeklySchedule } from '@/components/schedule/weekly-schedule';
import { CourseSelectionPanel } from '@/components/schedule/course-selection-panel';
import { AIScheduler } from '@/components/schedule/ai-scheduler';
import { useCourseManagement } from '@/lib/hooks/use-course-management';
import { useScheduleManagement } from '@/lib/hooks/use-schedule-management';
import { Course } from '@/lib/types/course';
import { SaveScheduleDialog } from '@/components/schedule/save-schedule-dialog';
import { saveSchedule } from '@/lib/services/schedules';
import { useMessage } from '@/lib/hooks/use-message';

export default function CreateSchedulePage() {
  const [activeTab, setActiveTab] = useState('manual');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useMessage();

  // Course management
  const { courses, isLoading } = useCourseManagement();

  // Schedule management
  const {
    selectedCourses,
    searchQuery,
    filterSemester,
    filterClass,
    groupByCode,
    conflicts,
    stats,
    filterCourses,
    toggleCourse,
    clearAllSelections,
    setSelectedCoursesDirectly,
    setSearchQuery,
    setFilterSemester,
    setFilterClass,
    setGroupByCode,
  } = useScheduleManagement();

  // Filter courses based on search and semester
  const filteredCourses = filterCourses(courses);

  // Handle AI schedule "Edit" action
  const handleAIEdit = (aiSelectedCourses: Course[]) => {
    setSelectedCoursesDirectly(aiSelectedCourses);
    setActiveTab('manual');
  };

  // Handle AI schedule "Save" action
  const handleAISave = (aiSelectedCourses: Course[]) => {
    setSelectedCoursesDirectly(aiSelectedCourses);
    if (aiSelectedCourses.length === 0) {
      showError('Jadwal yang dipilih kosong.');
      return;
    }
    setIsDialogOpen(true);
  };

  // Handle save schedule (used by manual save button)
  const handleSaveSchedule = () => {
    if (selectedCourses.length === 0) {
      showError('Tidak ada mata kuliah yang dipilih untuk disimpan.');
      return;
    }
    setIsDialogOpen(true);
  };

  const handleConfirmSave = async (scheduleName: string) => {
    setIsSaving(true);
    try {
      await saveSchedule(scheduleName, selectedCourses);
      showSuccess(`Jadwal "${scheduleName}" berhasil disimpan.`);
      setIsDialogOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan tidak dikenal.';
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Buat Jadwal Kuliah</h1>
          <p className="text-gray-600">
            Pilih metode pembuatan jadwal: manual atau dengan bantuan AI.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <Hand className="h-4 w-4" />
              <span>Manual</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>AI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <div className="flex flex-col space-y-6">
              {/* Course Selection Panel now on top */}
              <div className="lg:col-span-1">
                <CourseSelectionPanel
                  courses={filteredCourses}
                  selectedCourses={selectedCourses}
                  onCourseToggle={toggleCourse}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filterSemester={filterSemester}
                  onFilterChange={setFilterSemester}
                  filterClass={filterClass}
                  onClassChange={setFilterClass}
                  groupByCode={groupByCode}
                  onGroupByCodeChange={setGroupByCode}
                  conflicts={conflicts}
                  stats={stats}
                  isLoading={isLoading}
                />
              </div>

              {/* Weekly Schedule now below */}
              <WeeklySchedule
                courses={selectedCourses}
                conflicts={conflicts}
                onResetSchedule={clearAllSelections}
                onSaveSchedule={handleSaveSchedule}
              />
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AIScheduler
              courses={courses}
              onEdit={handleAIEdit}
              onSave={handleAISave}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
      <SaveScheduleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleConfirmSave}
        isSaving={isSaving}
      />
    </>
  );
}
