'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hand, Bot } from 'lucide-react';
import { WeeklySchedule } from '@/components/schedule/weekly-schedule';
import { CourseSelectionTable } from '@/components/schedule/course-selection-table';
import { AIScheduler } from '@/components/schedule/ai-scheduler';
import { SaveScheduleDialog } from '@/components/schedule/save-schedule-dialog';
import { useCreateSchedule } from '@/lib/hooks/use-create-schedule';

export default function CreateSchedulePage() {
  const { activeTab, setActiveTab } = useCreateSchedule();

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
            <TabsTrigger
              value="manual"
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Hand className="h-4 w-4" />
              <span>Manual</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Bot className="h-4 w-4" />
              <span>AI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <div className="flex flex-col space-y-6">
              <WeeklySchedule />
              <div className="lg:col-span-1">
                <CourseSelectionTable />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AIScheduler />
          </TabsContent>
        </Tabs>
      </div>
      <SaveScheduleDialog />
    </>
  );
}
