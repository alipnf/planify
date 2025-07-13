'use client';

import { CourseModal } from '@/components/course/course-modal';
import { ImportCoursesModal } from '@/components/course/import-course-modal';
import { CourseFilters } from '@/components/course/course-filters';
import { CourseTable } from '@/components/course/course-table';
import { CourseEmptyState } from '@/components/course/course-empty-state';
import { CourseDeleteDialogs } from '@/components/course/course-delete-dialogs';
import { CourseTableSkeleton } from '@/components/course/course-table-skeleton';
import { useCourses } from '@/lib/hooks/use-courses';

export default function CoursesPage() {
  const {
    setShowImportModal,
    handleAddCourse,
    isLoading,
    filteredCourses,
    hasFilters,
  } = useCourses();

  // Call computed functions
  const coursesList = filteredCourses();
  const hasFil = hasFilters();

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Semua Mata Kuliah
            </h1>
            <p className="text-gray-600">
              Kelola daftar mata kuliah yang ditawarkan untuk semester ini
            </p>
          </div>

          {/* Filters */}
          <CourseFilters />

          {/* Course Table, Loading State, or Empty State */}
          {isLoading ? (
            <CourseTableSkeleton rows={8} />
          ) : coursesList.length === 0 ? (
            <CourseEmptyState
              hasFilters={hasFil}
              onAddCourse={handleAddCourse}
              onImport={() => setShowImportModal(true)}
            />
          ) : (
            <CourseTable />
          )}
        </div>
      </div>

      {/* Modals */}
      <CourseModal />

      <ImportCoursesModal />

      {/* Delete Dialogs */}
      <CourseDeleteDialogs />
    </>
  );
}
