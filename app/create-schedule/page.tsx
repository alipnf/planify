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

export default function CreateSchedulePage() {
  const [activeTab, setActiveTab] = useState('manual');

  // Course management
  const { courses, isLoading } = useCourseManagement();

  // Schedule management
  const {
    selectedCourses,
    searchQuery,
    filterSemester,
    conflicts,
    stats,
    timeSlots,
    filterCourses,
    toggleCourse,
    getCourseAtTime,
    clearAllSelections,
    setSelectedCoursesDirectly,
    setSearchQuery,
    setFilterSemester,
  } = useScheduleManagement();

  // Filter courses based on search and semester
  const filteredCourses = filterCourses(courses);

  // Handle AI generated schedule
  const handleAIScheduleGenerated = (aiSelectedCourses: Course[]) => {
    setSelectedCoursesDirectly(aiSelectedCourses);
  };

  // Handle save schedule
  const handleSaveSchedule = () => {
    console.log('Save schedule:', selectedCourses);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl min-h-screen">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Course Selection */}
            <div className="lg:col-span-1">
              <CourseSelectionPanel
                courses={filteredCourses}
                selectedCourses={selectedCourses}
                onCourseToggle={toggleCourse}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterSemester={filterSemester}
                onFilterChange={setFilterSemester}
                conflicts={conflicts}
                stats={stats}
                isLoading={isLoading}
              />
            </div>

            {/* Right Column - Schedule View */}
            <div className="lg:col-span-2">
              <WeeklySchedule
                courses={selectedCourses}
                conflicts={conflicts}
                timeSlots={timeSlots}
                getCourseAtTime={getCourseAtTime}
                onResetSchedule={clearAllSelections}
                onSaveSchedule={handleSaveSchedule}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AIScheduler
            courses={courses}
            onScheduleGenerated={handleAIScheduleGenerated}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
