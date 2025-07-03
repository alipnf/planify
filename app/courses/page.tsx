'use client';

import { CourseModal } from '@/components/course/course-modal';
import { ImportCoursesModal } from '@/components/course/import-course-modal';
import { CourseFilters } from '@/components/course/course-filters';
import { CourseTable } from '@/components/course/course-table';
import { CourseEmptyState } from '@/components/course/course-empty-state';
import { CourseDeleteDialogs } from '@/components/course/course-delete-dialogs';
import { CourseTableSkeleton } from '@/components/course/course-table-skeleton';
import { useCourseManagement } from '@/lib/hooks/use-course-management';

export default function CoursesPage() {
  const courseManagement = useCourseManagement();

  // Check if filters are applied
  const hasFilters =
    courseManagement.searchQuery !== '' ||
    courseManagement.selectedSemester !== 'all' ||
    courseManagement.selectedClass !== 'all';

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
          <CourseFilters
            searchQuery={courseManagement.searchQuery}
            selectedSemester={courseManagement.selectedSemester}
            selectedClass={courseManagement.selectedClass}
            groupByCode={courseManagement.groupByCode}
            availableClasses={courseManagement.availableClasses}
            onSearchChange={courseManagement.setSearchQuery}
            onSemesterChange={courseManagement.setSelectedSemester}
            onClassChange={courseManagement.setSelectedClass}
            onGroupByCodeChange={courseManagement.setGroupByCode}
            onExport={courseManagement.handleExportAll}
            onImport={() => courseManagement.setShowImportModal(true)}
            onAddCourse={courseManagement.handleAddCourse}
          />

          {/* Course Table, Loading State, or Empty State */}
          {courseManagement.isLoading ? (
            <CourseTableSkeleton rows={8} />
          ) : courseManagement.filteredCourses.length === 0 ? (
            <CourseEmptyState
              hasFilters={hasFilters}
              onAddCourse={courseManagement.handleAddCourse}
              onImport={() => courseManagement.setShowImportModal(true)}
            />
          ) : (
            <CourseTable
              courses={courseManagement.filteredCourses}
              selectedCourses={courseManagement.selectedCourses}
              onSelectAll={courseManagement.handleSelectAll}
              onSelectCourse={courseManagement.handleSelectCourse}
              onEditCourse={courseManagement.handleEditCourse}
              onDeleteCourse={courseManagement.handleDeleteCourseClick}
              onBulkDelete={courseManagement.handleBulkDeleteClick}
              allSelected={courseManagement.allSelected}
              someSelected={courseManagement.someSelected}
              groupByCode={courseManagement.groupByCode}
              groupedCourses={courseManagement.groupedCourses}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <CourseModal
        open={courseManagement.showCourseModal}
        onOpenChange={courseManagement.setShowCourseModal}
        course={courseManagement.editingCourse}
        onSave={courseManagement.handleSaveCourse}
      />

      <ImportCoursesModal
        open={courseManagement.showImportModal}
        onOpenChange={courseManagement.setShowImportModal}
        onImport={courseManagement.handleImportCourses}
      />

      {/* Delete Dialogs */}
      <CourseDeleteDialogs
        showDeleteDialog={courseManagement.showDeleteDialog}
        courseToDelete={courseManagement.courseToDelete}
        onDeleteDialogChange={courseManagement.setShowDeleteDialog}
        onConfirmDelete={courseManagement.handleConfirmDelete}
        showBulkDeleteDialog={courseManagement.showBulkDeleteDialog}
        selectedCourseNames={courseManagement.selectedCourseNames}
        selectedCount={courseManagement.selectedCourses.length}
        onBulkDeleteDialogChange={courseManagement.setShowBulkDeleteDialog}
        onConfirmBulkDelete={courseManagement.handleConfirmBulkDelete}
      />
    </>
  );
}
